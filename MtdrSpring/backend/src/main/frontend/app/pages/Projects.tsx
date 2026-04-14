import { useState } from 'react';
import { Link } from 'react-router';
import { Project, Task, Sprint } from '../types';
import { useTeam } from '../context/TeamContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Plus, Layers, Calendar, CheckCircle2, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  onCreateProject: (project: Partial<Project> & { teamId?: string }) => void;
  onUpdateProject?: (projectId: string, data: Partial<Project>) => void;
  onDeleteProject?: (projectId: string) => void;
}

const statusColors: Record<string, string> = {
  planning: 'bg-gray-100 text-gray-700 border-gray-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
};

const statusLabel: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
};

export function Projects({
  projects,
  tasks,
  sprints,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectsProps) {
  const { teams } = useTeam();

  // ── Create dialog ─────────────────────────────────────────────
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    key: '',
    teamId: '',
    status: 'planning' as const,
  });

  // ── Edit dialog ───────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    key: '',
    status: 'planning',
  });

  // ── Delete confirm ────────────────────────────────────────────
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────────────────────

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(createForm);
    setIsCreateOpen(false);
    setCreateForm({ name: '', description: '', key: '', teamId: '', status: 'planning' });
  };

  const openEdit = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    setEditForm({
      name: project.name,
      description: project.description ?? '',
      key: project.key ?? '',
      status: project.status ?? 'planning',
    });
    setIsEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !onUpdateProject) return;
    onUpdateProject(editingProject.id, editForm);
    setIsEditOpen(false);
    setEditingProject(null);
  };

  const confirmDelete = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingProjectId(projectId);
  };

  const handleDelete = () => {
    if (!deletingProjectId || !onDeleteProject) return;
    onDeleteProject(deletingProjectId);
    setDeletingProjectId(null);
  };

  return (
    <div className="p-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your projects and track progress
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* ── Project grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const projectSprints = sprints.filter((s) => (s as any).projectId === project.id);
          const completedTasks = projectTasks.filter((t) => t.status === 'done');
          const team = teams.find((t) => t.id === project.teamId);

          return (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full relative group">
                {/* Edit / delete menu (top-right of card) */}
                <div
                  className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.preventDefault()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => openEdit(project, e)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => confirmDelete(project.id, e)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <Badge
                      variant="outline"
                      className={statusColors[project.status] ?? statusColors.planning}
                    >
                      {statusLabel[project.status] ?? project.status}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {project.name}
                    {project.key && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-700">
                        {project.key}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {project.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {completedTasks.length} / {projectTasks.length} tasks completed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {projectSprints.length} sprints
                      </span>
                    </div>

                    {team && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {team.name} · {team.members.length} members
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {projects.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 dark:text-white">No projects yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Card>
        )}
      </div>

      {/* ── Create Project Dialog ─────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Project Name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Customer Portal"
                required
              />
            </div>

            <div>
              <Label htmlFor="create-key">Project Key</Label>
              <Input
                id="create-key"
                value={createForm.key}
                onChange={(e) =>
                  setCreateForm({ ...createForm, key: e.target.value.toUpperCase() })
                }
                placeholder="CP"
                maxLength={5}
                required
              />
              <p className="text-xs text-gray-500 mt-1">A short identifier (2–5 characters)</p>
            </div>

            <div>
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Describe your project..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="create-team">Team</Label>
              <Select
                value={createForm.teamId}
                onValueChange={(v) => setCreateForm({ ...createForm, teamId: v })}
              >
                <SelectTrigger id="create-team">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(v: any) => setCreateForm({ ...createForm, status: v })}
              >
                <SelectTrigger id="create-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Project Dialog ───────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white dark:bg-gray-900 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-key">Project Key</Label>
              <Input
                id="edit-key"
                value={editForm.key}
                onChange={(e) =>
                  setEditForm({ ...editForm, key: e.target.value.toUpperCase() })
                }
                maxLength={5}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────── */}
      <Dialog
        open={deletingProjectId !== null}
        onOpenChange={(open) => { if (!open) setDeletingProjectId(null); }}
      >
        <DialogContent className="bg-white dark:bg-gray-900 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Delete Project</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this project? All tasks associated with it will also be
            removed. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingProjectId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
