'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Settings, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContractInput() {
  const [preferences, setPreferences] = useState('I want to minimize liability, ensure clear termination clauses, and protect intellectual property rights. I prefer 30-day notice periods and want to avoid unlimited liability exposure.');
  const [contract, setContract] = useState(`SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [DATE] between Company ABC ("Company") and Contractor XYZ ("Contractor").

1. SERVICES
Contractor agrees to provide consulting services as described in Exhibit A.

2. LIABILITY
Company shall be liable for any and all damages arising from this agreement, including but not limited to direct, indirect, consequential, and punitive damages.

3. TERMINATION
This agreement may be terminated by either party with ninety (90) days written notice.

4. INTELLECTUAL PROPERTY
All work product, including intellectual property rights, belongs to Company upon creation.

5. PAYMENT
Company agrees to pay Contractor the fees specified in Exhibit B.

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

7. SURVIVAL
All obligations under this Agreement shall survive and continue for seven (7) years after expiration or termination of this Agreement.

8. ASSIGNMENT
Company may assign this Agreement to any third party without prior written approval.

9. NON-COMPETE
For a period of five (5) years after termination, Contractor shall not compete with Company's offerings in any market.

10. REMEDIES
Company shall be entitled to injunctive relief and all other remedies available at law or equity.

11. CONFIDENTIALITY
"Confidential Information" means any and all information, data, materials, methods, techniques, processes, practices, formulas, instructions, sketches, drawings, designs, blueprints, models, samples, flow charts, data, computer programs, disks, diskettes, tapes, devices, business plans, customer lists, financial information, sales and marketing plans, personnel information, or other business information disclosed by either party, whether orally, in writing, or in any other form, and whether or not marked as confidential. Confidential Information also includes any information disclosed by third parties to either party under confidentiality obligations, any derivatives of Confidential Information, and any information that Recipient learns about Company's business operations, competitive position, or future plans during the relationship.

12. OPPORTUNITY ASSIGNMENT
Recipient must immediately notify Company of any business opportunities and assign all rights to Company.

This agreement shall be governed by the laws of [STATE].`);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      } catch (error) {
        setApiStatus('disconnected');
        console.warn('API health check failed:', error);
      }
    };

    checkApiHealth();
  }, []);

  const handleSubmit = async () => {
    if (!preferences.trim() || !contract.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both user preferences and contract text.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the Next.js API endpoint
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

      const data = await response.json();
      
      // Store data in sessionStorage for the results page
      sessionStorage.setItem('contractData', JSON.stringify({
        originalContract: contract,
        preferences,
        issues: data.issues,
        summary: data.summary,
      }));

      toast({
        title: "Analysis Complete",
        description: `Found ${data.issues.length} issues in your contract.`,
      });

      router.push('/results');
    } catch (error) {
      console.error('Contract analysis error:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process the contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-foreground">Contract Redlining Tool</h1>
            <Badge 
              variant={apiStatus === 'connected' ? 'default' : apiStatus === 'disconnected' ? 'destructive' : 'secondary'}
              className="ml-2"
            >
              {apiStatus === 'connected' && <Wifi className="h-3 w-3 mr-1" />}
              {apiStatus === 'disconnected' && <WifiOff className="h-3 w-3 mr-1" />}
              {apiStatus === 'checking' ? 'Checking API...' : 
               apiStatus === 'connected' ? 'API Connected' : 'API Disconnected'}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Analyze contracts against your preferences and get detailed redlining suggestions
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Sample data is pre-loaded for demonstration purposes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                User Preferences
              </CardTitle>
              <CardDescription>
                Describe your requirements, concerns, and what you want to prioritize in the contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="preferences" className="sr-only">
                User Preferences
              </Label>
              <Textarea
                id="preferences"
                placeholder="e.g., I want to minimize liability, ensure clear termination clauses, and protect intellectual property rights..."
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Text
              </CardTitle>
              <CardDescription>
                Paste the contract text you want to analyze and redline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="contract" className="sr-only">
                Contract Text
              </Label>
              <Textarea
                id="contract"
                placeholder="Paste your contract text here..."
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                className="min-h-[300px] resize-none"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !preferences.trim() || !contract.trim() || apiStatus === 'disconnected'}
            size="lg"
            className="min-w-[200px]"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                Analyze Contract
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          {apiStatus === 'disconnected' && (
            <p className="text-sm text-red-600 mt-2">
              Cannot analyze contract - API is disconnected. Please ensure the backend server is running.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 