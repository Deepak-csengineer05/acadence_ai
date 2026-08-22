import uuid
import asyncio
from typing import List, Dict
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer

from app.core.config import settings

# Initialize SentenceTransformer globally for embedding generation
print("[*] Loading embedding model: all-MiniLM-L6-v2...")
embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
print("[+] Embedding model loaded successfully.")

# Initialize Qdrant Client (supports remote Client-Server / Qdrant Cloud or local disk fallback)
if settings.QDRANT_URL:
    print(f"[*] Initializing Client-Server Qdrant Connection at: {settings.QDRANT_URL}")
    qdrant_client = QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
    )
else:
    print(f"[*] Initializing local Qdrant DB storage at: {settings.QDRANT_DIR}")
    qdrant_client = QdrantClient(path=str(settings.QDRANT_DIR))

COLLECTION_NAME = "acadence_docs"

# Ensure collection exists on startup
try:
    if not qdrant_client.collection_exists(collection_name=COLLECTION_NAME):
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(
                size=384,  # all-MiniLM-L6-v2 generates 384-dimensional dense vectors
                distance=qmodels.Distance.COSINE
            )
        )
        print(f"[+] Qdrant collection '{COLLECTION_NAME}' created successfully.")
    else:
        print(f"[+] Qdrant collection '{COLLECTION_NAME}' already exists.")
except Exception as e:
        print(f"[!] Error initializing Qdrant collection: {e}")

class VectorService:
    @staticmethod
    def get_embeddings(text: str) -> List[float]:
        """Synchronous dense vector generation."""
        return embedding_model.encode(text).tolist()

    @staticmethod
    async def async_get_embeddings(text: str) -> List[float]:
        """Asynchronous non-blocking embedding generation offloaded to thread pool."""
        return await asyncio.to_thread(VectorService.get_embeddings, text)

    @staticmethod
    def add_document_chunks(chunks: List[Dict]):
        """
        Upserts document chunks into Qdrant collection.
        Each chunk dict should contain:
        - "id": unique UUID/string
        - "text": string chunk content
        - "metadata": dict with document_id, course_id, category_id, title, is_project, is_interview, etc.
        """
        points = []
        for ch in chunks:
            vector = VectorService.get_embeddings(ch["text"])
            points.append(
                qmodels.PointStruct(
                    id=ch["id"],
                    vector=vector,
                    payload={
                        "text": ch["text"],
                        **ch["metadata"]
                    }
                )
            )
            
        qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )

    @staticmethod
    def search(query_text: str, limit: int = 5, filters: Dict = None) -> List[Dict]:
        """
        Searches Qdrant for semantic matches.
        Supports filtering by metadata (course_id, category_id, company_name, is_project, is_interview).
        """
        query_vector = VectorService.get_embeddings(query_text)
        
        qdrant_filter = None
        if filters:
            conditions = []
            for key, val in filters.items():
                if val is not None:
                    conditions.append(
                        qmodels.FieldCondition(
                            key=key,
                            match=qmodels.MatchValue(value=val)
                        )
                    )
            if conditions:
                qdrant_filter = qmodels.Filter(must=conditions)
                
        results = qdrant_client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_vector,
            query_filter=qdrant_filter,
            limit=limit
        )
        
        output = []
        for r in results:
            output.append({
                "score": r.score,
                "text": r.payload.get("text"),
                "document_id": r.payload.get("document_id"),
                "interview_id": r.payload.get("interview_id"),
                "title": r.payload.get("title", "Resource"),
                "uploader_name": r.payload.get("uploader_name", "Contributor"),
                "course_code": r.payload.get("course_code"),
                "company_name": r.payload.get("company_name")
            })
        return output

    @staticmethod
    def delete_document_vectors(document_id: int):
        """Removes all chunks corresponding to a specific document ID."""
        qdrant_client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="document_id",
                        match=qmodels.MatchValue(value=document_id)
                    )
                ]
            )
        )

    @staticmethod
    def delete_interview_vectors(interview_id: int):
        """Removes all chunks corresponding to a specific interview ID."""
        qdrant_client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="interview_id",
                        match=qmodels.MatchValue(value=interview_id)
                    )
                ]
            )
        )
