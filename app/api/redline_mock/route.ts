import { NextRequest, NextResponse } from 'next/server';

export interface RedlineRequest {
  preferences: string;
  contract: string;
}

export async function POST(request: NextRequest) {
  try {
    const { preferences, contract }: RedlineRequest = await request.json();

    if (!preferences || !contract) {
      return NextResponse.json(
        { error: 'Both preferences and contract are required' },
        { status: 400 }
      );
    }

    // Return mock data similar to the FastAPI version
    const mockResponse = {
      issues: [
        {
          issue_name: "Excessive Survival Period",
          line_range: {
            start: "All obligations under this Agreement",
            end: "termination of this Agreement."
          },
          severity: 5,
          issue_description: "7-year survival period for obligations creates prolonged liability exposure, conflicting with preference to minimize liability.",
          issue_fix: "Reduce survival period to align with standard confidentiality terms.",
          replace_with: "All obligations under this Agreement shall survive termination and continue for an additional three (3) years after expiration or termination of this Agreement."
        },
        {
          issue_name: "Long Notice Period",
          line_range: {
            start: "terminated by either party",
            end: "written notice."
          },
          severity: 4,
          issue_description: "90-day termination notice exceeds preferred 30-day period, delaying termination flexibility.",
          issue_fix: "Shorten notice period to 30 days.",
          replace_with: "terminated by either party with thirty (30) days written notice."
        },
        {
          issue_name: "Overly Broad IP Definition",
          line_range: {
            start: "Confidential Information means",
            end: "during the relationship."
          },
          severity: 4,
          issue_description: "Definition includes unmarked information and general business knowledge, creating ambiguity in IP protection.",
          issue_fix: "Narrow definition to clearly identifiable confidential materials.",
          replace_with: "\"Confidential Information\" means non-public information disclosed in tangible form and clearly marked as confidential, excluding information independently developed or publicly available."
        },
        {
          issue_name: "Unlimited Liability Remedies",
          line_range: {
            start: "Company shall be entitled",
            end: "law or equity."
          },
          severity: 5,
          issue_description: "Injunctive relief without bond and broad remedies create unlimited liability exposure.",
          issue_fix: "Limit remedies to monetary damages where appropriate.",
          replace_with: "Company may seek injunctive relief where monetary damages are inadequate, subject to applicable law."
        },
        {
          issue_name: "Excessive Non-Compete Term",
          line_range: {
            start: "for a period of five (5) years",
            end: "Company's offerings"
          },
          severity: 5,
          issue_description: "5-year non-compete post-termination is unreasonable and increases liability risk.",
          issue_fix: "Shorten duration to industry-standard period.",
          replace_with: "for a period of one (1) year thereafter, Recipient agrees not to directly compete with Company's core business in existing markets."
        },
        {
          issue_name: "Overly Broad Assignment",
          line_range: {
            start: "Company may assign this Agreement",
            end: "prior written approval."
          },
          severity: 3,
          issue_description: "Unilateral assignment right without Recipient consent creates uncontrolled liability transfer.",
          issue_fix: "Require mutual consent for assignments.",
          replace_with: "Neither party may assign this Agreement without prior written consent of the other party."
        },
        {
          issue_name: "Unreasonable Opportunity Assignment",
          line_range: {
            start: "Recipient must immediately notify",
            end: "to Company."
          },
          severity: 4,
          issue_description: "Mandatory assignment of all business opportunities overreaches IP protection needs.",
          issue_fix: "Limit to opportunities directly related to the confidential relationship.",
          replace_with: "Recipient shall notify Company of opportunities directly arising from Confidential Information. Company may request rights to such opportunities within 30 days of notification."
        }
      ],
      summary: {
        total_issues: 7,
        high_severity_issues: 6,
        medium_severity_issues: 1,
        low_severity_issues: 0,
        average_severity: 4.285714285714286
      }
    };

    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('Error processing mock redline request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 