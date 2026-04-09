import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Award, TrendingUp, TrendingDown, Minus, CheckCircle, Clock } from 'lucide-react';

const employees = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Developer',
    avatar: 'SC',
    metrics: {
      productivity: 95,
      tasksCompleted: 12,
      tasksInProgress: 2,
      avgCompletionTime: 2.3,
      codeQuality: 92,
      collaboration: 88,
    },
    trend: 'up',
    strengths: ['Fast delivery', 'Code quality', 'Mentoring'],
    areas: ['Work-life balance'],
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Developer',
    avatar: 'MJ',
    metrics: {
      productivity: 88,
      tasksCompleted: 9,
      tasksInProgress: 3,
      avgCompletionTime: 3.1,
      codeQuality: 85,
      collaboration: 90,
    },
    trend: 'up',
    strengths: ['Team player', 'Communication'],
    areas: ['Technical depth'],
  },
  {
    id: '3',
    name: 'Priya Patel',
    role: 'Developer',
    avatar: 'PP',
    metrics: {
      productivity: 92,
      tasksCompleted: 11,
      tasksInProgress: 2,
      avgCompletionTime: 2.7,
      codeQuality: 90,
      collaboration: 87,
    },
    trend: 'up',
    strengths: ['Problem solving', 'Architecture'],
    areas: ['Documentation'],
  },
  {
    id: '4',
    name: 'Alex Rivera',
    role: 'Junior Developer',
    avatar: 'AR',
    metrics: {
      productivity: 78,
      tasksCompleted: 8,
      tasksInProgress: 4,
      avgCompletionTime: 4.2,
      codeQuality: 80,
      collaboration: 85,
    },
    trend: 'stable',
    strengths: ['Eagerness to learn', 'Positive attitude'],
    areas: ['Speed', 'Testing practices'],
  },
];

export function EmployeePerformance() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'down':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Team Overview */}
      <Card className="bg-gradient-to-r from-[#30c2b7]/10 to-[#96efc1]/10 border-[#30c2b7]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-[#30c2b7]" />
            Team Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-3xl font-bold text-[#30c2b7]">40</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks Done</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-3xl font-bold text-[#70e1bf]">11</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-3xl font-bold text-[#96efc1]">3.1</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg Days/Task</p>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-3xl font-bold text-[#30c2b7]">88%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Team Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white font-semibold shadow-md">
                  {employee.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold dark:text-white">{employee.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{employee.role}</p>
                    </div>
                    <Badge variant="outline" className={getTrendColor(employee.trend)}>
                      <span className="flex items-center gap-1">
                        {getTrendIcon(employee.trend)}
                        {employee.trend}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Key Metrics */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Overall Productivity</span>
                  <span className="font-bold text-[#30c2b7]">{employee.metrics.productivity}%</span>
                </div>
                <Progress value={employee.metrics.productivity} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-bold text-[#30c2b7]">{employee.metrics.tasksCompleted}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Done</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-bold text-[#70e1bf]">{employee.metrics.tasksInProgress}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-lg font-bold text-[#96efc1]">{employee.metrics.avgCompletionTime}d</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg Time</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Code Quality</span>
                  <div className="flex items-center gap-2">
                    <Progress value={employee.metrics.codeQuality} className="h-1 w-20" />
                    <span className="font-semibold dark:text-white w-8">{employee.metrics.codeQuality}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Collaboration</span>
                  <div className="flex items-center gap-2">
                    <Progress value={employee.metrics.collaboration} className="h-1 w-20" />
                    <span className="font-semibold dark:text-white w-8">{employee.metrics.collaboration}%</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Areas */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Strengths
                  </p>
                  <ul className="space-y-0.5">
                    {employee.strengths.map((strength, idx) => (
                      <li key={idx} className="text-xs text-green-600 dark:text-green-300">
                        • {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Focus Areas
                  </p>
                  <ul className="space-y-0.5">
                    {employee.areas.map((area, idx) => (
                      <li key={idx} className="text-xs text-blue-600 dark:text-blue-300">
                        • {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
