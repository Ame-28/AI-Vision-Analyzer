import os
import base64
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

# for local testing
# This finds .env.local in your root folder
base_dir = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=base_dir / ".env.local")


app = FastAPI()

# Standard CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel provides environment variables via os.getenv
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@app.get("/api/health")
def health():
    return {"status": "online", "key_configured": bool(os.getenv("OPENAI_API_KEY"))}

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="No file uploaded")

        # OpenAI Vision requires base64
        base64_image = base64.b64encode(content).decode('utf-8')

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe this image in detail."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }],
            max_tokens=300
        )

        return {"feedback": response.choices[0].message.content}

    except Exception as e:
        print(f"Deployment Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))