"""
Simple test script for the ShadowPM API

This script demonstrates the three endpoints:
1. Health check
2. Creating a meeting via webhook
3. Getting all meetings
"""
import requests
import json

BASE_URL = "http://localhost:8000"

# Sample Granola webhook data
SAMPLE_MEETING = {
    "attendees": "[{'name': 'Sam Stephenson','email': 'samstephenson@granola.ai'}]",
    "calendar_event_ID": "demo_meeting_c0248556-254e-4456-906f-444aeaa89ea9",
    "calendar_event_time": "2026-02-07T11:17:43.591Z",
    "calendar_event_title": "Get started with Granola",
    "creator_email": "rithin.chalumuri@reewild.com",
    "creator_name": "Rithin Chalumuri",
    "enhanced_notes": "### Granola AI Introduction\\n\\n- AI-powered meeting notes tool",
    "id": "ac325660-0cae-4283-8636-d0de9927764e",
    "link": "https://notes.granola.ai/d/ac325660-0cae-4283-8636-d0de9927764e",
    "my_notes": "granola AI",
    "title": "Get started with Granola",
    "transcript": "Them: Hey, my name is Sam..."
}


def test_health():
    """Test the health check endpoint"""
    print("\\n1. Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_create_meeting():
    """Test creating a meeting via webhook"""
    print("\\n2. Testing Granola Webhook (Create Meeting)...")
    response = requests.post(
        f"{BASE_URL}/webhook/granola",
        json=SAMPLE_MEETING
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 201


def test_get_meetings():
    """Test getting all meetings"""
    print("\\n3. Testing Get All Meetings...")
    response = requests.get(f"{BASE_URL}/meetings")
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Found {data.get('count', 0)} meetings")
    print(f"Response: {json.dumps(data, indent=2)}")
    return response.status_code == 200


if __name__ == "__main__":
    print("=" * 60)
    print("ShadowPM API Test")
    print("=" * 60)
    print(f"\\nMake sure the API is running at {BASE_URL}")
    print("Run: uvicorn main:app --reload")
    print("=" * 60)
    
    try:
        # Run tests
        health_ok = test_health()
        create_ok = test_create_meeting()
        get_ok = test_get_meetings()
        
        # Summary
        print("\\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        print(f"Health Check: {'✓ PASSED' if health_ok else '✗ FAILED'}")
        print(f"Create Meeting: {'✓ PASSED' if create_ok else '✗ FAILED'}")
        print(f"Get Meetings: {'✓ PASSED' if get_ok else '✗ FAILED'}")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\\n❌ ERROR: Could not connect to API")
        print(f"Make sure the API is running at {BASE_URL}")
        print("Run: uvicorn main:app --reload")
