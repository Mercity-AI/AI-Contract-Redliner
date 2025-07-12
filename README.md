# Contract Redliner API

An AI-powered contract redlining service that analyzes contracts against user preferences using FastAPI and Pydantic.

## Features

- **AI-Powered Analysis**: Uses DeepSeek R1 model to identify contract issues
- **Preference-Based Redlining**: Analyzes contracts against user-specified preferences
- **Structured JSON Response**: Returns detailed issue analysis with severity levels
- **FastAPI Framework**: Modern, fast web framework with automatic API documentation
- **Pydantic Validation**: Type-safe request/response models

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**:
   Create a `.env` file with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

3. **Run the API server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### POST /redline
Analyze a contract against user preferences.

**Request Body**:
```json
{
  "preferences": "I prefer short term contracts under 1 year, and no non-compete clauses.",
  "contract": "This agreement shall be for a term of 2 years..."
}
```

**Response**:
```json
{
  "issues": [
    {
      "issue_name": "Long Term Contract",
      "line_range": {
        "start": "This agreement shall",
        "end": "2 years"
      },
      "severity": 4,
      "issue_description": "Contract term exceeds preferred 1 year limit",
      "issue_fix": "Reduce contract term to under 1 year",
      "replace_with": "This agreement shall be for a term of 11 months"
    }
  ],
  "summary": {
    "total_issues": 1,
    "high_severity_issues": 1,
    "medium_severity_issues": 0,
    "low_severity_issues": 0,
    "average_severity": 4.0
  }
}
```

### GET /health
Health check endpoint.

### GET /
Root endpoint with API information.

### GET /docs
Interactive API documentation (Swagger UI).

## Usage Examples

### Python Client
```python
import requests

response = requests.post("http://localhost:8000/redline", json={
    "preferences": "I prefer short term contracts under 1 year, and no non-compete clauses.",
    "contract": "Your contract text here..."
})

result = response.json()
print(f"Found {result['summary']['total_issues']} issues")
```

### cURL
```bash
curl -X POST "http://localhost:8000/redline" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": "I prefer short term contracts under 1 year, and no non-compete clauses.",
    "contract": "This agreement shall be for a term of 2 years..."
  }'
```

## Testing

Run the test script to verify the API is working:

```bash
python test_api.py
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
AI Redliner/
├── main.py              # FastAPI application
├── redliner.py          # Core redlining logic
├── utils.py             # AI model utilities
├── PROMPTS.py           # System and user prompts
├── requirements.txt     # Python dependencies
├── test_api.py         # API test script
├── contract.txt         # Sample contract file
├── redlined_contract.txt # Output file
└── README.md           # This file
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid JSON responses from AI model
- Missing or malformed request data
- Connection issues with AI services
- General processing errors

All errors return appropriate HTTP status codes and descriptive error messages.

## Configuration

The API uses the DeepSeek R1 model by default. You can modify the model in `redliner.py`:

```python
MODEL = "deepseek/deepseek-r1-0528"  # Change to your preferred model
```

## License

This project is for demonstration purposes. Please ensure you have appropriate licenses for any commercial use. 