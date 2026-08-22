import os
import uuid
import json
import httpx
import pypdf
import docx2txt
from typing import List, Generator, Tuple, Dict
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.vector_service import VectorService
from app.models import Document, Course, Category, InterviewExperience, SearchLog, User

class RAGService:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extracts plain text from PDF, DOCX, TXT, or MD files."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found at: {file_path}")
            
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".pdf":
            text = ""
            try:
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e:
                print(f"[!] Error parsing PDF: {e}")
            return text
            
        elif ext == ".docx":
            try:
                return docx2txt.process(file_path)
            except Exception as e:
                print(f"[!] Error parsing DOCX: {e}")
                return ""
                
        elif ext in [".txt", ".md"]:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except Exception as e:
                print(f"[!] Error reading text file: {e}")
                return ""
        else:
            return ""

    @staticmethod
    def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Splits raw text into overlapping semantic text chunks."""
        chunks = []
        if not text or len(text.strip()) == 0:
            return chunks
            
        # Clean text
        text = " ".join(text.split())
        
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = min(start + chunk_size, text_len)
            
            # Find a nearby word boundary if possible, to avoid cutting words
            if end < text_len:
                boundary = text.rfind(" ", start, end)
                if boundary != -1 and boundary > start + (chunk_size // 2):
                    end = boundary
                    
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap if end < text_len else text_len
            if start >= text_len or end == text_len:
                break
                
        return chunks

    @staticmethod
    async def get_ai_tags(file_content_sample: str) -> str:
        """
        Analyzes a sample of the document using Groq/OpenAI Cloud API or local Ollama
        and generates 3-5 relevant comma-separated tags.
        """
        sample = file_content_sample[:1500]
        prompt = (
            "Analyze the following document excerpt and generate 3 to 5 highly relevant keyword tags "
            "representing subjects, technologies, or topics. "
            "Return ONLY a comma-separated list of tags. Do not write introductory words or punctuation.\n\n"
            f"Excerpt:\n{sample}\n\nTags:"
        )

        if settings.GROQ_API_KEY or settings.OPENAI_API_KEY:
            use_groq = bool(settings.GROQ_API_KEY)
            api_url = "https://api.groq.com/openai/v1/chat/completions" if use_groq else "https://api.openai.com/v1/chat/completions"
            api_key = settings.GROQ_API_KEY if use_groq else settings.OPENAI_API_KEY
            model_name = "llama-3.3-70b-versatile" if use_groq else "gpt-4o-mini"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            }
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.post(api_url, headers=headers, json=payload, timeout=30.0)
                    if resp.status_code == 200:
                        tags_text = resp.json()["choices"][0]["message"]["content"].strip()
                        return tags_text.replace("\n", "").replace("Tags:", "").strip()
            except Exception as e:
                print(f"[!] Cloud AI tagging failed: {e}")
        
        # Local Ollama Fallback
        url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.2}
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=60.0)
                if response.status_code == 200:
                    tags_text = response.json().get("response", "").strip()
                    return tags_text.replace("\n", "").replace("Tags:", "").strip()
        except Exception as e:
            print(f"[!] Ollama tagging failed: {e}")
            
        return "Academic, Study Material"

    @staticmethod
    def perform_hybrid_search(
        db: Session,
        query: str,
        category_id: int = None,
        course_id: int = None,
        company_name: str = None,
        explore_by: str = None,
        advanced_filters: Dict = None,
        limit: int = 5
    ) -> List[Dict]:
        """
        Performs hybrid retrieval:
        1. Queries relational DB using keyword filters.
        2. Queries Qdrant using vector embeddings.
        3. Merges and deduplicates results.
        """
        db_docs = []
        db_interviews = []
        
        doc_query = db.query(Document).filter(Document.status == "APPROVED")
        if category_id:
            doc_query = doc_query.filter(Document.category_id == category_id)
        if course_id:
            doc_query = doc_query.filter(Document.course_id == course_id)
            
        if query:
            doc_query = doc_query.filter(
                (Document.title.contains(query)) | (Document.tags.contains(query))
            )
            
        if explore_by:
            if explore_by == "Projects":
                doc_query = doc_query.filter(Document.is_project == True)
                
        if advanced_filters:
            dept = advanced_filters.get("department")
            if dept:
                doc_query = doc_query.join(Course).filter(Course.department.contains(dept))
            difficulty = advanced_filters.get("difficulty")
            if difficulty:
                doc_query = doc_query.filter(Document.tags.contains(difficulty))
                
        db_docs = doc_query.limit(limit).all()
        
        if company_name or (explore_by == "Interview Experiences"):
            int_query = db.query(InterviewExperience).filter(InterviewExperience.status == "APPROVED")
            if company_name:
                int_query = int_query.filter(InterviewExperience.company_name.icontains(company_name))
            if query:
                int_query = int_query.filter(
                    (InterviewExperience.company_name.icontains(query)) |
                    (InterviewExperience.role.icontains(query)) |
                    (InterviewExperience.technical_questions.contains(query)) |
                    (InterviewExperience.coding_questions.contains(query))
                )
            db_interviews = int_query.limit(limit).all()

        vector_filters = {}
        if category_id:
            vector_filters["category_id"] = category_id
        if course_id:
            vector_filters["course_id"] = course_id
        if company_name:
            vector_filters["company_name"] = company_name
            
        vector_results = VectorService.search(query_text=query, limit=limit, filters=vector_filters) if query else []

        merged_results = {}
        
        for r in vector_results:
            key = f"doc_{r['document_id']}" if r["document_id"] else f"int_{r['interview_id']}"
            merged_results[key] = {
                "id": r["document_id"] or r["interview_id"],
                "type": "document" if r["document_id"] else "interview",
                "title": r["title"],
                "uploader_name": r["uploader_name"],
                "course_code": r["course_code"],
                "company_name": r["company_name"],
                "matching_chunk": r["text"],
                "relevance_score": round(r["score"] * 100, 1)
            }
            
        for d in db_docs:
            key = f"doc_{d.id}"
            if key not in merged_results:
                merged_results[key] = {
                    "id": d.id,
                    "type": "document",
                    "title": d.title,
                    "uploader_name": d.uploader.full_name if d.uploader else "Contributor",
                    "course_code": d.course.code if d.course else "GENERAL",
                    "company_name": None,
                    "matching_chunk": "Keyword metadata matches database record.",
                    "relevance_score": 100.0
                }
                
        for i in db_interviews:
            key = f"int_{i.id}"
            if key not in merged_results:
                merged_results[key] = {
                    "id": i.id,
                    "type": "interview",
                    "title": f"Interview Experience at {i.company_name} ({i.role})",
                    "uploader_name": i.uploader.full_name if i.uploader else "Contributor",
                    "course_code": None,
                    "company_name": i.company_name,
                    "matching_chunk": "Keyword matches company or role records.",
                    "relevance_score": 100.0
                }
                
        return list(merged_results.values())[:limit]

    @staticmethod
    async def generate_chatbot_response_stream(
        query: str,
        history: List[Dict],
        db: Session,
        user_id: int = None
    ) -> Generator[str, None, None]:
        """
        Streams answers using Fast Cloud LLM (Groq / OpenAI) or local Ollama with RAG grounding chunks.
        """
        chunks = VectorService.search(query, limit=4)
        
        context_str = ""
        citations = []
        seen_citations = set()
        for idx, chunk in enumerate(chunks, 1):
            source_info = ""
            if chunk["document_id"]:
                key = f"doc_{chunk['document_id']}"
                source_info = f"Source: {chunk['title']} (Doc ID: {chunk['document_id']})"
                if key not in seen_citations:
                    seen_citations.add(key)
                    citations.append({
                        "index": len(citations) + 1,
                        "id": chunk["document_id"],
                        "type": "document",
                        "title": chunk["title"]
                    })
            else:
                key = f"int_{chunk['interview_id']}"
                source_info = f"Source: {chunk['company_name']} Interview (ID: {chunk['interview_id']})"
                if key not in seen_citations:
                    seen_citations.add(key)
                    citations.append({
                        "index": len(citations) + 1,
                        "id": chunk["interview_id"],
                        "type": "interview",
                        "title": f"Interview at {chunk['company_name']}"
                    })
                
            context_str += f"\n--- CHUNK {idx} [{source_info}] ---\n{chunk['text']}\n"

        history_str = ""
        for h in history[-4:]:
            role = "User" if h.get("role") == "user" else "Assistant"
            history_str += f"{role}: {h.get('content')}\n"

        system_instruction = (
            "You are Senior AI, a brilliant university academic advisor and knowledge coordinator.\n"
            "Your task is to answer the user's question relying ONLY on the provided chunks of context.\n"
            "If the context does not contain the answer, politely say: 'I don't find this information in my knowledge database. Can you help by uploading relevant resources?'\n"
            "When referencing fact details from context, append the chunk citation number (e.g., [1], [2]).\n"
            "Do not hallucinate or make up facts. Keep your tone encouraging and professional.\n"
        )
        
        prompt = (
            f"{system_instruction}\n"
            f"Here is the context data:\n{context_str}\n"
            f"Chat History:\n{history_str}"
            f"Question:\n{query}\n\n"
            f"Answer:"
        )

        was_successful = len(chunks) > 0
        total_tokens = 0
        
        use_groq = bool(settings.GROQ_API_KEY)
        use_openai = bool(settings.OPENAI_API_KEY) and not use_groq

        if use_groq or use_openai:
            api_url = "https://api.groq.com/openai/v1/chat/completions" if use_groq else "https://api.openai.com/v1/chat/completions"
            api_key = settings.GROQ_API_KEY if use_groq else settings.OPENAI_API_KEY
            model_name = "llama-3.3-70b-versatile" if use_groq else "gpt-4o-mini"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": f"Context:\n{context_str}\n\nChat History:\n{history_str}\n\nQuestion: {query}"}
            ]
            payload = {
                "model": model_name,
                "messages": messages,
                "stream": True,
                "temperature": 0.2
            }
            try:
                async with httpx.AsyncClient() as client:
                    async with client.stream("POST", api_url, headers=headers, json=payload, timeout=60.0) as response:
                        if response.status_code == 200:
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    data_str = line[6:].strip()
                                    if data_str == "[DONE]":
                                        break
                                    try:
                                        chunk_data = json.loads(data_str)
                                        delta = chunk_data.get("choices", [{}])[0].get("delta", {})
                                        content = delta.get("content", "")
                                        if content:
                                            total_tokens += 1
                                            yield content
                                    except Exception:
                                        pass
                        else:
                            yield f"\n[!] Cloud AI API returned status code: {response.status_code}\n"
            except Exception as e:
                yield f"\n[!] Cloud AI API error: {e}\n"
                was_successful = False
        else:
            url = f"{settings.OLLAMA_BASE_URL}/api/generate"
            payload = {
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": True
            }
            try:
                async with httpx.AsyncClient() as client:
                    async with client.stream("POST", url, json=payload, timeout=120.0) as response:
                        if response.status_code == 200:
                            async for line in response.aiter_lines():
                                if line.strip():
                                    try:
                                        token_json = json.loads(line)
                                        token = token_json.get("response", "")
                                        total_tokens += 1
                                        yield token
                                        if token_json.get("done", False):
                                            break
                                    except Exception:
                                        pass
                        else:
                            yield f"\n[!] Ollama returned status code: {response.status_code}\n"
            except Exception as e:
                yield f"\n[!] Connection to local Ollama failed. Please ensure Ollama is running and has {settings.OLLAMA_MODEL} model pulled.\n"
                was_successful = False

        if citations:
            yield "\n\n**Sources Referenced:**\n"
            for c in citations:
                yield f"- [{c['index']}] {c['title']} (View [here](#/source/{c['type']}/{c['id']}))\n"
                
        try:
            log_entry = SearchLog(
                query=query,
                user_id=user_id,
                was_chatbot=True,
                was_successful=was_successful,
                tokens_used=total_tokens
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            print(f"[!] Error logging search: {e}")

