# ShadowPM API

A simple FastAPI application for ingesting and storing Granola meeting webhooks in Azure Cosmos DB.

## Features

- **Health Check Endpoint**: Monitor API health
- **Granola Webhook**: Receive and store meeting data from Granola
- **Get All Meetings**: Retrieve all stored meetings

## Endpoints

### 1. Health Check
```
GET /health
```
Returns the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "service": "shadowpm-api"
}
```

### 2. Granola Webhook
```
POST /webhook/granola
```
Receives meeting data from Granola and saves it to Cosmos DB.

**Request Body Example:**
```json
{
  "attendees": "[{'name': 'Sam Stephenson','email': 'samstephenson@granola.ai'}]",
  "calendar_event_ID": "demo_meeting_c0248556-254e-4456-906f-444aeaa89ea9",
  "calendar_event_time": "2026-02-07T11:17:43.591Z",
  "calendar_event_title": "Get started with Granola",
  "creator_email": "rithin.chalumuri@reewild.com",
  "creator_name": "Rithin Chalumuri",
  "enhanced_notes": "...",
  "id": "ac325660-0cae-4283-8636-d0de9927764e",
  "link": "https://notes.granola.ai/d/ac325660-0cae-4283-8636-d0de9927764e",
  "my_notes": "gronola AI",
  "title": "Get started with Granola",
  "transcript": "..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Meeting data saved successfully",
  "meeting_id": "ac325660-0cae-4283-8636-d0de9927764e"
}
```

### 3. Get All Meetings
```
GET /meetings
```
Retrieves all meeting documents from Cosmos DB.

**Response:**
```json
{
  "status": "success",
  "count": 5,
  "meetings": [
    {
      "id": "ac325660-0cae-4283-8636-d0de9927764e",
      "title": "Get started with Granola",
      ...
    }
  ]
}
```

## Setup

### Prerequisites
- Python 3.8+
- Azure Cosmos DB account

### Environment Variables

Create a `.env` file in the `api` directory:

```env
COSMOS_CONNECTION_STRING=your_cosmos_connection_string_here
COSMOS_DATABASE_NAME=shadowpm-db
DEBUG=false
```

## Running the API

### Option 1: Run Locally (Non-Docker)

1. **Install dependencies**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Run the development server**
   ```bash
   uvicorn main:app --reload
   ```
   
   Or with custom host/port:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access the API**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

### Option 2: Run with Docker

1. **Build the Docker image**
   ```bash
   cd api
   docker build -t shadowpm-api .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name shadowpm-api \
     -p 8000:8000 \
     --env-file .env \
     shadowpm-api
   ```
   
   Or run interactively (see logs):
   ```bash
   docker run -it \
     --name shadowpm-api \
     -p 8000:8000 \
     --env-file .env \
     shadowpm-api
   ```

3. **Access the API**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

4. **Manage the container**
   ```bash
   # View logs
   docker logs shadowpm-api
   
   # Stop the container
   docker stop shadowpm-api
   
   # Start the container
   docker start shadowpm-api
   
   # Remove the container
   docker rm shadowpm-api
   ```

### Testing the API

Run the test script to verify all endpoints:

```bash
# Make sure the API is running first
python test_api.py
```

## API Documentation

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Project Structure

```
api/
├── main.py                 # FastAPI application with endpoints
├── core/
│   ├── config.py          # Configuration settings
│   └── cosmos.py          # Cosmos DB client
├── requirements.txt       # Python dependencies
└── README.md             # This file
```

## Cosmos DB Setup

The API automatically creates:
- Database: `shadowpm-db` (configurable via `COSMOS_DATABASE_NAME`)
- Container: `meetings` with partition key `/id`

No manual setup required - containers are created on first run if they don't exist.
