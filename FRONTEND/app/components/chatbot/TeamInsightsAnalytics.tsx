import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { TrendingUp, Award, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

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

export function TeamInsightsAnalytics() {
  const topPerformer = teamMembers.reduce((prev, current) =>
    current.productivity > prev.productivity ? current : prev
  );

  const avgProductivity = Math.round(
    teamMembers.reduce((sum, member) => sum + member.productivity, 0) / teamMembers.length
  );

  const totalTasksCompleted = teamMembers.reduce((sum, member) => sum + member.tasksCompleted, 0);
  const taskCompletionRate = 76;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      {/* Overall Productivity */}
      <Card className="bg-gradient-to-br from-[#30c2b7]/10 to-[#70e1bf]/10 border-[#30c2b7]/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#30c2b7]" />
            Weekly Productivity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl font-bold text-[#30c2b7]">{avgProductivity}%</span>
            <Badge className="bg-[#96efc1] text-gray-900 border-[#70e1bf]">
              +12% vs last week
            </Badge>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-24">
            {productivityData.map((day) => (
              <div key={day.name} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t transition-all"
                  style={{ 
                    height: `${day.value}%`,
                    background: day.value >= 90 
                      ? 'linear-gradient(to top, #30c2b7, #70e1bf)' 
                      : 'linear-gradient(to top, #70e1bf, #96efc1)'
                  }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">{day.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performer */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-300 dark:border-yellow-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            Top Performer This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
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
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-300 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            Critical Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {criticalTasks.map((task, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${
                task.priority === 'critical' ? 'bg-red-500' : 'bg-orange-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium dark:text-white">{task.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Due in {task.dueIn}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="bg-gradient-to-br from-[#96efc1]/20 to-[#30c2b7]/20 border-[#30c2b7]/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#30c2b7]" />
            Task Completion Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm dark:text-white">Overall Completion</span>
                <span className="text-2xl font-bold text-[#30c2b7]">
                  {taskCompletionRate}%
                </span>
              </div>
              <Progress value={taskCompletionRate} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-3xl font-bold text-[#30c2b7]">
                  {totalTasksCompleted}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-3xl font-bold text-[#70e1bf]">12</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
