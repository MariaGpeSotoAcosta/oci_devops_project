import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TrendingUp, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

const productivityData = [
  { name: 'Mon', value: 85 },
  { name: 'Tue', value: 92 },
  { name: 'Wed', value: 78 },
  { name: 'Thu', value: 95 },
  { name: 'Fri', value: 88 },
];

const teamMembers = [
  { name: 'Sarah Chen', productivity: 95, tasksCompleted: 12 },
  { name: 'Marcus Johnson', productivity: 88, tasksCompleted: 9 },
  { name: 'Priya Patel', productivity: 92, tasksCompleted: 11 },
  { name: 'Alex Rivera', productivity: 85, tasksCompleted: 8 },
];

const criticalTasks = [
  { title: 'Fix password reset bug', priority: 'critical', dueIn: '2 days' },
  { title: 'API endpoint security', priority: 'high', dueIn: '3 days' },
  { title: 'Mobile responsive layouts', priority: 'high', dueIn: '5 days' },
];

export function TeamInsights() {
  const topPerformer = teamMembers.reduce((prev, current) =>
    current.productivity > prev.productivity ? current : prev
  );

  const avgProductivity = Math.round(
    teamMembers.reduce((sum, member) => sum + member.productivity, 0) / teamMembers.length
  );

  const totalTasksCompleted = teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0);
  const taskCompletionRate = 76; // Mock data

  return (
    <div className="space-y-3">
      {/* Overall Productivity */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Weekly Productivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{avgProductivity}%</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              +12% from last week
            </Badge>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-20">
            {productivityData.map((day) => (
              <div key={day.name} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t transition-all"
                  style={{ 
                    height: `${day.value}%`,
                    backgroundColor: day.value >= 90 ? '#10b981' : '#6366f1'
                  }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{day.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performer */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            Top Performer This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
              {topPerformer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold dark:text-white">{topPerformer.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={topPerformer.productivity} className="h-2 flex-1" />
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  {topPerformer.productivity}%
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {topPerformer.tasksCompleted} tasks completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Tasks */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            Critical Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {criticalTasks.map((task, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                task.priority === 'critical' ? 'bg-red-500' : 'bg-orange-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-white">{task.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Due in {task.dueIn}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            Task Completion Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-white">Overall Completion</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {taskCompletionRate}%
                </span>
              </div>
              <Progress value={taskCompletionRate} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalTasksCompleted}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">12</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}