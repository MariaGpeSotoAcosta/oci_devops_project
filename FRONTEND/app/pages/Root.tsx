import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { Task, Project, UserRole } from '../types';
import { initialTasks, sprints, projects as initialProjects, activities } from '../data/mockData';
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
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId] = useState<string>(initialProjects[0]?.id || '');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectSprints = sprints.filter((s) => s.projectId === selectedProjectId);
  const currentSprint = projectSprints.find((s) => s.status === 'active');
  const sprintTasks = tasks.filter((t) => t.sprintId === currentSprint?.id);

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
    toast.success('Task updated successfully!');
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      type: taskData.type || 'task',
      assigneeId: taskData.assigneeId,
      storyPoints: taskData.storyPoints,
      sprintId: taskData.sprintId,
      projectId: selectedProjectId,
      tags: taskData.tags || [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '1',
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success('Task created successfully!');
  };

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectData.name || '',
      description: projectData.description || '',
      key: projectData.key || '',
      status: projectData.status || 'planning',
      teamId: projectData.teamId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects((prevProjects) => [...prevProjects, newProject]);
    toast.success('Project created successfully!');
  };


  // Determine which view to show based on current path
  const path = location.pathname;

  let content;
  if (path === '/dashboard' || path === '/') {
    content = (
      <Dashboard
        tasks={tasks}
        activities={activities}
        sprints={sprints}
        projects={projects}
      />
    );
  } else if (path === '/board') {
    content = (
      <Board
        tasks={sprintTasks}
        onUpdateTask={handleUpdateTask}
        onCreateTask={handleCreateTask}
        currentSprint={currentSprint || null}
      />
    );
  } else if (path === '/backlog') {
    content = (
      <Backlog
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        onCreateTask={handleCreateTask}
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