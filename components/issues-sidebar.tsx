import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, X, ChevronRight, ChevronLeft, AlertTriangle, Info, AlertCircle, Zap, XCircle } from 'lucide-react';
import { RedlineIssue } from '@/app/results/page';

export interface IssuesSidebarRef {
  scrollToIssue: (issueIndex: number) => void;
}

interface IssuesSidebarProps {
  issues: RedlineIssue[];
  acceptedIssues: Set<number>;
  rejectedIssues: Set<number>;
  onAcceptIssue: (index: number) => void;
  onRejectIssue: (index: number) => void;
  selectedIssue: number | null;
  onSelectIssue: (index: number | null) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onScrollToContract?: (issueIndex: number) => void;
}

export const IssuesSidebar = forwardRef<IssuesSidebarRef, IssuesSidebarProps>(({
  issues,
  acceptedIssues,
  rejectedIssues,
  onAcceptIssue,
  onRejectIssue,
  selectedIssue,
  onSelectIssue,
  isCollapsed,
  onToggleCollapse,
  onScrollToContract,
}, ref) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToIssue: (issueIndex: number) => {
      const scrollArea = scrollAreaRef.current;
      if (!scrollArea) return;
      
      const issueCard = scrollArea.querySelector(`[data-issue-index="${issueIndex}"]`) as HTMLElement;
      if (issueCard) {
        issueCard.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }));

  const getSeverityIcon = (severity: number) => {
    switch (severity) {
      case 5: return <XCircle className="h-4 w-4 text-red-600" />;
      case 4: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 3: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 2: return <Zap className="h-4 w-4 text-blue-600" />;
      case 1: return <Info className="h-4 w-4 text-gray-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Info';
      default: return 'Info';
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'bg-red-100 text-red-800 border-red-200';
      case 4: return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (issueIndex: number) => {
    if (acceptedIssues.has(issueIndex)) return 'border-l-4 border-l-green-500 bg-green-50';
    if (rejectedIssues.has(issueIndex)) return 'border-l-4 border-l-red-500 bg-red-50';
    return 'border-l-4 border-l-gray-200';
  };

  return (
    <div 
      className={`
        fixed right-0 top-[135px] h-[calc(100vh-135px)] bg-background border-l transition-all duration-300 z-50
        ${isCollapsed ? 'w-12' : 'w-96'}
      `}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="absolute -left-10 top-4 bg-background border"
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {!isCollapsed && (
        <div className="h-full flex flex-col">
          <Card className="border-0 rounded-none h-full flex flex-col">
            <CardHeader className="pt-4 pb-3 flex-shrink-0">
              <CardTitle className="text-lg">Contract Issues</CardTitle>
              <div className="flex gap-2 text-sm">
                <Badge variant="outline" className="text-xs">
                  {issues.length} Total
                </Badge>
                <Badge variant="outline" className="text-xs bg-green-50">
                  {acceptedIssues.size} Accepted
                </Badge>
                <Badge variant="outline" className="text-xs bg-red-50">
                  {rejectedIssues.size} Rejected
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea ref={scrollAreaRef} className="h-full">
                <div className="space-y-3 p-4 pb-8">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      data-issue-index={index}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all duration-200
                        ${getStatusColor(index)}
                        ${selectedIssue === index ? 'ring-2 ring-primary' : ''}
                        hover:shadow-md
                      `}
                      onClick={() => {
                        onSelectIssue(selectedIssue === index ? null : index);
                        if (onScrollToContract && selectedIssue !== index) {
                          onScrollToContract(index);
                        }
                      }}
                    >
                      {/* Issue Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(issue.severity)}
                          <h4 className="font-medium text-sm">{issue.issue_name}</h4>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(issue.severity)}`}
                        >
                          {getSeverityLabel(issue.severity)}
                        </Badge>
                      </div>

                      {/* Issue Description */}
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {issue.issue_description}
                      </p>

                      {/* Line Range Info */}
                      <div className="text-xs bg-muted/50 p-2 rounded mb-3">
                        <span className="font-medium">Found in: </span>
                        <span className="font-mono">"{issue.line_range.start}" ... "{issue.line_range.end}"</span>
                      </div>

                      {/* Suggested Fix */}
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1 text-muted-foreground">Suggested Fix:</p>
                        <p className="text-xs bg-blue-50 p-2 rounded leading-relaxed">
                          {issue.issue_fix}
                        </p>
                      </div>

                      {/* Replacement Text */}
                      <div className="mb-3">
                        <p className="text-xs font-medium mb-1 text-muted-foreground">Replace with:</p>
                        <p className="text-xs bg-green-50 p-2 rounded font-mono leading-relaxed">
                          {issue.replace_with}
                        </p>
                      </div>

                      <Separator className="my-3" />

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={acceptedIssues.has(index) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcceptIssue(index);
                          }}
                          className="flex-1 text-xs"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          {acceptedIssues.has(index) ? 'Accepted' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant={rejectedIssues.has(index) ? "destructive" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectIssue(index);
                          }}
                          className="flex-1 text-xs"
                        >
                          <X className="mr-1 h-3 w-3" />
                          {rejectedIssues.has(index) ? 'Rejected' : 'Reject'}
                        </Button>
                      </div>

                      {/* Status Message */}
                      {acceptedIssues.has(index) && (
                        <div className="mt-2 text-xs text-green-700 bg-green-100 p-2 rounded">
                          ✓ This change has been accepted and will be applied to the contract.
                        </div>
                      )}
                      
                      {rejectedIssues.has(index) && (
                        <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                          ✗ This change has been rejected and the original text will remain.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});