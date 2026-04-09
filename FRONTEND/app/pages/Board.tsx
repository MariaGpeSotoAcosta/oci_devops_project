import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, TaskStatus } from '../types';
import { TaskColumn } from '../components/TaskColumn';
import { TaskDialog } from '../components/TaskDialog';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

interface BoardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Partial<Task>) => void;
  currentSprint: { name: string; goal: string } | null;
}

export function Board({ tasks, onUpdateTask, onCreateTask, currentSprint }: BoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, { status: newStatus });
  };

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

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const totalPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completedPoints = doneTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="mb-2 dark:text-white">{currentSprint?.name || 'Sprint Board'}</h1>
              {currentSprint && (
                <p className="text-gray-600 dark:text-gray-400">{currentSprint.goal}</p>
              )}
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="px-4 py-2 bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 rounded-lg border border-[#30c2b7]/30">
              <span className="text-gray-600 dark:text-gray-400">Total Points: </span>
              <span className="font-semibold dark:text-white">{totalPoints}</span>
            </div>
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Completed: </span>
              <span className="font-semibold dark:text-white">{completedPoints} ({totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%)</span>
            </div>
            <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/50 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Remaining: </span>
              <span className="font-semibold dark:text-white">{totalPoints - completedPoints}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          <TaskColumn
            title="To Do"
            status="todo"
            tasks={todoTasks}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="In Progress"
            status="in-progress"
            tasks={inProgressTasks}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
          <TaskColumn
            title="Done"
            status="done"
            tasks={doneTasks}
            onTaskMove={handleTaskMove}
            onTaskClick={handleTaskClick}
          />
        </div>

        <TaskDialog
          task={isCreating ? undefined : selectedTask}
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSave}
        />
      </div>
    </DndProvider>
  );
}