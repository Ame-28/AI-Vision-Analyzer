import os
import base64
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv

# --- VERCEL ENV LOADING ---
# 1. Try to find .env.local locally
base_dir = Path(__file__).resolve().parent.parent
env_path = base_dir / ".env.local"

# 2. Only load if the file exists (Development). 
# On Vercel (Production), this file won't exist, and Vercel will provide variables directly.
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI (os.getenv works on both Local and Vercel now)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # 1. Read and Encode Image
        content = await file.read()
        
        # Simple Validation: Check if file is empty
        if not content:
            raise HTTPException(status_code=400, detail="File is empty")
            
        base64_image = base64.b64encode(content).decode('utf-8')

        # 2. Call OpenAI Vision
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "What is in this image? Provide a detailed description."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            max_tokens=300
        )

        # 3. Return the text feedback (using "feedback" key to match your frontend)
        return {"feedback": response.choices[0].message.content}

    except Exception as e:
        print(f"Error: {e}") # Log error to Vercel/Uvicorn console
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health():
    return {"status": "online", "openai_key_set": bool(os.getenv("OPENAI_API_KEY"))}