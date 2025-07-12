import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { RedlineIssue } from '@/pages/ContractResults';

export interface ContractViewerRef {
  scrollToHighlight: (issueIndex: number) => void;
}

interface ContractViewerProps {
  contract: string;
  issues: RedlineIssue[];
  acceptedIssues: Set<number>;
  rejectedIssues: Set<number>;
  selectedIssue: number | null;
  onSelectIssue: (index: number | null) => void;
  onScrollToSidebar?: (issueIndex: number) => void;
}

export const ContractViewer = forwardRef<ContractViewerRef, ContractViewerProps>(({
  contract,
  issues,
  acceptedIssues,
  rejectedIssues,
  selectedIssue,
  onSelectIssue,
  onScrollToSidebar,
}, ref) => {
  const [hoveredIssue, setHoveredIssue] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    scrollToHighlight: (issueIndex: number) => {
      const container = containerRef.current;
      if (!container) return;
      
      const highlight = container.querySelector(`[data-issue-index="${issueIndex}"]`) as HTMLElement;
      if (highlight) {
        highlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }));

  const findTextRanges = (text: string, startWords: string, endWords: string) => {
    // Simple case-insensitive search that handles overlapping scenarios
    const lowerText = text.toLowerCase();
    const lowerStart = startWords.toLowerCase();
    const lowerEnd = endWords.toLowerCase();
    
    const startIndex = lowerText.indexOf(lowerStart);
    if (startIndex === -1) return null;

    // Start searching for end phrase from the beginning of start phrase
    // This handles cases where phrases might overlap or be adjacent
    const endIndex = lowerText.indexOf(lowerEnd, startIndex);
    if (endIndex === -1) return null;

    return {
      start: startIndex,
      end: endIndex + endWords.length,
    };
  };

  const getSeverityColor = (severity: number, isAccepted: boolean, isRejected: boolean) => {
    // For rejected items, only dim the background, not the text
    const bgOpacity = isRejected ? 'bg-opacity-60 border-opacity-60' : '';
    
    if (isAccepted) return `bg-green-100 border border-green-500 text-green-900 ${bgOpacity}`;
    if (isRejected) return `bg-red-100 border border-red-500 text-red-900 ${bgOpacity}`;
    
    switch (severity) {
      case 5: return `bg-red-50 border border-red-300 text-red-800 ${bgOpacity}`;
      case 4: return `bg-orange-50 border border-orange-300 text-orange-800 ${bgOpacity}`;
      case 3: return `bg-yellow-50 border border-yellow-300 text-yellow-800 ${bgOpacity}`;
      case 2: return `bg-blue-50 border border-blue-300 text-blue-800 ${bgOpacity}`;
      case 1: return `bg-gray-50 border border-gray-300 text-gray-800 ${bgOpacity}`;
      default: return `bg-gray-50 border border-gray-300 text-gray-800 ${bgOpacity}`;
    }
  };

  const processContractWithHighlights = () => {
    // First, process the contract text with markdown
    const markdownProcessedLines = contract.split('\n').map(line => {
      // Handle headers
      if (line.startsWith('# ')) {
        return `<h1 class="text-2xl font-bold mb-4">${line.slice(2)}</h1>`;
      } else if (line.startsWith('## ')) {
        return `<h2 class="text-xl font-semibold mb-3">${line.slice(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        return `<h3 class="text-lg font-medium mb-2">${line.slice(4)}</h3>`;
      }
      
      // Handle bold text
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      
      // Handle italic text
      line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      
      // Return paragraph or empty line
      if (line.trim() === '') {
        return '<br>';
      } else {
        return `<p class="mb-2">${line}</p>`;
      }
    });
    
    let processedContract = markdownProcessedLines.join('');

    const highlights: Array<{
      start: number;
      end: number;
      issueIndex: number;
      issue: RedlineIssue;
    }> = [];

    // Find all issue ranges in the original contract text (before markdown processing)
    issues.forEach((issue, index) => {
      const range = findTextRanges(contract, issue.line_range.start, issue.line_range.end);
      if (range) {
        highlights.push({
          start: range.start,
          end: range.end,
          issueIndex: index,
          issue,
        });
      }
    });

    // Sort highlights by start position (reverse order for processing)
    highlights.sort((a, b) => b.start - a.start);

    // Process highlights from end to start to maintain correct positions
    highlights.forEach((highlight) => {
      const isAccepted = acceptedIssues.has(highlight.issueIndex);
      const isRejected = rejectedIssues.has(highlight.issueIndex);
      const isSelected = selectedIssue === highlight.issueIndex;

      const originalText = contract.slice(highlight.start, highlight.end);
      // Always show original text for rejected, replacement text for accepted
      const displayText = isAccepted ? highlight.issue.replace_with : originalText;
      
      const markElement = `<mark 
        class="highlight-mark cursor-pointer px-2 py-1 rounded-md transition-all duration-200 font-medium ${getSeverityColor(highlight.issue.severity, isAccepted, isRejected)} ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}"
        data-issue-index="${highlight.issueIndex}"
        data-tooltip="${highlight.issue.issue_name}"
      >${displayText}</mark>`;

      // Find and replace the original text in the processed markdown
      const escapedOriginalText = originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOriginalText, 'g');
      processedContract = processedContract.replace(regex, markElement);
    });

    return processedContract;
  };

  const handleMarkClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlight-mark')) {
      const issueIndex = parseInt(target.dataset.issueIndex || '');
      if (!isNaN(issueIndex)) {
        onSelectIssue(selectedIssue === issueIndex ? null : issueIndex);
        if (onScrollToSidebar) {
          onScrollToSidebar(issueIndex);
        }
      }
    }
  };

  const handleMarkHover = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlight-mark')) {
      const issueIndex = parseInt(target.dataset.issueIndex || '');
      if (!isNaN(issueIndex)) {
        setHoveredIssue(issueIndex);
      }
    }
  };

  const handleMarkLeave = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('highlight-mark')) {
      setHoveredIssue(null);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Contract Document</h3>
          <Badge variant="outline" className="text-xs">
            <Info className="mr-1 h-3 w-3" />
            Click highlights to view details in sidebar
          </Badge>
        </div>
        
        <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden">
          <div 
            className="prose max-w-none text-sm leading-7 p-4"
            dangerouslySetInnerHTML={{ __html: processContractWithHighlights() }}
            onClick={handleMarkClick}
            onMouseOver={handleMarkHover}
            onMouseOut={handleMarkLeave}
          />
          
          {/* Fast Tooltip */}
          {hoveredIssue !== null && issues[hoveredIssue] && (
            <div 
              className="fixed z-50 bg-popover text-popover-foreground p-3 rounded-md shadow-lg border max-w-xs pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
              style={{
                left: '50%',
                top: '20%',
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-medium text-sm mb-1">
                {issues[hoveredIssue].issue_name}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Severity: {issues[hoveredIssue].severity === 5 ? 'Critical' : 
                          issues[hoveredIssue].severity === 4 ? 'High' :
                          issues[hoveredIssue].severity === 3 ? 'Medium' :
                          issues[hoveredIssue].severity === 2 ? 'Low' : 'Info'}
              </div>
              <div className="text-xs">
                {issues[hoveredIssue].issue_description}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});