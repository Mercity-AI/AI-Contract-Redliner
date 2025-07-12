import { RedlineIssue } from '@/pages/ContractResults';

// Mock API function to simulate contract analysis
export const analyzeContract = async (preferences: string, contract: string): Promise<RedlineIssue[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock issues based on common contract problems
  const mockIssues: RedlineIssue[] = [
    {
      issue_name: "Liability Exposure",
      line_range: {
        start: "Company shall be liable",
        end: "any and all damages"
      },
      severity: 5,
      issue_description: "This clause creates unlimited liability exposure which conflicts with your preference to minimize liability.",
      issue_fix: "Add liability caps and limitations to protect against excessive exposure.",
      replace_with: "Company's liability shall be limited to the amount paid under this agreement in the twelve months preceding the claim, excluding gross negligence or willful misconduct"
    },
    {
      issue_name: "Vague Termination",
      line_range: {
        start: "Either party may terminate",
        end: "with reasonable notice"
      },
      severity: 4,
      issue_description: "Termination clause lacks specific notice periods and procedures as requested in your preferences.",
      issue_fix: "Define specific notice periods and termination procedures.",
      replace_with: "Either party may terminate this agreement with thirty (30) days written notice to the other party"
    },
    {
      issue_name: "IP Rights Unclear",
      line_range: {
        start: "All work product",
        end: "belongs to Company"
      },
      severity: 3,
      issue_description: "Intellectual property ownership is not clearly defined, which conflicts with your preference to protect IP rights.",
      issue_fix: "Clarify IP ownership and include specific protections for pre-existing IP.",
      replace_with: "All work product specifically created under this agreement belongs to Company, excluding Contractor's pre-existing intellectual property and general methodologies"
    }
  ];

  return mockIssues;
};

// Helper function to check if text contains specific phrases (for more realistic matching)
export const findIssuesInContract = (contract: string, preferences: string): RedlineIssue[] => {
  const issues: RedlineIssue[] = [];
  const lowerContract = contract.toLowerCase();

  // Check for liability issues
  if (lowerContract.includes('liable') || lowerContract.includes('liability')) {
    issues.push({
      issue_name: "Liability Review",
      line_range: {
        start: "liable",
        end: "damages"
      },
      severity: 4,
      issue_description: "Contract contains liability provisions that may need review based on your risk preferences.",
      issue_fix: "Consider adding liability limitations or exclusions.",
      replace_with: "liable, subject to the limitations set forth in Section [X],"
    });
  }

  // Check for termination clauses
  if (lowerContract.includes('terminate') || lowerContract.includes('termination')) {
    issues.push({
      issue_name: "Termination Terms",
      line_range: {
        start: "terminate",
        end: "agreement"
      },
      severity: 3,
      issue_description: "Termination provisions should be reviewed for clarity and fairness.",
      issue_fix: "Specify clear termination procedures and notice requirements.",
      replace_with: "terminate this agreement upon thirty (30) days written notice"
    });
  }

  // Check for IP-related terms
  if (lowerContract.includes('intellectual property') || lowerContract.includes('copyright') || lowerContract.includes('patent')) {
    issues.push({
      issue_name: "IP Protection",
      line_range: {
        start: "intellectual property",
        end: "rights"
      },
      severity: 2,
      issue_description: "Intellectual property clauses should align with your IP protection preferences.",
      issue_fix: "Ensure proper IP ownership and protection provisions.",
      replace_with: "intellectual property rights, with each party retaining ownership of their pre-existing IP"
    });
  }

  return issues;
};