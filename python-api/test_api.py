import requests
import json

# API endpoint
API_URL = "http://0.0.0.0:8000/redline"

# Test data
test_request = {
    "preferences": "I prefer short term contracts under 1 year, and no non-compete clauses.",
    "contract": """
    EMPLOYMENT AGREEMENT
    
    This Employment Agreement (the "Agreement") is entered into on January 1, 2024, between Company Inc. ("Company") and John Doe ("Employee").
    
    1. TERM OF EMPLOYMENT
    The Employee's employment shall commence on January 1, 2024, and shall continue for a period of three (3) years, unless terminated earlier in accordance with the provisions of this Agreement.
    
    2. NON-COMPETE CLAUSE
    During the term of employment and for a period of two (2) years following termination, the Employee shall not engage in any business activity that competes with the Company within a 50-mile radius of the Company's principal place of business.
    
    3. CONFIDENTIALITY
    The Employee agrees to maintain the confidentiality of all proprietary information and trade secrets of the Company.
    
    4. TERMINATION
    Either party may terminate this Agreement with thirty (30) days written notice.
    """
}

def test_redline_api():
    """Test the redline API endpoint"""
    try:
        print("Testing Contract Redliner API...")
        print("=" * 50)
        
        # Make the API request
        response = requests.post(API_URL, json=test_request)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API call successful!")
            print(f"Total issues found: {result['summary']['total_issues']}")
            print(f"High severity issues: {result['summary']['high_severity_issues']}")
            print(f"Average severity: {result['summary']['average_severity']:.2f}")
            
            print("\n📋 Issues found:")
            for i, issue in enumerate(result['issues'], 1):
                print(f"\n{i}. {issue['issue_name']} (Severity: {issue['severity']}/5)")
                print(f"   Description: {issue['issue_description']}")
                print(f"   Fix: {issue['issue_fix']}")
                print(f"   Replace with: {issue['replace_with']}")
        else:
            print(f"❌ API call failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_redline_api() 