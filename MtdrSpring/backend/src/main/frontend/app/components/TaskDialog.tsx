import { useState, useEffect, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus, Project, Sprint, TeamMember } from '../types';
import { useTeam } from '../context/TeamContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import {
  AlertCircle,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  CircleDot,
  Circle,
} from 'lucide-react';

interface TaskDialogProps {
  task?: Task;
  open: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  /** Called with the task ID when the user confirms deletion */
  onDelete?: (taskId: string) => void;
  /** Available projects to associate the task with */
  projects?: Project[];
  /** Available sprints (all or filtered by project) */
  sprints?: Sprint[];
}

const defaultForm: Partial<Task> = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  type: 'task',
  assigneeId: '',
  storyPoints: 1,
  workedHours: 0,
  tags: [],
  projectId: '',
  sprintId: '',
};

// ── Visual helpers ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: 'To Do', icon: Circle, color: 'text-gray-500' },
  'in-progress': { label: 'In Progress', icon: CircleDot, color: 'text-[#30c2b7]' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-green-500' },
};

const priorityConfig: Record<string, { label: string; dot: string }> = {
  low: { label: 'Low', dot: 'bg-[#30c2b7]' },
  medium: { label: 'Medium', dot: 'bg-yellow-400' },
  high: { label: 'High', dot: 'bg-orange-400' },
  critical: { label: 'Critical', dot: 'bg-red-500' },
};

/** Format an ISO date string to a human-readable date */
function fmtDate(iso?: string | Date | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso as string).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/** Turn a full name into 1–2 uppercase initials */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────

