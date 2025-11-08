import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface URLInputFormProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
}

export default function URLInputForm({ onAnalyze, isLoading = false }: URLInputFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <CardTitle className="text-4xl font-bold">Radius</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Analyze your brand's visibility across AI platforms like ChatGPT, Claude, Gemini, and Perplexity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="website-url" className="text-sm font-medium">
                Website URL
              </label>
              <Input
                id="website-url"
                data-testid="input-website-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-lg"
                disabled={isLoading}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter your website URL to discover competitors and analyze AI visibility
              </p>
            </div>

            <Button
              type="submit"
              data-testid="button-analyze"
              className="w-full"
              size="lg"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Visibility"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">Example URLs:</p>
            <div className="flex flex-wrap gap-2">
              {["stripe.com", "notion.so", "figma.com"].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  data-testid={`button-example-${example}`}
                  onClick={() => setUrl(`https://${example}`)}
                  disabled={isLoading}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
