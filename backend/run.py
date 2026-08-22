import uvicorn

if __name__ == "__main__":
    print("\n========================================================")
    print(" [*] Starting Acadence AI Backend Server...")
    print(" [*] URL: http://localhost:8000")
    print(" [*] API Docs: http://localhost:8000/docs")
    print("========================================================\n")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
