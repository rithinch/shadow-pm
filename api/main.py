from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from core.config import settings
from core.cosmos import cosmos_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup: Initialize Cosmos DB containers
    await cosmos_client.initialize_containers()
    yield
    # Shutdown: cleanup if needed
    pass


app = FastAPI(
    title=settings.app_name,
    description="API for processing Granola meeting webhooks",
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "granola-meetings-api"
        }
    )


@app.post("/webhook/granola")
async def granola_webhook(request: Request):
    """
    Webhook endpoint to receive Granola meeting data
    
    Ingests meeting data from Granola and saves it to Cosmos DB
    """
    # Get the raw JSON body
    meeting_data = await request.json()
    
    # Save to Cosmos DB
    created_meeting = await cosmos_client.create_meeting(meeting_data)
    
    return JSONResponse(
        status_code=201,
        content={
            "status": "success",
            "message": "Meeting data saved successfully",
            "meeting_id": created_meeting.get("id")
        }
    )


@app.get("/meetings")
async def get_all_meetings():
    """
    Get all meetings from Cosmos DB
    
    Returns all meeting documents stored in the meetings container
    """
    meetings = await cosmos_client.get_all_meetings()
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "success",
            "count": len(meetings),
            "meetings": meetings
        }
    )
