from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any
import json
from redliner import redline

app = FastAPI(
    title="Contract Redliner API",
    description="AI-powered contract redlining service that analyzes contracts against user preferences",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RedlineRequest(BaseModel):
    preferences: str = Field(..., description="User preferences for contract analysis", example="I prefer short term contracts under 1 year, and no non-compete clauses.")
    contract: str = Field(..., description="Contract text to be analyzed", example="This agreement shall be for a term of 2 years...")

class IssueItem(BaseModel):
    issue_name: str = Field(..., description="2-3 word title for the issue")
    line_range: Dict[str, str] = Field(..., description="Start and end of problematic section")
    severity: int = Field(..., ge=1, le=5, description="Severity level from 1 (low) to 5 (high)")
    issue_description: str = Field(..., description="Explanation of why this is an issue based on preferences")
    issue_fix: str = Field(..., description="Suggestion on how to fix the issue")
    replace_with: str = Field(..., description="Suggested text to replace the problematic section")

class RedlineResponse(BaseModel):
    issues: List[IssueItem] = Field(..., description="List of identified issues in the contract")
    summary: Dict[str, Any] = Field(..., description="Summary statistics of the analysis")


@app.post("/redline", response_model=RedlineResponse)
async def redline_mock(request: RedlineRequest):
    """
    Analyze a contract against user preferences and return identified issues.
    
    This endpoint takes user preferences and contract text, then uses AI to identify
    potential issues that conflict with the user's preferences.

    return RedlineResponse(issues=[], summary={})
    """

    model_resp = {
    "issues": [
        {
            "issue_name": "Excessive Survival Period",
            "line_range": {
                "start": "All obligations under this Agreement",
                "end": "termination of this Agreement."
            },
            "severity": 5,
            "issue_description": "7-year survival period for obligations creates prolonged liability exposure, conflicting with preference to minimize liability.",
            "issue_fix": "Reduce survival period to align with standard confidentiality terms.",
            "replace_with": "All obligations under this Agreement shall survive termination and continue for an additional three (3) years after expiration or termination of this Agreement."
        },
        {
            "issue_name": "Long Notice Period",
            "line_range": {
                "start": "terminated by either party",
                "end": "written notice."
            },
            "severity": 4,
            "issue_description": "90-day termination notice exceeds preferred 30-day period, delaying termination flexibility.",
            "issue_fix": "Shorten notice period to 30 days.",
            "replace_with": "terminated by either party with thirty (30) days written notice."
        },
        {
            "issue_name": "Overly Broad IP Definition",
            "line_range": {
                "start": "Confidential Information means",
                "end": "during the relationship."
            },
            "severity": 4,
            "issue_description": "Definition includes unmarked information and general business knowledge, creating ambiguity in IP protection.",
            "issue_fix": "Narrow definition to clearly identifiable confidential materials.",
            "replace_with": "\"Confidential Information\" means non-public information disclosed in tangible form and clearly marked as confidential, excluding information independently developed or publicly available."
        },
        {
            "issue_name": "Unlimited Liability Remedies",
            "line_range": {
                "start": "Company shall be entitled",
                "end": "law or equity."
            },
            "severity": 5,
            "issue_description": "Injunctive relief without bond and broad remedies create unlimited liability exposure.",
            "issue_fix": "Limit remedies to monetary damages where appropriate.",
            "replace_with": "Company may seek injunctive relief where monetary damages are inadequate, subject to applicable law."
        },
        {
            "issue_name": "Excessive Non-Compete Term",
            "line_range": {
                "start": "for a period of five (5) years",
                "end": "Company's offerings"
            },
            "severity": 5,
            "issue_description": "5-year non-compete post-termination is unreasonable and increases liability risk.",
            "issue_fix": "Shorten duration to industry-standard period.",
            "replace_with": "for a period of one (1) year thereafter, Recipient agrees not to directly compete with Company's core business in existing markets."
        },
        {
            "issue_name": "Overly Broad Assignment",
            "line_range": {
                "start": "Company may assign this Agreement",
                "end": "prior written approval."
            },
            "severity": 3,
            "issue_description": "Unilateral assignment right without Recipient consent creates uncontrolled liability transfer.",
            "issue_fix": "Require mutual consent for assignments.",
            "replace_with": "Neither party may assign this Agreement without prior written consent of the other party."
        },
        {
            "issue_name": "Unreasonable Opportunity Assignment",
            "line_range": {
                "start": "Recipient must immediately notify",
                "end": "to Company."
            },
            "severity": 4,
            "issue_description": "Mandatory assignment of all business opportunities overreaches IP protection needs.",
            "issue_fix": "Limit to opportunities directly related to the confidential relationship.",
            "replace_with": "Recipient shall notify Company of opportunities directly arising from Confidential Information. Company may request rights to such opportunities within 30 days of notification."
        }
    ],
    "summary": {
        "total_issues": 7,
        "high_severity_issues": 6,
        "medium_severity_issues": 1,
        "low_severity_issues": 0,
        "average_severity": 4.285714285714286
    }
}
    return model_resp




@app.post("/redline_", response_model=RedlineResponse)
async def redline_contract(request: RedlineRequest):
    """
    Analyze a contract against user preferences and return identified issues.
    
    This endpoint takes user preferences and contract text, then uses AI to identify
    potential issues that conflict with the user's preferences.
    """
    try:
        # Call the redline function from redliner.py
        result = redline(request.preferences, request.contract)
        
        # Handle both JSON and string responses
        if isinstance(result, str):
            try:
                result = json.loads(result)
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="Invalid response format from AI model")
        
        # Ensure result is a list of issues
        if not isinstance(result, list):
            raise HTTPException(status_code=500, detail="Unexpected response format from AI model")
        
        # Convert to our Pydantic model format
        issues = []
        for item in result:
            if isinstance(item, dict):
                issue = IssueItem(
                    issue_name=item.get("issue_name", "Unknown Issue"),
                    line_range=item.get("line_range", {"start": "", "end": ""}),
                    severity=item.get("severity", 1),
                    issue_description=item.get("issue_description", ""),
                    issue_fix=item.get("issue_fix", ""),
                    replace_with=item.get("replace_with", "")
                )
                issues.append(issue)
        
        # Create summary statistics
        summary = {
            "total_issues": len(issues),
            "high_severity_issues": len([i for i in issues if i.severity >= 4]),
            "medium_severity_issues": len([i for i in issues if 2 <= i.severity <= 3]),
            "low_severity_issues": len([i for i in issues if i.severity == 1]),
            "average_severity": sum(i.severity for i in issues) / len(issues) if issues else 0
        }
        
        return RedlineResponse(issues=issues, summary=summary)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Contract Redliner API"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Contract Redliner API",
        "version": "1.0.0",
        "endpoints": {
            "POST /redline": "Analyze contract against preferences",
            "GET /health": "Health check",
            "GET /docs": "API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
