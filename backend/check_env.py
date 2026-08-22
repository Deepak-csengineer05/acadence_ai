import sys
import httpx

def check_python_version():
    print(f"[*] Python Version: {sys.version}")
    if sys.version_info < (3, 10):
        print("[!] Warning: Acadence AI is recommended to run on Python 3.10+.")
        return False
    print("[+] Python version is compatible.")
    return True

def check_ollama():
    url = "http://localhost:11434"
    print(f"[*] Checking local Ollama service at {url}...")
    try:
        response = httpx.get(url, timeout=5.0)
        if response.status_code == 200:
            print("[+] Ollama is running.")
            
            # Check available models
            try:
                models_response = httpx.get(f"{url}/api/tags", timeout=5.0)
                if models_response.status_code == 200:
                    models = [m["name"] for m in models_response.json().get("models", [])]
                    print(f"[*] Locally pulled models: {models}")
                    
                    recommended_models = ["llama3.2:latest", "llama3.2", "gemma2:2b", "gemma2:2b-instruct-q4_K_M"]
                    has_recommended = any(any(rm in m for rm in recommended_models) for m in models)
                    
                    if not has_recommended:
                        print("[!] Warning: No recommended local models found (e.g. llama3.2 or gemma2:2b).")
                        print("    Please run: 'ollama pull llama3.2' or 'ollama pull gemma2:2b' in your terminal.")
                    else:
                        print("[+] Found compatible model for offline RAG.")
                else:
                    print("[!] Failed to fetch pulled models from Ollama API.")
            except Exception as e:
                print(f"[!] Error fetching models: {e}")
            return True
        else:
            print(f"[!] Ollama returned status code {response.status_code}.")
            return False
    except httpx.ConnectError:
        print("[X] Ollama is not running or not accessible on localhost:11434.")
        print("    Please download and run Ollama from https://ollama.com/, then try again.")
        return False
    except Exception as e:
        print(f"[!] Unexpected error checking Ollama: {e}")
        return False

def main():
    print("=== Acadence AI Local Environment Check ===")
    py_ok = check_python_version()
    print("-" * 40)
    ollama_ok = check_ollama()
    print("=" * 40)
    if py_ok and ollama_ok:
        print("[SUCCESS] Local setup requirements verified successfully!")
    else:
        print("[INFO] Please resolve the warnings/errors above to complete your setup.")

if __name__ == "__main__":
    main()
