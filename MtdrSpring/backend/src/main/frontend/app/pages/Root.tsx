import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { Task, Project, Sprint, Activity } from '../types';
import { tasksApi, projectsApi, sprintsApi, UpdateProjectRequest } from '../services/api';
import { AppLayout } from '../components/layout/AppLayout';
import { Dashboard } from './Dashboard';
import { Board } from './Board';
import { Backlog } from './Backlog';
import { Projects } from './Projects';
import { Teams } from './Teams';
import { Settings } from './Settings';
import { Calendar } from './Calendar';
import { ChatBotPage } from './ChatBotPage';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { teams } = useTeam();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activities] = useState<Activity[]>([]); // no activity endpoint yet
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load real data from the API
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      const [projectsData, tasksData, sprintsData] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll(),
        sprintsApi.getAll(),
      ]);

      setProjects(projectsData as unknown as Project[]);
      setTasks(tasksData as unknown as Task[]);
      setSprints(sprintsData as unknown as Sprint[]);

      // Auto-select the first project
      if (projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id as unknown as string);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reload data when teams change (new group created/joined means new projects may appear)
  useEffect(() => {
    if (isAuthenticated && teams.length > 0) {
      loadData();
    }
  }, [teams.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) return null;

  const projectSprints = sprints.filter((s) => (s as any).projectId === selectedProjectId);
  const currentSprint = projectSprints.find((s) => s.status === 'active') ?? null;
  const sprintTasks = tasks.filter((t) => t.sprintId === currentSprint?.id);

  // ── Task handlers (real API) ──────────────────────────────────

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await tasksApi.update(taskId, {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        type: updates.type,
        assigneeId: updates.assigneeId,
        storyPoints: updates.storyPoints,
        workedHours: updates.workedHours,
        sprintId: updates.sprintId,
        tags: updates.tags,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? (updated as unknown as Task) : t))
      );
      toast.success('Task updated successfully!');
    } catch (err) {
      console.error('Failed to update task:', err);
      toast.error('Failed to update task');
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    const projectId = taskData.projectId || selectedProjectId;
    if (!projectId) {
      toast.error('Please create a project first');
      return;
    }
    try {
      const created = await tasksApi.create({
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        type: taskData.type || 'task',
        assigneeId: taskData.assigneeId,
        storyPoints: taskData.storyPoints,
        sprintId: taskData.sprintId,
        projectId: projectId,
        tags: taskData.tags || [],
      });
      setTasks((prev) => [...prev, created as unknown as Task]);
      toast.success('Task created successfully!');
    } catch (err) {
      console.error('Failed to create task:', err);
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    try {
      const updated = await projectsApi.update(projectId, data as UpdateProjectRequest);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? (updated as unknown as Project) : p))
      );
      toast.success('Project updated successfully!');
    } catch (err) {
      console.error('Failed to update project:', err);
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
      if (selectedProjectId === projectId) {
        const remaining = projects.filter((p) => p.id !== projectId);
        setSelectedProjectId(remaining[0]?.id ?? '');
      }
      toast.success('Project deleted successfully!');
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast.error('Failed to delete project');
    }
  };

  const handleCreateProject = async (projectData: Partial<Project> & { teamId?: string }) => {
    const teamId = projectData.teamId || (teams[0]?.id ?? '');
    if (!teamId) {
      toast.error('Please create or join a group first');
      return;
    }
    try {
      const created = await projectsApi.create({
        name: projectData.name || '',
        description: projectData.description || '',
        key: projectData.key || '',
        status: projectData.status || 'planning',
        teamId,
      });
      const newProject = created as unknown as Project;
      setProjects((prev) => [...prev, newProject]);
      if (!selectedProjectId) setSelectedProjectId(newProject.id);
      toast.success('Project created successfully!');
    } catch (err) {
      console.error('Failed to create project:', err);
      toast.error('Failed to create project');
    }
  };

  // ── Routing ──────────────────────────────────────────────────

  const path = location.pathname;

  let content;
  if (path === '/dashboard' || path === '/') {
    content = (
      <Dashboard
        tasks={tasks}
        activities={activities}
        sprints={sprints}
        projects={projects}
        isLoading={isLoadingData}
      />
    );
  } else if (path === '/board') {
    content = (
      <Board
        tasks={tasks}
        projects={projects}
        sprints={sprints}
        onUpdateTask={handleUpdateTask}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        currentSprint={currentSprint}
      />
    );
  } else if (path === '/backlog') {
    content = (
      <Backlog
        tasks={tasks}
        projects={projects}
        onUpdateTask={handleUpdateTask}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        sprints={projectSprints}
      />
    );
  } else if (path === '/projects') {
    content = (
      <Projects
        projects={projects}
        tasks={tasks}
        sprints={sprints}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  } else if (path === '/teams') {
    content = <Teams />;
  } else if (path === '/calendar') {
    content = <Calendar sprints={sprints} tasks={tasks} />;
  } else if (path === '/settings') {
    content = <Settings />;
  } else if (path === '/chatbot') {
    content = <ChatBotPage />;
  } else {
    content = (
      <Dashboard
        tasks={tasks}
        activities={activities}
        sprints={sprints}
        projects={projects}
        isLoading={isLoadingData}
      />
    );
  }

  return (
    <>
      <AppLayout onCreateTask={() => handleCreateTask({ sprintId: currentSprint?.id })}>
        {content}
      </AppLayout>
      <Toaster />
    </>
  );
}
