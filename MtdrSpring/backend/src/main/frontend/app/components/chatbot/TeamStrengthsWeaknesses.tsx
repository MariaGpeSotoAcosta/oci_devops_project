import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ThumbsUp, ThumbsDown, TrendingUp, Users } from 'lucide-react';

const strengths = [
  { 
    title: 'Strong Collaboration', 
    score: 92, 
    description: 'Team members work well together and communicate effectively',
    impact: 'high'
  },
  { 
    title: 'Technical Expertise', 
    score: 88, 
    description: 'High skill level in core technologies and best practices',
    impact: 'high'
  },
  { 
    title: 'Task Completion Rate', 
    score: 85, 
    description: 'Consistent delivery of assigned tasks on time',
    impact: 'medium'
  },
];

const weaknesses = [
  { 
    title: 'Code Review Speed', 
    score: 62, 
    description: 'PRs take longer than average to review and merge',
    impact: 'medium',
    recommendation: 'Implement daily code review time blocks'
  },
  { 
    title: 'Documentation', 
    score: 58, 
    description: 'Technical documentation needs improvement',
    impact: 'medium',
    recommendation: 'Allocate 10% of sprint time to documentation'
  },
  { 
    title: 'Sprint Planning Accuracy', 
    score: 65, 
    description: 'Story point estimates often differ from actual effort',
    impact: 'low',
    recommendation: 'Use historical data for better estimation'
  },
];

const teamMetrics = [
  { label: 'Communication', value: 90, color: '#30c2b7' },
  { label: 'Technical Skills', value: 88, color: '#70e1bf' },
  { label: 'Problem Solving', value: 85, color: '#96efc1' },
  { label: 'Time Management', value: 72, color: '#70e1bf' },
];

export function TeamStrengthsWeaknesses() {
  return (
    <div className="space-y-4 max-w-4xl">
      {/* Overview Metrics */}
      <Card className="bg-gradient-to-r from-[#30c2b7]/10 to-[#96efc1]/10 border-[#30c2b7]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#30c2b7]" />
            Team Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teamMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="transform -rotate-90 w-20 h-20">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={metric.color}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - metric.value / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: metric.color }}>
                      {metric.value}%
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium dark:text-white">{metric.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-300 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              Team Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths.map((strength, index) => (
              <div key={index} className="p-3 bg-white/60 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm dark:text-white">{strength.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {strength.description}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 ml-2">
                    {strength.impact}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={strength.score} className="h-2 flex-1" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {strength.score}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-300 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ThumbsDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="p-3 bg-white/60 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm dark:text-white">{weakness.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {weakness.description}
                    </p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 ml-2">
                    {weakness.impact}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={weakness.score} className="h-2 flex-1" />
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {weakness.score}%
                  </span>
                </div>
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-800 dark:text-blue-300">
                    💡 {weakness.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
