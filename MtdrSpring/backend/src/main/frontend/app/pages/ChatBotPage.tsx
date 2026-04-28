import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIInsight {
  week: string;
  content: string;
  generatedAt: string;
}

export function ChatBotPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const dummyInsights: AIInsight[] = [
    {
      week: "2026-W17",
      generatedAt: new Date().toISOString(),
      content: `# Weekly Team Performance Insights

  ## 🚀 Task Completion Velocity
  **Status:** ⚠️ Needs Attention  
  Your team is completing **62%** of tasks.

  - Break down large tasks
  - Review sprint capacity
  - Remove blockers

  ## ⚖️ Task Priority Distribution
  **Status:** ⚠️ High Priority Overload  
  **55%** of tasks are high priority.

  - Re-evaluate urgency
  - Avoid over-prioritization

  ## 👥 Team Workload Balance
  **Status:** ⚠️ Uneven Distribution  

  **Most loaded:** Alice  
  **Least loaded:** Bob
  `
    },
    {
      week: "2026-W16",
      generatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      content: `# Weekly Team Performance Insights

  ## 🚀 Task Completion Velocity
  **Status:** ✅ Good Performance  
  Completion rate is **82%**

  ## ⚖️ Task Priority Distribution
  **Status:** ✅ Balanced  

  ## 👥 Team Workload Balance
  **Status:** ✅ Well Distributed
  `
    }
  ];

  // Fetch insights from Spring Boot backend
  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/insights');

      if (!response.ok) throw new Error();

      const data = await response.json();
      setInsights(data);

    } catch (err) {
      console.warn("⚠️ Backend not available, using mock data");

      // 👇 fallback instead of error
      setInsights(dummyInsights);

      // optional: show softer message
      setError(null); 
    } finally {
      setIsLoading(false);
    }
  };

  // Generate new insights for current week
  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // Replace with your actual Spring Boot endpoint
      const response = await fetch('/api/ai/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const newInsight = await response.json();
      setInsights([newInsight, ...insights]);
      setCurrentWeekIndex(0);
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setError('Could not generate new insights. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const currentInsight = insights[currentWeekIndex];
  const canGoPrevious = currentWeekIndex > 0;
  const canGoNext = currentWeekIndex < insights.length - 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#30c2b7] to-[#70e1bf] rounded-lg flex items-center justify-center shadow-md">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            AI Insights
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Weekly team performance insights powered by AI
          </p>
        </div>

        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          className="bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] hover:from-[#28aaa0] hover:to-[#5fd1a8] text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Insights
            </>
          )}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">Loading insights...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && insights.length === 0 && !error && (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                No insights yet
              </p>
              <p className="text-sm text-center max-w-md mb-4">
                Generate your first AI-powered insight to get personalized recommendations for improving your team's performance.
              </p>
              <Button
                onClick={generateInsights}
                disabled={isGenerating}
                className="bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] hover:from-[#28aaa0] hover:to-[#5fd1a8] text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights display */}
      {!isLoading && currentInsight && (
        <div className="space-y-4">
          {/* Week navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#30c2b7]" />
                  <div>
                    <p className="text-sm font-medium dark:text-white">
                      Week {currentInsight.week}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generated {new Date(currentInsight.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {currentWeekIndex + 1} of {insights.length}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekIndex(currentWeekIndex - 1)}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeekIndex(currentWeekIndex + 1)}
                    disabled={!canGoNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights content */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-[#30c2b7]" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl font-semibold mb-3 mt-6 text-gray-900 dark:text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-white" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="mb-4 ml-6 space-y-2 list-disc" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="mb-4 ml-6 space-y-2 list-decimal" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-gray-700 dark:text-gray-300" {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code
                          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-[#30c2b7] rounded text-sm font-mono"
                          {...props}
                        />
                      ) : (
                        <code
                          className="block p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono overflow-x-auto"
                          {...props}
                        />
                      ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-[#30c2b7] pl-4 py-2 my-4 bg-gray-50 dark:bg-gray-800/50 rounded-r"
                        {...props}
                      />
                    ),
                  }}
                >
                  {currentInsight.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}