import sys
import os
import uuid

# Ensure backend folder is in Python search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models import User, Document, DocumentChunk, Course, Category, InterviewExperience, Upvote, Announcement
from app.services.rag_service import RAGService
from app.services.vector_service import VectorService
from app.core.auth import get_password_hash

def seed_rag_data():
    print("[*] Opening Database session...")
    db = SessionLocal()
    
    try:
        # 1. Fetch Categories and Courses
        notes_cat = db.query(Category).filter(Category.name == "Notes").first()
        exam_cat = db.query(Category).filter(Category.name == "Exam Prep").first()
        projects_cat = db.query(Category).filter(Category.name == "Projects").first()
        labs_cat = db.query(Category).filter(Category.name == "Labs").first()
        
        cs301_course = db.query(Course).filter(Course.code == "CS301").first()
        cs302_course = db.query(Course).filter(Course.code == "CS302").first()
        cs401_course = db.query(Course).filter(Course.code == "CS401").first()
        
        if not notes_cat or not cs301_course:
            print("[!] Default categories or courses missing. Please start uvicorn backend once to run main.py migrations, then retry.")
            return

        # 2. Add Mock Users (Senior Contributor & Junior Searcher)
        senior = db.query(User).filter(User.email == "seniorCSE01@college.edu").first()
        if not senior:
            print("[*] Creating Senior student contributor...")
            senior = User(
                email="seniorCSE01@college.edu",
                full_name="Aditya Sharma",
                hashed_password=get_password_hash("password123"),
                role="student",
                academic_year="IV",
                department="CSE",
                contribution_points=180,
                streak_count=4,
                onboarded=True
            )
            db.add(senior)
            db.commit()
            db.refresh(senior)
            
        junior = db.query(User).filter(User.email == "juniorCSE02@college.edu").first()
        if not junior:
            print("[*] Creating Junior student searcher...")
            junior = User(
                email="juniorCSE02@college.edu",
                full_name="Rohan Gupta",
                hashed_password=get_password_hash("password123"),
                role="student",
                academic_year="II",
                department="CSE",
                contribution_points=20,
                streak_count=1,
                onboarded=True
            )
            db.add(junior)
            db.commit()
            db.refresh(junior)

        # 3. Clear existing custom documents and interview chunks to start fresh
        db.query(DocumentChunk).delete()
        db.query(Document).delete()
        db.query(InterviewExperience).delete()
        db.commit()
        print("[+] Existing database documents cleared.")

        # 4. Insert Mock Documents
        documents_to_seed = [
            {
                "title": "CS301 Database Systems - Two-Phase Locking (2PL) Lecture Notes",
                "content": (
                    "Two-Phase Locking (2PL) is a concurrency control method that guarantees serializability in database systems. "
                    "The protocol has two phases: growing phase and shrinking phase. In the growing phase, a transaction may acquire "
                    "locks but cannot release any locks. In the shrinking phase, a transaction may release locks but cannot acquire "
                    "new locks. Strict 2PL requires that all exclusive locks held by a transaction be held until the transaction "
                    "commits or aborts, which prevents cascading aborts. Conservative 2PL requires a transaction to lock all its "
                    "data items before starting execution, preventing deadlock scenarios. Rigorous 2PL requires all locks (shared "
                    "and exclusive) to be held until transaction commit."
                ),
                "category_id": notes_cat.id,
                "course_id": cs301_course.id,
                "is_project": False,
                "tags": "dbms, locking, concurrency, serializability"
            },
            {
                "title": "CS302 Operating Systems - Page Replacement Algorithms & LRU",
                "content": (
                    "Virtual memory is a memory management technique that provides an idealized abstraction of storage resources. "
                    "Page replacement algorithms decide which memory pages to page out (write to disk) when a new page needs to "
                    "be allocated. Standard algorithms include FIFO (First-In, First-Out), LRU (Least Recently Used), and Optimal "
                    "Page Replacement. LRU replaces the page that has not been referenced for the longest duration, offering high "
                    "hit ratios in practice. Optimal page replacement replaces the page that will not be used for the longest "
                    "period of time in the future, serving as a theoretical performance benchmark. FIFO simply replaces the oldest "
                    "loaded page, though it can suffer from Belady's Anomaly."
                ),
                "category_id": exam_cat.id,
                "course_id": cs302_course.id,
                "is_project": False,
                "tags": "os, memory, paging, lru, algorithms"
            },
            {
                "title": "CS401 Computer Networks - TCP Three-Way Handshake Protocol",
                "content": (
                    "TCP (Transmission Control Protocol) is a connection-oriented transport layer protocol that ensures reliable "
                    "data transmission. It uses a three-way handshake to establish a connection between client and server. "
                    "Step 1: The client sends a SYN (synchronize) packet to the server to initiate connection. "
                    "Step 2: The server responds with a SYN-ACK packet, acknowledging client's packet and requesting sync. "
                    "Step 3: The client replies with an ACK packet to confirm connection establishment, after which data transmission "
                    "can begin. TCP handles flow control using sliding window protocol and performs congestion control using "
                    "slow start and congestion avoidance mechanisms."
                ),
                "category_id": notes_cat.id,
                "course_id": cs401_course.id,
                "is_project": False,
                "tags": "networks, tcp, handshake, transport"
            }
        ]

        print("[*] Seeding documents and vector indexing...")
        for doc_data in documents_to_seed:
            # Create physical file representation for uploader
            filename = f"seeded_doc_{uuid.uuid4().hex[:8]}.txt"
            filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "uploads", filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(doc_data["content"])

            new_doc = Document(
                title=doc_data["title"],
                file_path=filepath,
                course_id=doc_data["course_id"],
                uploader_id=senior.id,
                category_id=doc_data["category_id"],
                status="APPROVED",
                is_project=doc_data["is_project"],
                tags=doc_data["tags"],
                upvotes=4,
                views=22
            )
            db.add(new_doc)
            db.commit()
            db.refresh(new_doc)

            # Chunk & embed document
            chunks = RAGService.split_into_chunks(doc_data["content"])
            vector_chunks = []
            for idx, text_chunk in enumerate(chunks):
                v_id = str(uuid.uuid4())
                
                db_chunk = DocumentChunk(
                    document_id=new_doc.id,
                    chunk_index=idx,
                    text_content=text_chunk,
                    vector_id=v_id
                )
                db.add(db_chunk)
                
                vector_chunks.append({
                    "id": v_id,
                    "text": text_chunk,
                    "metadata": {
                        "document_id": new_doc.id,
                        "title": new_doc.title,
                        "uploader_name": senior.full_name,
                        "course_id": new_doc.course_id,
                        "course_code": cs301_course.code if new_doc.course_id == cs301_course.id else (cs302_course.code if new_doc.course_id == cs302_course.id else cs401_course.code),
                        "category_id": new_doc.category_id,
                        "is_project": new_doc.is_project,
                        "is_interview": False
                    }
                })
            
            if vector_chunks:
                VectorService.add_document_chunks(vector_chunks)
                print(f"  - Indexed document: {new_doc.title}")

        # 5. Insert Mock Interview Experiences
        interviews_to_seed = [
            {
                "company_name": "Zoho",
                "role": "Software Developer Trainee",
                "aptitude_questions": "Basic mathematical puzzles, profit and loss, time and work relations, logical syllogisms.",
                "coding_questions": "Write code to find the longest common subsequence in two strings. Program to check if a matrix is symmetric.",
                "technical_questions": "Difference between process and thread. How does virtual memory paging work? What is indexing in database schemas?",
                "hr_questions": "Tell me about yourself. Why Zoho? How do you handle conflict during group projects?",
                "timeline": "3 Rounds, July 2026, On-Campus",
                "prep_resources": "LeetCode arrays, GeeksforGeeks OS paging guides, and CS301 Database Systems notes.",
                "selected": True
            },
            {
                "company_name": "Microsoft",
                "role": "Software Engineering Intern",
                "aptitude_questions": "Logical reasoning and algorithmic puzzles.",
                "coding_questions": "Reverse a linked list in K-sized blocks. Print binary tree level order traversal using queue.",
                "technical_questions": "Explain strict 2PL vs rigorous 2PL concurrency. How does B-tree index traversal speed up query retrieval in RDB?",
                "hr_questions": "Describe a project conflict you resolved. What is your favorite product and why?",
                "timeline": "4 Rounds, August 2026, Off-Campus",
                "prep_resources": "System design primers, LeetCode medium questions, and Acadence CS301 DBMS resources.",
                "selected": True
            }
        ]

        for int_data in interviews_to_seed:
            new_exp = InterviewExperience(
                uploader_id=senior.id,
                company_name=int_data["company_name"],
                role=int_data["role"],
                aptitude_questions=int_data["aptitude_questions"],
                coding_questions=int_data["coding_questions"],
                technical_questions=int_data["technical_questions"],
                hr_questions=int_data["hr_questions"],
                timeline=int_data["timeline"],
                student_experience="Overall good candidate interview experience with balanced DSA rounds.",
                selected=int_data["selected"],
                prep_resources=int_data["prep_resources"],
                status="APPROVED",
                upvotes=2,
                views=15
            )
            db.add(new_exp)
            db.commit()
            db.refresh(new_exp)

            # Compile into text content for Qdrant index mapping
            full_text = (
                f"Company: {new_exp.company_name}\n"
                f"Role: {new_exp.role}\n"
                f"Timeline: {new_exp.timeline or 'N/A'}\n"
                f"Selected Status: {'Selected' if new_exp.selected else 'Not Selected'}\n"
                f"Aptitude Questions:\n{new_exp.aptitude_questions or 'None'}\n"
                f"Coding Questions:\n{new_exp.coding_questions or 'None'}\n"
                f"Technical Questions:\n{new_exp.technical_questions or 'None'}\n"
                f"HR Questions:\n{new_exp.hr_questions or 'None'}\n"
                f"Preparation Resources:\n{new_exp.prep_resources or 'None'}"
            )

            chunks = RAGService.split_into_chunks(full_text)
            vector_chunks = []
            for idx, text_chunk in enumerate(chunks):
                v_id = str(uuid.uuid4())
                
                db_chunk = DocumentChunk(
                    interview_id=new_exp.id,
                    chunk_index=idx,
                    text_content=text_chunk,
                    vector_id=v_id
                )
                db.add(db_chunk)
                
                vector_chunks.append({
                    "id": v_id,
                    "text": text_chunk,
                    "metadata": {
                        "interview_id": new_exp.id,
                        "company_name": new_exp.company_name,
                        "title": f"Interview Experience at {new_exp.company_name} ({new_exp.role})",
                        "uploader_name": senior.full_name,
                        "course_id": None,
                        "course_code": None,
                        "category_id": None,
                        "is_project": False,
                        "is_interview": True
                    }
                })

            if vector_chunks:
                VectorService.add_document_chunks(vector_chunks)
                print(f"  - Indexed interview experience: {new_exp.company_name}")

        # 6. Seed Mock Announcements
        print("[*] Seeding announcements...")
        db.query(Announcement).delete()
        
        # Get admin uploader
        admin_user = db.query(User).filter(User.email == "adminAcad01").first()
        uploader_id = admin_user.id if admin_user else senior.id
        
        announcements_to_seed = [
            {
                "title": "Microsoft Placement Drive 2026",
                "content": "Microsoft off-campus recruitment drive for 2026 graduates is now open. Apply through the link in the student portal before 25th July.",
                "uploader_id": uploader_id
            },
            {
                "title": "Database Systems Mini-Project Deadline",
                "content": "All third-year students are required to submit their DBMS mini-project reports by July 28th. Submissions must be verified by team coordinators.",
                "uploader_id": uploader_id
            },
            {
                "title": "AI Lab Record Submissions",
                "content": "CS401 Lab Record submission link is active. Please compile your network programming lab records and upload them by Friday.",
                "uploader_id": uploader_id
            }
        ]
        
        for ann_data in announcements_to_seed:
            new_ann = Announcement(
                title=ann_data["title"],
                content=ann_data["content"],
                uploader_id=ann_data["uploader_id"]
            )
            db.add(new_ann)
            
        db.commit()
        print("[SUCCESS] SQLite database and Qdrant local vector indexes seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_rag_data()
