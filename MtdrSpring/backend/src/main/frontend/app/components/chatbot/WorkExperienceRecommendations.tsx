import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Lightbulb, Target, Users, Clock, Calendar, Coffee } from 'lucide-react';

const recommendations = [
  {
    category: 'Workload Balance',
    icon: Target,
    priority: 'high',
    color: 'from-[#30c2b7] to-[#70e1bf]',
    suggestions: [
      {
        title: 'Redistribute High-Priority Tasks',
        description: 'Sarah Chen has 40% more story points than the team average. Consider redistributing 2-3 tasks.',
        impact: 'Prevents burnout and maintains team velocity',
        action: 'Review task allocation in next standup'
      },
      {
        title: 'Balance Junior-Senior Pairings',
        description: 'Pair junior developers with seniors for complex tasks to improve learning and code quality.',
        impact: 'Accelerates skill development by 30%',
        action: 'Implement pair programming sessions'
      }
    ]
  },
  {
    category: 'Team Collaboration',
    icon: Users,
    priority: 'medium',
    color: 'from-[#70e1bf] to-[#96efc1]',
    suggestions: [
      {
        title: 'Daily Sync Optimization',
        description: 'Average standup duration is 22 minutes. Aim for 10-15 minutes for better focus.',
        impact: 'Saves 35 minutes per week per team member',
        action: 'Use asynchronous updates for detailed issues'
      },
      {
        title: 'Cross-Team Knowledge Sharing',
        description: 'Schedule bi-weekly tech talks where team members share learnings.',
        impact: 'Improves team knowledge base and engagement',
        action: 'Start with 30-minute sessions every 2 weeks'
      }
    ]
  },
  {
    category: 'Work-Life Balance',
    icon: Coffee,
    priority: 'high',
    color: 'from-[#96efc1] to-[#30c2b7]',
    suggestions: [
      {
        title: 'Implement No-Meeting Fridays',
        description: 'Reserve Fridays for deep work with minimal interruptions.',
        impact: 'Increases focus time and productivity by 25%',
        action: 'Test for one month and measure results'
      },
      {
        title: 'Flexible Working Hours',
        description: 'Allow team members to choose their most productive hours within core overlap time.',
        impact: 'Improves satisfaction and reduces stress',
        action: 'Define 10am-3pm as core hours'
      }
    ]
  },
  {
    category: 'Process Improvement',
    icon: Clock,
    priority: 'medium',
    color: 'from-yellow-400 to-[#30c2b7]',
    suggestions: [
      {
        title: 'Automate Repetitive Tasks',
        description: 'Deployment and testing processes take 4 hours/week. Automate with CI/CD pipelines.',
        impact: 'Frees up 16 hours per month for value work',
        action: 'Prioritize automation in next sprint'
      },
      {
        title: 'Sprint Retrospective Actions',
        description: 'Only 40% of retro action items are completed. Create accountability system.',
        impact: 'Ensures continuous improvement',
        action: 'Assign owners and track in sprint board'
      }
    ]
  }
];

const quickWins = [
  { title: 'Celebrate Small Wins', description: 'Weekly shoutouts boost morale by 45%', icon: '🎉' },
  { title: 'Buffer Time', description: 'Add 20% buffer to estimates for better accuracy', icon: '⏱️' },
  { title: 'Focus Blocks', description: '2-hour uninterrupted work sessions increase output', icon: '🎯' },
];

export function WorkExperienceRecommendations() {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Quick Wins Banner */}
      <Card className="bg-gradient-to-r from-[#30c2b7] to-[#70e1bf] text-white border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Quick Wins - Implement This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickWins.map((win, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl mb-2">{win.icon}</div>
                <p className="font-semibold text-sm mb-1">{win.title}</p>
                <p className="text-xs text-white/80">{win.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Recommendations */}
      {recommendations.map((rec, index) => {
        const Icon = rec.icon;
        return (
          <Card key={index} className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${rec.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {rec.category}
                </CardTitle>
                <Badge variant="outline" className={priorityColors[rec.priority as keyof typeof priorityColors]}>
                  {rec.priority} priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {rec.suggestions.map((suggestion, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm dark:text-white mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-start gap-2 mb-2 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                    <span className="text-green-600 dark:text-green-400 text-xs font-semibold">IMPACT:</span>
                    <span className="text-xs text-green-700 dark:text-green-300">{suggestion.impact}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">ACTION:</span>
                    <span className="text-xs text-blue-700 dark:text-blue-300">{suggestion.action}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Implementation Timeline */}
      <Card className="bg-gradient-to-br from-[#30c2b7]/10 to-[#96efc1]/10 border-[#30c2b7]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#30c2b7]" />
            Suggested Implementation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded">
              <div className="w-16 text-sm font-semibold text-[#30c2b7]">Week 1</div>
              <div className="flex-1 text-sm dark:text-white">Implement quick wins and workload balancing</div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded">
              <div className="w-16 text-sm font-semibold text-[#70e1bf]">Week 2-3</div>
              <div className="flex-1 text-sm dark:text-white">Roll out collaboration improvements and process automation</div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded">
              <div className="w-16 text-sm font-semibold text-[#96efc1]">Week 4+</div>
              <div className="flex-1 text-sm dark:text-white">Measure impact and iterate based on feedback</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
