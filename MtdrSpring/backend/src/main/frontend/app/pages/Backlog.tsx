import { useState } from 'react';
import { Task, Project, Sprint } from '../types';
import { useTeam } from '../context/TeamContext';
import { TaskDialog } from '../components/TaskDialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, AlertCircle, Bug, CheckSquare, FileText } from 'lucide-react';

interface BacklogProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  sprints: Array<{ id: string; name: string; status?: string; projectId?: string }>;
}

const typeIcons = {
  story: FileText,
  task: CheckSquare,
  bug: Bug,
  epic: AlertCircle,
};

const typeColors: Record<string, string> = {
  story: 'bg-green-100 text-green-700',
  task: 'bg-[#30c2b7]/20 text-[#30c2b7]',
  bug: 'bg-red-100 text-red-700',
  epic: 'bg-purple-100 text-purple-700',
};

const priorityColors: Record<string, string> = {
  low: 'bg-[#96efc1]/20 text-[#30c2b7] border-[#70e1bf]/30',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export function Backlog({ tasks, projects, onUpdateTask, onCreateTask, onDeleteTask, sprints }: BacklogProps) {
  const { teams } = useTeam();

  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const backlogTasks = tasks.filter((t) => !t.sprintId);
  const totalBacklogPoints = backlogTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedTask(undefined);
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleSave = (taskData: Partial<Task>) => {
    if (isCreating) {
      onCreateTask(taskData);
    } else if (selectedTask) {
      onUpdateTask(selectedTask.id, taskData);
    }
  };

  const handleSprintAssignment = (taskId: string, sprintId: string) => {
    onUpdateTask(taskId, { sprintId: sprintId || undefined });
  };

  // Resolve member name/avatar from real team data
  const allMembers = teams.flatMap((t) => t.members);

  const getMemberName = (userId: string) =>
    allMembers.find((m) => m.id === userId)?.name ?? userId;

  const getMemberAvatar = (userId: string) =>
    allMembers.find((m) => m.id === userId)?.avatar ?? userId.charAt(0).toUpperCase();

  return (
    <div className="p-6">
      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="mb-2 dark:text-white">Product Backlog</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and prioritize your product backlog items
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Backlog Items: </span>
            <span className="font-semibold dark:text-white">{backlogTasks.length}</span>
          </div>
          <div className="px-4 py-2 bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 rounded-lg border border-[#30c2b7]/30">
            <span className="text-gray-600 dark:text-gray-400">Estimated Hours: </span>
            <span className="font-semibold dark:text-white">{totalBacklogPoints}</span>
          </div>
        </div>
      </div>

      {/* ── Task list ──────────────────────────────── */}
      <div className="space-y-2">
        {backlogTasks.map((task) => {
          const TypeIcon = typeIcons[task.type] ?? CheckSquare;

          return (
            <Card
              key={task.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={typeColors[task.type] ?? ''}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                    </Badge>
                    <Badge className={priorityColors[task.priority] ?? ''}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    {task.storyPoints != null && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {task.storyPoints}h
                      </Badge>
                    )}
                  </div>

                  <h4 className="mb-1 dark:text-white">{task.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>

                  {task.assigneeId && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-xs">
                        {getMemberAvatar(task.assigneeId)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getMemberName(task.assigneeId)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sprint assignment */}
                <div className="w-48" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={task.sprintId ?? ''}
                    onValueChange={(v) => handleSprintAssignment(task.id, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add to sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Sprint</SelectItem>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          );
        })}

        {backlogTasks.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-400 mb-4">No items in backlog</p>
            <Button onClick={handleCreateNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Task
            </Button>
          </Card>
        )}
      </div>

      <TaskDialog
        task={isCreating ? undefined : selectedTask}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        onDelete={onDeleteTask ? (id) => { onDeleteTask(id); setIsDialogOpen(false); } : undefined}
        projects={projects}
        sprints={sprints as Sprint[]}
      />
    </div>
  );
}
