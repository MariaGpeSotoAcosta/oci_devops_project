import { Sprint, Task } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';

interface CalendarProps {
  sprints: Sprint[];
  tasks: Task[];
}

export function Calendar({ sprints, tasks }: CalendarProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSprintsForDate = (date: Date) => {
    return sprints.filter(sprint =>
      isWithinInterval(date, { start: new Date(sprint.startDate), end: new Date(sprint.endDate) })
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2 dark:text-white">Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View sprint timelines and deadlines
        </p>
      </div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {format(today, 'MMMM yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const daysSprints = getSprintsForDate(day);
                const isToday = isSameDay(day, today);

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-24 p-2 border rounded-lg ${
                      isToday
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-800'
                    } ${
                      !isSameMonth(day, today)
                        ? 'opacity-50'
                        : ''
                    }`}
                  >
                    <div className={`text-sm mb-1 ${isToday ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'dark:text-white'}`}>
                      {format(day, 'd')}
                    </div>
                    {daysSprints.length > 0 && (
                      <div className="space-y-1">
                        {daysSprints.map((sprint) => (
                          <div
                            key={sprint.id}
                            className="text-xs px-1 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded truncate"
                          >
                            {sprint.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Sprints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sprints
                .filter((s) => new Date(s.endDate) >= today)
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((sprint) => {
                  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
                  const statusColors = {
                    planning: 'bg-gray-100 text-gray-700 border-gray-200',
                    active: 'bg-green-100 text-green-700 border-green-200',
                    completed: 'bg-blue-100 text-blue-700 border-blue-200',
                  };

                  return (
                    <div key={sprint.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium dark:text-white">{sprint.name}</h4>
                        <Badge variant="outline" className={statusColors[sprint.status]}>
                          {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {sprint.goal}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{format(new Date(sprint.startDate), 'MMM d')} - {format(new Date(sprint.endDate), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{sprintTasks.length} tasks</span>
                      </div>
                    </div>
                  );
                })}

              {sprints.filter((s) => new Date(s.endDate) >= today).length === 0 && (
                <p className="text-center text-gray-500 py-8">No upcoming sprints</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
