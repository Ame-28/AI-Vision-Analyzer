from fastapi import FastAPI, File, UploadFile, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS so your Next.js app can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
# Change this to your exact Clerk email
PREMIUM_USERS = ["your-email@example.com"] 

# In-memory database to track usage
# Key: email string -> Value: {"analyses_used": int}
USAGE_DB = {}

def get_current_user_data(authorization: str = Header(None)):
    """
    Identifies the user based on the email passed in the Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No identity provided")
    
    # Extract email from "Bearer user@email.com"
    user_email = authorization.split(" ")[1]
    
    # Determine tier
    tier = "premium" if user_email in PREMIUM_USERS else "free"
    
    return {"email": user_email, "tier": tier}

@app.get("/api/usage")
def get_usage(user: dict = Depends(get_current_user_data)):
    email = user["email"]
    tier = user["tier"]
    
    stats = USAGE_DB.get(email, {"analyses_used": 0})
    limit = "unlimited" if tier == "premium" else 1
    
    return {
        "tier": tier,
        "analyses_used": stats["analyses_used"],
        "limit": limit
    }

@app.post("/api/analyze")
async def analyze_image(
    file: UploadFile = File(...), 
    user: dict = Depends(get_current_user_data)
):
    email = user["email"]
    tier = user["tier"]

    # 1. Check Limits
    stats = USAGE_DB.get(email, {"analyses_used": 0})
    limit = 1 if tier == "free" else float('inf')
    
    if stats["analyses_used"] >= limit:
        raise HTTPException(
            status_code=429, 
            detail="Usage limit reached. Upgrade to Premium for unlimited scans."
        )

    # 2. Update Usage
    stats["analyses_used"] += 1
    USAGE_DB[email] = stats

    # 3. Dummy Analysis Logic
    return {
        "analysis": f"AI identified objects in {file.filename}. Processing done on {tier.upper()} tier.",
        "analyses_used": stats["analyses_used"],
        "tier": tier,
        "limit": "unlimited" if tier == "premium" else 1
    }