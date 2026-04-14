import { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, TaskStatus, Project, Sprint } from '../types';
import { tasksApi } from '../services/api';
import { TaskColumn } from '../components/TaskColumn';
import { TaskDialog } from '../components/TaskDialog';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Kanban, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BoardProps {
  tasks: Task[];
  projects: Project[];
  sprints: Sprint[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  currentSprint: { id?: string; name: string; goal: string } | null;
}

export function Board({
  tasks,
  projects,
  sprints,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  currentSprint,
}: BoardProps) {
  // ── Dialog state ───────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTask, setDialogTask] = useState<Task | undefined>();
  const [isFetchingTask, setIsFetchingTask] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // ── Filter state ───────────────────────────────────────────────
  const [filterProjectId, setFilterProjectId] = useState<string>('all');

  // ── Project name lookup ────────────────────────────────────────
  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name;

  // ── Filtered tasks ─────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    if (filterProjectId === 'all') return tasks;
    return tasks.filter((t) => t.projectId === filterProjectId);
  }, [tasks, filterProjectId]);

  const todoTasks       = visibleTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = visibleTasks.filter((t) => t.status === 'in-progress');
  const doneTasks       = visibleTasks.filter((t) => t.status === 'done');

  // ── Stats ──────────────────────────────────────────────────────
  const totalHours     = visibleTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const completedHours = doneTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

  // ── Handlers ──────────────────────────────────────────────────

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  /**
   * Clicking a task card: fetch fresh details from GET /tasks/{id},
   * then open the dialog with up-to-date data.
   */
  const handleTaskClick = async (task: Task) => {
    setIsCreating(false);
    setDialogTask(task);      // optimistic: show local copy immediately
    setDialogOpen(true);
    setIsFetchingTask(true);
    try {
      const fresh = await tasksApi.getById(task.id) as unknown as Task;
      setDialogTask(fresh);
    } catch (err) {
      // Non-fatal: local copy is still usable
      toast.error('Could not refresh task details from server');
      console.error('Failed to fetch task by id:', err);
    } finally {
      setIsFetchingTask(false);
    }
  };

  const handleCreateNew = () => {
    setDialogTask(undefined);
    setIsCreating(true);
    setIsFetchingTask(false);
    setDialogOpen(true);
  };

  const handleSave = (taskData: Partial<Task>) => {
    if (isCreating) {
      onCreateTask(taskData);
    } else if (dialogTask) {
      onUpdateTask(dialogTask.id, taskData);
    }
  };

  const handleDelete = (taskId: string) => {
    onDeleteTask?.(taskId);
    setDialogOpen(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setDialogTask(undefined);
    setIsFetchingTask(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        {/* ── Header ────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Kanban className="w-6 h-6 text-[#30c2b7]" />
              <div>
                <h1 className="text-2xl font-semibold dark:text-white leading-tight">
                  Kanban Board
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentSprint
                    ? `Sprint: ${currentSprint.name}`
                    : 'All tasks across your projects'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Project filter — only shown when there are 2+ projects */}
              {projects.length > 1 && (
                <Select value={filterProjectId} onValueChange={setFilterProjectId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-3 text-sm flex-wrap">
            <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Total: </span>
              <span className="font-semibold dark:text-white">{visibleTasks.length} tasks</span>
            </div>
            <div className="px-3 py-1.5 bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 rounded-lg border border-[#30c2b7]/30">
              <span className="text-gray-500 dark:text-gray-400">Est. hours: </span>
              <span className="font-semibold dark:text-white">{totalHours}h</span>
            </div>
            <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Done: </span>
              <span className="font-semibold dark:text-white">
                {completedHours}h
                {totalHours > 0 && (
                  <span className="text-green-600 dark:text-green-400 ml-1">
                    ({Math.round((completedHours / totalHours) * 100)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Remaining: </span>
              <span className="font-semibold dark:text-white">{totalHours - completedHours}h</span>
            </div>
          </div>
        </div>

        {/* ── Kanban columns ──────────────────────────── */}
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Kanban className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {projects.length === 0
                ? 'Create a project first, then add tasks to see them here.'
                : 'No tasks yet. Create your first task to get started.'}
            </p>
            {projects.length > 0 && (
              <Button onClick={handleCreateNew} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={todoTasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
              getProjectName={getProjectName}
            />
            <TaskColumn
              title="In Progress"
              status="in-progress"
              tasks={inProgressTasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
              getProjectName={getProjectName}
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
              getProjectName={getProjectName}
            />
          </div>
        )}

        {/* ── Task Dialog ─────────────────────────────── */}
        {isFetchingTask ? (
          /* Loading overlay while fetching fresh task details */
          <TaskLoadingDialog open={dialogOpen} onClose={handleClose} />
        ) : (
          <TaskDialog
            task={isCreating ? undefined : dialogTask}
            open={dialogOpen}
            onClose={handleClose}
            onSave={handleSave}
            onDelete={onDeleteTask ? handleDelete : undefined}
            projects={projects}
            sprints={sprints}
          />
        )}
      </div>
    </DndProvider>
  );
}

// ── Tiny loading dialog shown while GET /tasks/{id} is in flight ───────────

function TaskLoadingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      {/* Spinner card */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 flex flex-col items-center gap-3 z-10">
        <Loader2 className="w-8 h-8 text-[#30c2b7] animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading task details…</p>
      </div>
    </div>
  );
}
