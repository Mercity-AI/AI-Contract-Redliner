import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Settings, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ContractInput = () => {
  const [preferences, setPreferences] = useState('I want to minimize liability, ensure clear termination clauses, and protect intellectual property rights. I prefer 30-day notice periods and want to avoid unlimited liability exposure.');
  const [contract, setContract] = useState(`SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [DATE] between Company ABC ("Company") and Contractor XYZ ("Contractor").

1. SERVICES
Contractor agrees to provide consulting services as described in Exhibit A.

2. LIABILITY
Company shall be liable for any and all damages arising from this agreement, including but not limited to direct, indirect, consequential, and punitive damages.

3. TERMINATION
Either party may terminate this agreement with reasonable notice to the other party.

4. INTELLECTUAL PROPERTY
All work product, including intellectual property rights, belongs to Company upon creation.

5. PAYMENT
Company agrees to pay Contractor the fees specified in Exhibit B.

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

This agreement shall be governed by the laws of [STATE].`);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      // Using mock API for demo - replace with actual API endpoint
      const { findIssuesInContract } = await import('@/lib/mockApi');
      const redlineData = findIssuesInContract(contract, preferences);
      
      // Store data in sessionStorage for the results page
      sessionStorage.setItem('contractData', JSON.stringify({
        originalContract: contract,
        preferences,
        issues: redlineData,
      }));

      navigate('/results');
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the contract. Please try again.",
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Contract Redlining Tool</h1>
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
            disabled={isLoading || !preferences.trim() || !contract.trim()}
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
        </div>
      </div>
    </div>
  );
};

export default ContractInput;