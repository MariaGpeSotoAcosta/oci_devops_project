import { Task } from '../types';
import { teams } from '../data/mockData';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Briefcase } from 'lucide-react';

interface TeamProps {
  tasks: Task[];
}

export function Team({ tasks }: TeamProps) {
  const getTeamMemberStats = (memberId: string) => {
    const assignedTasks = tasks.filter((t) => t.assigneeId === memberId && t.sprintId);
    const completedTasks = assignedTasks.filter((t) => t.status === 'done');
    const inProgressTasks = assignedTasks.filter((t) => t.status === 'in-progress');
    const totalPoints = assignedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    return {
      total: assignedTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      totalPoints,
      completedPoints,
      completionRate: totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0,
    };
  };

  const allMembers = teams.flatMap(t => t.members);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2 dark:text-white">Team Members</h1>
        <p className="text-gray-600 dark:text-gray-400">View team capacity and workload distribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allMembers.map((member) => {
          const stats = getTeamMemberStats(member.id);
          const currentTasks = tasks.filter(
            (t) => t.assigneeId === member.id && t.sprintId && t.status !== 'done'
          );

          return (
            <Card key={member.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {member.role}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Sprint Progress</span>
                    <span className="font-semibold dark:text-white">
                      {stats.completedPoints} / {stats.totalPoints} points
                    </span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-semibold dark:text-white">{stats.total}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded">
                    <div className="text-lg font-semibold dark:text-white">{stats.inProgress}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded">
                    <div className="text-lg font-semibold dark:text-white">{stats.completed}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Done</div>
                  </div>
                </div>

                {currentTasks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 dark:text-white">Current Tasks:</p>
                    <div className="space-y-1">
                      {currentTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="text-sm flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {task.status === 'in-progress' ? 'In Progress' : 'To Do'}
                          </Badge>
                          <span className="truncate dark:text-white">{task.title}</span>
                        </div>
                      ))}
                      {currentTasks.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{currentTasks.length - 3} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}