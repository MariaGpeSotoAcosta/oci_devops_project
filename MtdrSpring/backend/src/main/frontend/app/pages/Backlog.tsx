import { useState, useMemo } from 'react';
import { Task, Project, Sprint } from '../types';
import { useTeam } from '../context/TeamContext';
import { TaskDialog } from '../components/TaskDialog';
import { SprintCreateDialog } from '../components/SprintCreateDialog';
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
import { Plus, CalendarRange, CheckSquare, Layers, FolderKanban } from 'lucide-react';

interface BacklogProps {
  tasks: Task[];
  projects: Project[];
  sprints: Sprint[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (task: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onCreateSprint: (sprint: Sprint) => void;
}

const priorityColors: Record<string, string> = {
  low:      'bg-[#96efc1]/20 text-[#30c2b7] border-[#70e1bf]/30',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export function Backlog({
  tasks,
  projects,
  sprints,
  onUpdateTask,
  onCreateTask,
  onDeleteTask,
  onCreateSprint,
}: BacklogProps) {
  const { teams } = useTeam();

  // ── Local UI state ────────────────────────────────────────────
  const [selectedTask, setSelectedTask]       = useState<Task | undefined>();
  const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask]   = useState(false);
  const [isSprintDialogOpen, setSprintDialog] = useState(false);

  // ── Project filter ─────────────────────────────────────────────
  const [filterProjectId, setFilterProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : '__all'
  );

  // ── Derived data ───────────────────────────────────────────────
  const visibleSprints = useMemo(
    () =>
      filterProjectId === '__all'
        ? sprints
        : sprints.filter((s) => (s as any).projectId === filterProjectId),
    [sprints, filterProjectId]
  );

  const backlogTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          !t.sprintId &&
          (filterProjectId === '__all' || t.projectId === filterProjectId)
      ),
    [tasks, filterProjectId]
  );

  const totalEstimated = backlogTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

  const allMembers = teams.flatMap((t) => t.members);
  const getMemberName   = (id: string) => allMembers.find((m) => m.id === id)?.name ?? id;
  const getMemberAvatar = (id: string) =>
    allMembers.find((m) => m.id === id)?.avatar ?? id.charAt(0).toUpperCase();

  // ── Handlers ──────────────────────────────────────────────────

  const openCreateTask = () => {
    setSelectedTask(undefined);
    setIsCreatingTask(true);
    setTaskDialogOpen(true);
  };

  const openEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsCreatingTask(false);
    setTaskDialogOpen(true);
  };

  const handleTaskSave = (data: Partial<Task>) => {
    if (isCreatingTask) onCreateTask(data);
    else if (selectedTask) onUpdateTask(selectedTask.id, data);
  };

  const handleSprintAssign = (taskId: string, value: string) => {
    // '__backlog' is the sentinel for "remove from sprint"
    onUpdateTask(taskId, { sprintId: value === '__backlog' ? undefined : value });
  };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold dark:text-white mb-1">Product Backlog</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tasks not assigned to any sprint. Drag them into a sprint to begin work.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSprintDialog(true)}
              disabled={projects.length === 0}
            >
              <CalendarRange className="w-4 h-4 mr-2 text-[#30c2b7]" />
              Create Sprint
            </Button>
            <Button onClick={openCreateTask} disabled={projects.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* ── Filters + stats row ────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Project selector */}
          {projects.length > 1 && (
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-gray-400" />
              <Select value={filterProjectId} onValueChange={setFilterProjectId}>
                <SelectTrigger className="w-48 h-8 text-sm">
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
          )}

          {/* Stats chips */}
          <div className="flex gap-3 text-sm ml-auto">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Backlog: </span>
              <span className="font-semibold dark:text-white">{backlogTasks.length} tasks</span>
            </span>
            <span className="px-3 py-1 bg-[#30c2b7]/10 dark:bg-[#30c2b7]/20 rounded-lg border border-[#30c2b7]/30">
              <span className="text-gray-500 dark:text-gray-400">Estimated: </span>
              <span className="font-semibold dark:text-white">{totalEstimated}h</span>
            </span>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Sprints: </span>
              <span className="font-semibold dark:text-white">{visibleSprints.length}</span>
            </span>
          </div>
        </div>

        {/* ── Sprint list pills ──────────────────────────── */}
        {visibleSprints.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleSprints.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                  bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              >
                <span>
                  {s.status === 'active' ? '🟢' : s.status === 'completed' ? '✅' : '📋'}
                </span>
                <span className="dark:text-gray-200">{s.name}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 px-1.5 ml-0.5 capitalize"
                >
                  {s.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Task list ──────────────────────────────────────── */}
      <div className="space-y-2">
        {backlogTasks.map((task) => (
          <Card
            key={task.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openEditTask(task)}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge variant="outline" className="bg-[#30c2b7]/10 text-[#30c2b7] text-xs">
                    <CheckSquare className="w-3 h-3 mr-1" />
                    Task
                  </Badge>
                  <Badge className={`text-xs ${priorityColors[task.priority] ?? ''}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                  {task.storyPoints != null && (
                    <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800">
                      {task.storyPoints}h est.
                    </Badge>
                  )}
                </div>

                <p className="font-medium dark:text-white leading-snug">{task.title}</p>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {task.description}
                  </p>
                )}

                {task.assigneeId && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-5 h-5 rounded-full bg-linear-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-[10px] font-semibold">
                      {getMemberAvatar(task.assigneeId)}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getMemberName(task.assigneeId)}
                    </span>
                  </div>
                )}
              </div>

              {/* Sprint assignment selector — stop click propagating to card */}
              <div className="w-44 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={task.sprintId ?? '__backlog'}
                  onValueChange={(v) => handleSprintAssign(task.id, v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Add to sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__backlog">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Layers className="w-3 h-3" /> Backlog
                      </span>
                    </SelectItem>
                    {visibleSprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.status === 'active' ? '🟢 ' : s.status === 'completed' ? '✅ ' : '📋 '}
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}

        {backlogTasks.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {projects.length === 0
                ? 'Create a project first before adding tasks.'
                : 'Backlog is empty — all tasks are assigned to sprints, or none exist yet.'}
            </p>
            {projects.length > 0 && (
              <Button onClick={openCreateTask} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* ── Dialogs ────────────────────────────────────────── */}
      <TaskDialog
        task={isCreatingTask ? undefined : selectedTask}
        open={isTaskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        onSave={handleTaskSave}
        onDelete={
          onDeleteTask
            ? (id) => { onDeleteTask(id); setTaskDialogOpen(false); }
            : undefined
        }
        projects={projects}
        sprints={sprints}
      />

      <SprintCreateDialog
        open={isSprintDialogOpen}
        onClose={() => setSprintDialog(false)}
        projects={projects}
        sprints={sprints}
        defaultProjectId={filterProjectId === '__all' ? projects[0]?.id : filterProjectId}
        onCreated={onCreateSprint}
      />
    </div>
  );
}
