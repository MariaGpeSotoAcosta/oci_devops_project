import { useState } from 'react';
import { Link } from 'react-router';
import { Project, Task, Sprint } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Layers, Calendar, CheckCircle2, Users } from 'lucide-react';
import { teams } from '../data/mockData';

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  onCreateProject: (project: Partial<Project>) => void;
}

export function Projects({ projects, tasks, sprints, onCreateProject }: ProjectsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: '',
    teamId: '',
    status: 'planning' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(formData);
    setIsDialogOpen(false);
    setFormData({
      name: '',
      description: '',
      key: '',
      teamId: '',
      status: 'planning',
    });
  };

  const statusColors = {
    planning: 'bg-gray-100 text-gray-700 border-gray-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your projects and track progress
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const projectSprints = sprints.filter(s => s.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'done');
          const team = teams.find(t => t.id === project.teamId);

          return (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                      <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <Badge variant="outline" className={statusColors[project.status]}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {project.name}
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">
                      {project.key}
                    </Badge>
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
                          {team.name} • {team.members.length} members
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Customer Portal"
                required
              />
            </div>

            <div>
              <Label htmlFor="key">Project Key</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                placeholder="CP"
                maxLength={5}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                A short identifier (2-5 characters)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="team">Team</Label>
              <Select
                value={formData.teamId}
                onValueChange={(value) => setFormData({ ...formData, teamId: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
