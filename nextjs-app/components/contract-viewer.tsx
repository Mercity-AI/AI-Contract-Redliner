import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { RedlineIssue } from '@/app/results/page';

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
    // First try exact matching (original logic)
    const lowerText = text.toLowerCase();
    const lowerStart = startWords.toLowerCase();
    const lowerEnd = endWords.toLowerCase();
    
    let startIndex = lowerText.indexOf(lowerStart);
    if (startIndex !== -1) {
      const endIndex = lowerText.indexOf(lowerEnd, startIndex);
      if (endIndex !== -1) {
        return {
          start: startIndex,
          end: endIndex + endWords.length,
        };
      }
    }

    // If exact match fails, try flexible regex-based matching
    const escapeRegex = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const createFlexiblePattern = (phrase: string) => {
      // Split phrase into words and escape them
      const words = phrase.trim().split(/\s+/).map(word => escapeRegex(word));
      
      // Join words with very limited flexible spacing (only whitespace and basic punctuation)
      return words.join('\\s*[\\s.,;:!?()\\[\\]\\-*"\']*\\s*');
    };

    const flexibleStartPattern = createFlexiblePattern(startWords);
    const flexibleEndPattern = createFlexiblePattern(endWords);

    // Try to find start with flexible pattern
    const startRegex = new RegExp(flexibleStartPattern, 'i');
    const startMatch = text.match(startRegex);
    
    if (!startMatch) return null;

    const flexibleStartIndex = startMatch.index!;
    
    // Search for end pattern from start position
    const textFromStart = text.slice(flexibleStartIndex);
    const endRegex = new RegExp(flexibleEndPattern, 'i');
    const endMatch = textFromStart.match(endRegex);
    
    if (!endMatch) return null;

    const flexibleEndIndex = flexibleStartIndex + endMatch.index! + endMatch[0].length;

    return {
      start: flexibleStartIndex,
      end: flexibleEndIndex,
    };
  };

  const getSeverityColor = (severity: number, isAccepted: boolean, isRejected: boolean) => {
    // For rejected items, reduce overall opacity
    const opacity = isRejected ? 'opacity-50' : '';
    
    if (isAccepted) return `bg-green-100 border border-green-500 text-green-900 ${opacity}`;
    if (isRejected) return `bg-red-100 border border-red-500 text-red-900 ${opacity}`;
    
    switch (severity) {
      case 5: return `bg-red-50 border border-red-300 text-red-800 ${opacity}`;
      case 4: return `bg-orange-50 border border-orange-300 text-orange-800 ${opacity}`;
      case 3: return `bg-yellow-50 border border-yellow-300 text-yellow-800 ${opacity}`;
      case 2: return `bg-blue-50 border border-blue-300 text-blue-800 ${opacity}`;
      case 1: return `bg-gray-50 border border-gray-300 text-gray-800 ${opacity}`;
      default: return `bg-gray-50 border border-gray-300 text-gray-800 ${opacity}`;
    }
  };

  const processContractWithHighlights = () => {
    // First, find all highlight ranges in the original text
    const highlights: Array<{
      start: number;
      end: number;
      issueIndex: number;
      issue: RedlineIssue;
    }> = [];

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

    // Remove overlapping highlights - keep the first one found
    const nonOverlappingHighlights: Array<{
      start: number;
      end: number;
      issueIndex: number;
      issue: RedlineIssue;
    }> = [];
    highlights.sort((a, b) => a.start - b.start); // Sort by start position
    
    for (const highlight of highlights) {
      const hasOverlap = nonOverlappingHighlights.some(existing => 
        (highlight.start >= existing.start && highlight.start < existing.end) ||
        (highlight.end > existing.start && highlight.end <= existing.end) ||
        (highlight.start <= existing.start && highlight.end >= existing.end)
      );
      
      if (!hasOverlap) {
        nonOverlappingHighlights.push(highlight);
      }
    }

    // Sort highlights by start position (reverse order for processing)
    nonOverlappingHighlights.sort((a, b) => b.start - a.start);

    // Apply highlights to the original text using placeholder markers
    let textWithPlaceholders = contract;
    const placeholderMap = new Map<string, string>();

    nonOverlappingHighlights.forEach((highlight) => {
      const isAccepted = acceptedIssues.has(highlight.issueIndex);
      const isRejected = rejectedIssues.has(highlight.issueIndex);
      const isSelected = selectedIssue === highlight.issueIndex;

      const originalText = contract.slice(highlight.start, highlight.end);
      let displayText = originalText;
      let adjustedStart = highlight.start;
      let adjustedEnd = highlight.end;
      
      // Check if this highlight starts at the beginning of a line and contains markdown syntax
      const lineStart = contract.lastIndexOf('\n', highlight.start - 1) + 1;
      const isLineStart = adjustedStart === lineStart;
      
      if (isLineStart) {
        // Check for header markdown syntax and exclude it from highlighting
        const headerMatch = originalText.match(/^(#{1,3}\s+)/);
        if (headerMatch) {
          // Adjust the highlight to exclude the markdown syntax
          const markdownLength = headerMatch[1].length;
          adjustedStart += markdownLength;
          displayText = originalText.slice(markdownLength);
          
          // If the entire text was just the header markdown, skip this highlight
          if (displayText.trim() === '') {
            return;
          }
        }
      }
      
      // Create unique placeholder
      const placeholderId = `__HIGHLIGHT_${highlight.issueIndex}__`;
      
      // Store the actual HTML element for this placeholder
      const markElement = `<mark 
        class="highlight-mark cursor-pointer px-2 py-1 rounded-md transition-all duration-200 font-medium ${getSeverityColor(highlight.issue.severity, isAccepted, isRejected)} ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}"
        data-issue-index="${highlight.issueIndex}"
        data-tooltip="${highlight.issue.issue_name}"
        style="white-space: pre-wrap; line-height: inherit;"
      >${displayText}</mark>`;
      
      placeholderMap.set(placeholderId, markElement);

      // Replace the original text with placeholder
      // If we adjusted the start, we need to preserve the markdown syntax
      if (adjustedStart !== highlight.start) {
        const beforeText = textWithPlaceholders.slice(0, highlight.start);
        const afterText = textWithPlaceholders.slice(highlight.end);
        const markdownPrefix = contract.slice(highlight.start, adjustedStart);
        textWithPlaceholders = beforeText + markdownPrefix + placeholderId + afterText;
      } else {
        const beforeText = textWithPlaceholders.slice(0, highlight.start);
        const afterText = textWithPlaceholders.slice(highlight.end);
        textWithPlaceholders = beforeText + placeholderId + afterText;
      }
    });

    // Now process the text with markdown (placeholders remain intact)
    const markdownProcessedLines = textWithPlaceholders.split('\n').map(line => {
      // Handle headers
      if (line.startsWith('# ')) {
        return `<h1 class="text-2xl font-bold mb-4">${line.slice(2)}</h1>`;
      } else if (line.startsWith('## ')) {
        return `<h2 class="text-xl font-semibold mb-3">${line.slice(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        return `<h3 class="text-lg font-medium mb-2">${line.slice(4)}</h3>`;
      }
      
      // Handle bold text (but avoid placeholders)
      line = line.replace(/\*\*((?!__HIGHLIGHT_).*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
      
      // Handle italic text (but avoid placeholders)
      line = line.replace(/\*((?!__HIGHLIGHT_).*?)\*/g, '<em class="italic">$1</em>');
      
      // Return paragraph or empty line
      if (line.trim() === '') {
        return '<br>';
      } else {
        return `<p class="mb-2">${line}</p>`;
      }
    });
    
    let processedContract = markdownProcessedLines.join('');

    // Finally, replace all placeholders with actual highlight elements
    placeholderMap.forEach((markElement, placeholderId) => {
      processedContract = processedContract.replace(placeholderId, markElement);
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
        
        <div ref={containerRef} className="h-full overflow-y-auto overflow-x-hidden">
          <div 
            className="prose max-w-none text-sm p-4"
            style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.4' }}
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