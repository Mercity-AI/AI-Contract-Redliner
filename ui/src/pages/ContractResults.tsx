import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { ContractViewer, ContractViewerRef } from '@/components/ContractViewer';
import { IssuesSidebar, IssuesSidebarRef } from '@/components/IssuesSidebar';
import { useToast } from '@/hooks/use-toast';

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

interface ContractData {
  originalContract: string;
  preferences: string;
  issues: RedlineIssue[];
}

const ContractResults = () => {
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [acceptedIssues, setAcceptedIssues] = useState<Set<number>>(new Set());
  const [rejectedIssues, setRejectedIssues] = useState<Set<number>>(new Set());
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const contractViewerRef = useRef<ContractViewerRef>(null);
  const sidebarRef = useRef<IssuesSidebarRef>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('contractData');
    if (!storedData) {
      navigate('/');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setContractData(parsedData);
    } catch (error) {
      toast({
        title: "Data Error",
        description: "Failed to load contract data. Please try again.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [navigate, toast]);

  const handleAcceptIssue = (issueIndex: number) => {
    const newAccepted = new Set(acceptedIssues);
    const newRejected = new Set(rejectedIssues);
    
    if (acceptedIssues.has(issueIndex)) {
      // If already accepted, revert to default state
      newAccepted.delete(issueIndex);
      toast({
        title: "Change Reverted",
        description: "The issue has been reverted to default state.",
      });
    } else {
      // Accept the issue
      newAccepted.add(issueIndex);
      newRejected.delete(issueIndex);
      toast({
        title: "Change Accepted",
        description: "The suggested replacement has been accepted.",
      });
    }
    
    setAcceptedIssues(newAccepted);
    setRejectedIssues(newRejected);
  };

  const handleRejectIssue = (issueIndex: number) => {
    const newAccepted = new Set(acceptedIssues);
    const newRejected = new Set(rejectedIssues);
    
    if (rejectedIssues.has(issueIndex)) {
      // If already rejected, revert to default state
      newRejected.delete(issueIndex);
      toast({
        title: "Change Reverted",
        description: "The issue has been reverted to default state.",
      });
    } else {
      // Reject the issue
      newRejected.add(issueIndex);
      newAccepted.delete(issueIndex);
      toast({
        title: "Change Rejected",
        description: "The suggested replacement has been rejected.",
      });
    }
    
    setAcceptedIssues(newAccepted);
    setRejectedIssues(newRejected);
  };

  if (!contractData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Contract Data Found</h2>
          <p className="text-muted-foreground mb-4">Please start by analyzing a contract first.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Input
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-full mx-auto p-4 pr-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Input
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Contract Analysis Results</h1>
                <p className="text-muted-foreground">
                  {contractData.issues.length} issues found
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-50">
                {acceptedIssues.size} Accepted
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                {rejectedIssues.size} Rejected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Contract Viewer */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'pr-12' : 'pr-96'}`}>
        <div className="p-4 h-[calc(100vh-120px)]">
          <ContractViewer
            ref={contractViewerRef}
            contract={contractData.originalContract}
            issues={contractData.issues}
            acceptedIssues={acceptedIssues}
            rejectedIssues={rejectedIssues}
            selectedIssue={selectedIssue}
            onSelectIssue={(index) => {
              setSelectedIssue(index);
              if (index !== null && sidebarCollapsed) {
                setSidebarCollapsed(false);
              }
            }}
            onScrollToSidebar={(issueIndex) => {
              sidebarRef.current?.scrollToIssue(issueIndex);
            }}
          />
        </div>
      </div>

      {/* Issues Sidebar */}
      <IssuesSidebar
        ref={sidebarRef}
        issues={contractData.issues}
        acceptedIssues={acceptedIssues}
        rejectedIssues={rejectedIssues}
        onAcceptIssue={handleAcceptIssue}
        onRejectIssue={handleRejectIssue}
        selectedIssue={selectedIssue}
        onSelectIssue={setSelectedIssue}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onScrollToContract={(issueIndex) => {
          contractViewerRef.current?.scrollToHighlight(issueIndex);
        }}
      />
    </div>
  );
};

export default ContractResults;