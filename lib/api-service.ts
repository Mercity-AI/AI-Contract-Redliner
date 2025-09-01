export interface RedlineIssue {
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

export interface RedlineRequest {
  preferences: string;
  contract: string;
}

export interface RedlineResponse {
  issues: RedlineIssue[];
  summary: {
    total_issues: number;
    high_severity_issues: number;
    medium_severity_issues: number;
    low_severity_issues: number;
    average_severity: number;
  };
}

export const analyzeContract = async (
  preferences: string,
  contract: string
): Promise<RedlineResponse> => {
  try {
    const response = await fetch('/api/redline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
        contract,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: RedlineResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze contract: ${error.message}`);
    }
    throw new Error('Failed to analyze contract: Unknown error');
  }
};

export const analyzeContractMock = async (
  preferences: string,
  contract: string
): Promise<RedlineResponse> => {
  try {
    const response = await fetch('/api/redline_mock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preferences,
        contract,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: RedlineResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to analyze contract: ${error.message}`);
    }
    throw new Error('Failed to analyze contract: Unknown error');
  }
};

export const healthCheck = async (): Promise<{ status: string; service: string }> => {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error('API health check failed');
  }
}; 