export function TaskDialog({
  task,
  open,
  onClose,
  onSave,
  onDelete,
  projects = [],
  sprints = [],
}: TaskDialogProps) {
  const { teams } = useTeam();
  const [formData, setFormData] = useState<Partial<Task>>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset & pre-fill whenever the dialog opens or the task changes
  useEffect(() => {
    setConfirmDelete(false);
    if (task) {
      setFormData({
        ...defaultForm,
        ...task,
        assigneeId: task.assigneeId ?? '',
        sprintId: task.sprintId ?? '',
        projectId: task.projectId ?? '',
      });
    } else {
      setFormData({
        ...defaultForm,
        projectId: projects.length === 1 ? projects[0].id : '',
      });
    }
  }, [task, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived data ──────────────────────────────────────────────────────────

  /**
   * Find the team that owns the currently selected project.
   * If no project is selected, fall back to all teams' members.
   */
  const relevantMembers = useMemo<TeamMember[]>(() => {
    if (formData.projectId) {
      const project = projects.find((p) => p.id === formData.projectId);
      if (project) {
        const team = teams.find((t) => t.id === project.teamId);
        if (team) return team.members;
      }
    }
    // Fallback: merge all members (de-duped by id)
    const seen = new Set<string>();
    return teams.flatMap((t) => t.members).filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [formData.projectId, projects, teams]);

  /** Sprints scoped to the selected project */
  const filteredSprints = useMemo(
    () =>
      formData.projectId
        ? sprints.filter((s) => (s as any).projectId === formData.projectId)
        : sprints,
    [formData.projectId, sprints],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isEditing = !!task;
  const currentProject = projects.find((p) => p.id === formData.projectId);
  const currentAssignee = relevantMembers.find((m) => m.id === formData.assigneeId);
  const StatusIcon = statusConfig[formData.status ?? 'todo']?.icon ?? Circle;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-900 sm:max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl">

        {/* ── Header ────────────────────────────────────────────── */}
        <DialogHeader className="pb-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {isEditing && (
                  <Badge variant="outline" className="text-xs text-gray-500 shrink-0">
                    #{task!.id}
                  </Badge>
                )}
                {currentProject && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 shrink-0"
                  >
                    {currentProject.name}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                {isEditing ? task!.title || 'Edit Task' : 'Create New Task'}
              </DialogTitle>
            </div>
          </div>

          {/* Task metadata row (edit mode only) */}
          {isEditing && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-gray-500 dark:text-gray-400">
              {task!.createdAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {fmtDate(task!.createdAt as any)}
                </span>
              )}
              {task!.updatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Updated {fmtDate(task!.updatedAt as any)}
                </span>
              )}
              {currentAssignee && (
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-linear-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-[9px] font-semibold">
                    {initials(currentAssignee.name)}
                  </div>
                  {currentAssignee.name}
                </span>
              )}
              <span className={`flex items-center gap-1 ${statusConfig[task!.status]?.color ?? ''}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig[task!.status]?.label ?? task!.status}
              </span>
            </div>
          )}
        </DialogHeader>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 -mx-6" />

        {/* ── Form ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

          {relevantMembers.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No team members found. Create or join a team first to assign tasks.
              </AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="td-title" className="text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="td-title"
              value={formData.title ?? ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="mt-1"
              required
              autoFocus={!isEditing}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="td-desc" className="text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="td-desc"
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about this task..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          {/* Project */}
          {projects.length > 0 && (
            <div>
              <Label htmlFor="td-project" className="text-gray-700 dark:text-gray-300">
                Project <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.projectId ?? ''}
                onValueChange={(v) =>
                  setFormData({ ...formData, projectId: v, sprintId: '', assigneeId: '' })
                }
              >
                <SelectTrigger id="td-project" className="mt-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.key ? (
                        <span className="ml-1 text-gray-400 text-xs">({p.key})</span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="td-status" className="text-gray-700 dark:text-gray-300">
                Status
              </Label>
              <Select
                value={formData.status ?? 'todo'}
                onValueChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}
              >
                <SelectTrigger id="td-status" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    <span className="flex items-center gap-2">
                      <Circle className="w-3 h-3 text-gray-400" /> To Do
                    </span>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <span className="flex items-center gap-2">
                      <CircleDot className="w-3 h-3 text-[#30c2b7]" /> In Progress
                    </span>
                  </SelectItem>
                  <SelectItem value="done">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Done
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="td-priority" className="text-gray-700 dark:text-gray-300">
                Priority
              </Label>
              <Select
                value={formData.priority ?? 'medium'}
                onValueChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
              >
                <SelectTrigger id="td-priority" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([val, cfg]) => (
                    <SelectItem key={val} value={val}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <Label htmlFor="td-hours" className="text-gray-700 dark:text-gray-300">
              Estimated Hours
            </Label>
            <Input
              id="td-hours"
              type="number"
              min="1"
              max="999"
              value={formData.storyPoints ?? 1}
              onChange={(e) =>
                setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 1 })
              }
              className="mt-1"
            />
          </div>

          {/* Worked Hours */}
          <div>
            <Label htmlFor="td-worked" className="text-gray-700 dark:text-gray-300">
              Worked Hours
              <span className="ml-1 text-xs text-gray-400 font-normal">— actual time spent</span>
            </Label>
            <Input
              id="td-worked"
              type="number"
              min="0"
              max="9999"
              value={formData.workedHours ?? 0}
              onChange={(e) =>
                setFormData({ ...formData, workedHours: parseInt(e.target.value) || 0 })
              }
              className="mt-1"
            />
          </div>

          {/* Assignee */}
          <div>
            <Label htmlFor="td-assignee" className="text-gray-700 dark:text-gray-300">
              Assigned To
              {currentProject && (
                <span className="ml-1 text-xs text-gray-400 font-normal">
                  — members of {currentProject.name}'s team
                </span>
              )}
            </Label>
            <Select
              value={formData.assigneeId || 'none'}
              onValueChange={(v) => setFormData({ ...formData, assigneeId: v === 'none' ? '' : v })}
            >
              <SelectTrigger id="td-assignee" className="mt-1">
                <SelectValue
                  placeholder={
                    relevantMembers.length > 0 ? 'Select a team member' : 'No members available'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {relevantMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-linear-to-br from-[#30c2b7] to-[#70e1bf] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                        {initials(member.name)}
                      </span>
                      <span>
                        {member.name}
                        <span className="text-gray-400 text-xs ml-1">— {member.role}</span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sprint */}
          <div>
            <Label htmlFor="td-sprint" className="text-gray-700 dark:text-gray-300">
              Sprint
            </Label>
            <Select
              value={formData.sprintId || 'none'}
              onValueChange={(v) => setFormData({ ...formData, sprintId: v === 'none' ? '' : v })}
            >
              <SelectTrigger id="td-sprint" className="mt-1">
                <SelectValue placeholder="No sprint — goes to backlog" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sprint (backlog)</SelectItem>
                {filteredSprints.map((sprint) => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    <span className="flex items-center gap-2">
                      <span>
                        {sprint.status === 'active'
                          ? '🟢'
                          : sprint.status === 'completed'
                          ? '✅'
                          : '📋'}
                      </span>
                      {sprint.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Divider ─────────────────────────────────────────── */}
          <div className="border-t border-gray-100 dark:border-gray-800 -mx-6" />

          {/* ── Actions ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            {/* Delete — edit mode only */}
            {isEditing && onDelete && !confirmDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5 -ml-1"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-4 h-4" />
                Delete task
              </Button>
            )}

            {/* Delete confirmation */}
            {isEditing && onDelete && confirmDelete && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Delete this task?
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(task!.id)}
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Spacer when no delete */}
            {(!isEditing || !onDelete) && <span />}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#30c2b7] hover:bg-[#28a89e] text-white">
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
