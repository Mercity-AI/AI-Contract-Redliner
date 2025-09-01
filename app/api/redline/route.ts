import { NextRequest, NextResponse } from 'next/server';
import { redline } from '@/lib/redliner';

export interface RedlineRequest {
  preferences: string;
  contract: string;
}

export interface IssueItem {
  issue_name: string;
  line_range: {
    start: string;
    end: string;
  };
  severity: number;
  issue_description: string;
  issue_fix: string;
  replace_with: string;
}

export interface RedlineResponse {
  issues: IssueItem[];
  summary: {
    total_issues: number;
    high_severity_issues: number;
    medium_severity_issues: number;
    low_severity_issues: number;
    average_severity: number;
  };
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

    // Call the redline function
    const result = await redline(preferences, contract);

    // Handle both JSON and string responses
    let issues: IssueItem[] = [];
    if (typeof result === 'string') {
      try {
        issues = JSON.parse(result);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid response format from AI model' },
          { status: 500 }
        );
      }
    } else if (Array.isArray(result)) {
      issues = result;
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format from AI model' },
        { status: 500 }
      );
    }

    // Validate and clean the issues
    const validIssues = issues.filter((item: any) => {
      return (
        item &&
        typeof item === 'object' &&
        typeof item.issue_name === 'string' &&
        typeof item.line_range === 'object' &&
        typeof item.severity === 'number' &&
        typeof item.issue_description === 'string' &&
        typeof item.issue_fix === 'string' &&
        typeof item.replace_with === 'string'
      );
    });

    // Create summary statistics
    const summary = {
      total_issues: validIssues.length,
      high_severity_issues: validIssues.filter(i => i.severity >= 4).length,
      medium_severity_issues: validIssues.filter(i => i.severity >= 2 && i.severity <= 3).length,
      low_severity_issues: validIssues.filter(i => i.severity === 1).length,
      average_severity: validIssues.length > 0 
        ? validIssues.reduce((sum, i) => sum + i.severity, 0) / validIssues.length 
        : 0
    };

    const response: RedlineResponse = {
      issues: validIssues,
      summary
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing redline request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 