import os
import base64
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Requirement 3: Usage Tracking (In-memory)
# Format: { "user_id": analysis_count }
usage_db = {}

@app.get("/api/health")
def health():
    return {"status": "online", "key_configured": bool(os.getenv("OPENAI_API_KEY"))}

@app.post("/api/analyze")
async def analyze_image(request: Request, file: UploadFile = File(...)):
    try:
        # --- 1. ACCESS CONTROL ---
        # Get user info from custom headers sent by frontend
        user_id = request.headers.get("X-User-Id")
        user_tier = request.headers.get("X-User-Tier", "Free")

        if not user_id:
            raise HTTPException(status_code=401, detail="User identification missing")

        # Free tier: 1 analysis limit
        if user_tier == "Free":
            if usage_db.get(user_id, 0) >= 1:
                # Requirement 3: Return 429 when limit exceeded
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
                    detail="Free tier limit reached. Please upgrade to Premium for unlimited scans."
                )

        # --- 2. FILE VALIDATION ---
        # Requirement 1: Accept only specific formats
        allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid file type. Supported: JPG, PNG, WEBP."
            )

        content = await file.read()
        
        # Requirement 1: Max size 5MB (5 * 1024 * 1024 bytes)
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
                detail="File size exceeds 5MB limit."
            )

        if not content:
            raise HTTPException(status_code=400, detail="No file uploaded")

        # --- 3. AI INTEGRATION ---
        # Requirement 2: Base64 conversion
        base64_image = base64.b64encode(content).decode('utf-8')

        # Requirement 2: Specific Prompt and gpt-4o-mini
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": "Describe this image in detail, including objects, colors, mood, and any notable features."
                    },
                    {
                        "type": "image_url", 
                        "image_url": {"url": f"data:{file.content_type};base64,{base64_image}"}
                    }
                ]
            }],
            max_tokens=500
        )

        # --- 4. UPDATE USAGE ---
        if user_tier == "Free":
            usage_db[user_id] = usage_db.get(user_id, 0) + 1

        return {"feedback": response.choices[0].message.content}

    except HTTPException as he:
        # Re-raise HTTP exceptions so FastAPI handles status codes correctly
        raise he
    except Exception as e:
        # Requirement 4: Log errors and return JSON
        logger.error(f"Internal Server Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="An unexpected error occurred during analysis."
        )