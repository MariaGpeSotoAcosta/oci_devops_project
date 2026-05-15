import { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, TaskStatus, Project, Sprint } from '../types';
import { tasksApi } from '../services/api';
import { TaskColumn } from '../components/TaskColumn';
import { TaskDialog } from '../components/TaskDialog';
import { SprintCreateDialog } from '../components/SprintCreateDialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Kanban, Loader2, CalendarRange, FolderKanban, ListChecks } from 'lucide-react';
import { toast } from 'sonner';

interface BoardProps {
  tasks: Task[];
  projects: Project[];
  sprints: Sprint[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onCreateSprint: (sprint: Sprint) => void;
}

export function Board({
  tasks,
  projects,
  sprints,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  onCreateSprint,
}: BoardProps) {
  // ── Dialog state ───────────────────────────────────────────────
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [dialogTask, setDialogTask]       = useState<Task | undefined>();
  const [isFetchingTask, setIsFetchingTask] = useState(false);
  const [isCreating, setIsCreating]       = useState(false);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);

  // ── Filter state ───────────────────────────────────────────────
  const [filterProjectId, setFilterProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : '__all'
  );
  const [filterSprintId, setFilterSprintId] = useState<string>('__all');

  // ── Sprints scoped to selected project ────────────────────────
  const projectSprints = useMemo(
    () =>
      filterProjectId === '__all'
        ? sprints
        : sprints.filter((s) => (s as any).projectId === filterProjectId),
    [sprints, filterProjectId]
  );

  // Reset sprint filter when project changes
  const handleProjectChange = (pid: string) => {
    setFilterProjectId(pid);
    setFilterSprintId('__all');
  };

  // ── Active sprint label for the header ───────────────────────
  const activeSprint = useMemo(
    () => projectSprints.find((s) => s.id === filterSprintId),
    [projectSprints, filterSprintId]
  );

  // ── Filtered tasks ─────────────────────────────────────────────
  const visibleTasks = useMemo(() => {
    let result = tasks;
    if (filterProjectId !== '__all') {
      result = result.filter((t) => t.projectId === filterProjectId);
    }
    if (filterSprintId === '__backlog') {
      result = result.filter((t) => !t.sprintId);
    } else if (filterSprintId !== '__all') {
      result = result.filter((t) => t.sprintId === filterSprintId);
    }
    return result;
  }, [tasks, filterProjectId, filterSprintId]);

  const todoTasks       = visibleTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = visibleTasks.filter((t) => t.status === 'in-progress');
  const doneTasks       = visibleTasks.filter((t) => t.status === 'done');

  // ── Stats ──────────────────────────────────────────────────────
  const totalHours     = visibleTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const completedHours = doneTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

  // ── Project name lookup ────────────────────────────────────────
  const getProjectName = (pid: string) => projects.find((p) => p.id === pid)?.name;

  // ── Handlers ──────────────────────────────────────────────────

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTask(taskId, { status: newStatus });
  };

  const handleTaskClick = async (task: Task) => {
    setIsCreating(false);
    setDialogTask(task);
    setDialogOpen(true);
    setIsFetchingTask(true);
    try {
      const fresh = await tasksApi.getById(task.id) as unknown as Task;
      setDialogTask(fresh);
    } catch {
      toast.error('Could not refresh task details from server');
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
    if (isCreating) onCreateTask(taskData);
    else if (dialogTask) onUpdateTask(dialogTask.id, taskData);
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

        {/* ── Header ──────────────────────────────────────── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Kanban className="w-6 h-6 text-[#30c2b7]" />
              <div>
                <h1 className="text-2xl font-semibold dark:text-white leading-tight">
                  Kanban Board
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeSprint
                    ? `${activeSprint.name} · ${activeSprint.status}`
                    : filterSprintId === '__backlog'
                    ? 'Backlog (unassigned tasks)'
                    : 'All tasks'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSprintDialogOpen(true)}
                disabled={projects.length === 0}
              >
                <CalendarRange className="w-4 h-4 mr-1.5 text-[#30c2b7]" />
                New Sprint
              </Button>
              <Button onClick={handleCreateNew} disabled={projects.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* ── Project + Sprint + Backlog selectors ─────── */}
          <div className="flex flex-wrap items-end gap-3 mb-4">

            {/* Project */}
            <div className="flex-1 min-w-36 max-w-56">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FolderKanban className="w-3 h-3" /> Project
              </p>
              <Select value={filterProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sprint */}
            <div className="flex-1 min-w-44 max-w-64">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <ListChecks className="w-3 h-3" /> Sprint
              </p>
              <Select value={filterSprintId} onValueChange={setFilterSprintId}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All sprints</SelectItem>
                  <SelectItem value="__backlog">📥 Backlog (no sprint)</SelectItem>
                  {projectSprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.status === 'active'
                        ? '🟢 '
                        : s.status === 'completed'
                        ? '✅ '
                        : '📋 '}
                      {s.name}
                      {s.status === 'active' && (
                        <span className="ml-1 text-xs text-gray-400">(active)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sprint status badge */}
            {activeSprint && (
              <Badge
                className={`self-end mb-0.5 text-xs px-2 py-1 capitalize
                  ${activeSprint.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    : activeSprint.status === 'completed'
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}
              >
                {activeSprint.status}
              </Badge>
            )}
          </div>

          {/* ── Stats bar ────────────────────────────────── */}
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

        {/* ── Kanban columns ──────────────────────────────── */}
        {visibleTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Kanban className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {projects.length === 0
                ? 'Create a project first, then add tasks to see them here.'
                : filterSprintId !== '__all' && filterSprintId !== '__backlog'
                ? 'No tasks in this sprint yet. Add tasks from the Backlog.'
                : 'No tasks yet. Create your first task to get started.'}
            </p>
            {projects.length > 0 && (
              <div className="flex gap-2 mt-2">
                <Button onClick={handleCreateNew} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
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

        {/* ── Task Dialog ─────────────────────────────────── */}
        {isFetchingTask ? (
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

        {/* ── Sprint Create Dialog ─────────────────────────── */}
        <SprintCreateDialog
          open={sprintDialogOpen}
          onClose={() => setSprintDialogOpen(false)}
          projects={projects}
          sprints={sprints}
          defaultProjectId={filterProjectId === '__all' ? projects[0]?.id : filterProjectId}
          onCreated={(sprint) => {
            onCreateSprint(sprint);
            // Auto-select the new sprint
            setFilterProjectId((sprint as any).projectId ?? filterProjectId);
            setFilterSprintId(sprint.id);
          }}
        />
      </div>
    </DndProvider>
  );
}

// ── Loading dialog while GET /tasks/{id} is in flight ─────────────────────

function TaskLoadingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 flex flex-col items-center gap-3 z-10">
        <Loader2 className="w-8 h-8 text-[#30c2b7] animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading task details…</p>
      </div>
    </div>
  );
}
