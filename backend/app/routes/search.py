from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models import User, Document, InterviewExperience, SearchLog
from app.schemas import SearchQuery, ChatQuery
from app.core.auth import get_current_user
from app.services.rag_service import RAGService

router = APIRouter(prefix="/search", tags=["Search & RAG Chat"])

@router.post("/query")
def search_query(
    payload: SearchQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Performs a hybrid search combining SQL keyword lookup & vector similarity.
    Retrieves, sorts, and filters results for the Knowledge Explorer and Hubs.
    """
    # 1. Fetch merged results from RAG service
    raw_results = RAGService.perform_hybrid_search(
        db=db,
        query=payload.query,
        category_id=payload.category_id,
        course_id=payload.course_id,
        company_name=payload.company_name,
        explore_by=payload.explore_by,
        advanced_filters=payload.advanced_filters,
        limit=20
    )
    
    # 2. Enrich results with database properties (created_at, upvotes, views) using eager bulk queries
    doc_ids = [r["id"] for r in raw_results if r["type"] == "document"]
    interview_ids = [r["id"] for r in raw_results if r["type"] == "interview"]

    docs_map = {}
    if doc_ids:
        docs = db.query(Document).options(
            joinedload(Document.category),
            joinedload(Document.course),
            joinedload(Document.uploader)
        ).filter(Document.id.in_(doc_ids)).all()
        docs_map = {d.id: d for d in docs}

    interviews_map = {}
    if interview_ids:
        interviews = db.query(InterviewExperience).options(
            joinedload(InterviewExperience.uploader)
        ).filter(InterviewExperience.id.in_(interview_ids)).all()
        interviews_map = {i.id: i for i in interviews}

    enriched_results = []
    for r in raw_results:
        upvotes = 0
        views = 0
        created_at = None
        category_name = None
        
        if r["type"] == "document":
            doc = docs_map.get(r["id"])
            if doc:
                upvotes = doc.upvotes
                views = doc.views
                created_at = doc.created_at
                category_name = doc.category.name if doc.category else "General"
        else:
            interview = interviews_map.get(r["id"])
            if interview:
                upvotes = interview.upvotes
                views = interview.views
                created_at = interview.created_at
                category_name = "Interview Experience"
                
        enriched_results.append({
            **r,
            "upvotes": upvotes,
            "views": views,
            "created_at": created_at,
            "category_name": category_name
        })
        
    # 3. Apply sorting (date, upvotes, views)
    if payload.sort_by == "upvotes":
        enriched_results.sort(key=lambda x: x.get("upvotes", 0), reverse=True)
    elif payload.sort_by == "views":
        enriched_results.sort(key=lambda x: x.get("views", 0), reverse=True)
    else: # default to date
        # If created_at is None, push to the end
        enriched_results.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)

    # 4. Log the query for Admin AI Monitoring
    try:
        log_entry = SearchLog(
            query=payload.query or f"Filtered Explorer: {payload.explore_by or 'All'}",
            user_id=current_user.id,
            was_chatbot=False,
            was_successful=len(enriched_results) > 0,
            tokens_used=0
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        print(f"[!] Search logging error: {e}")

    return enriched_results[:12]

@router.post("/chat")
def chat_rag_stream(
    payload: ChatQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    RAG Chat endpoint returning a stream of generated tokens from local qwen3:8b,
    followed by clickable citation indices.
    """
    return StreamingResponse(
        RAGService.generate_chatbot_response_stream(
            query=payload.query,
            history=payload.history,
            db=db,
            user_id=current_user.id
        ),
        media_type="text/event-stream"
    )
