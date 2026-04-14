/**
 * API Service Layer
 *
 * Uses a relative path so the same build works in both:
 *   - Development: Vite proxies /api → http://localhost:8080
 *   - Production (Docker): Spring Boot serves static files AND the API on the same port
 */

import { User, Team, Project, Task, Sprint, TeamMember, UserRole } from '../types';

const API_BASE_URL = '/api';

// ─── helpers ────────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('auth_token') ?? '';
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ==================== AUTH API ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(res);
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: authHeaders(),
    });
  },
};

// ==================== TEAMS API ====================

export interface CreateTeamRequest {
  name: string;
  description: string;
}

export interface CreateTeamResponse {
  team: Team;
  joinCode: string;
}

export interface JoinTeamRequest {
  joinCode: string;
}

export interface JoinTeamResponse {
  team: Team;
  success: boolean;
}

export const teamsApi = {
  create: async (data: CreateTeamRequest): Promise<CreateTeamResponse> => {
    const res = await fetch(`${API_BASE_URL}/teams/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CreateTeamResponse>(res);
  },

  join: async (data: JoinTeamRequest): Promise<JoinTeamResponse> => {
    const res = await fetch(`${API_BASE_URL}/teams/join`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<JoinTeamResponse>(res);
  },

  getMembers: async (teamId: string): Promise<TeamMember[]> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
      headers: authHeaders(),
    });
    return handleResponse<TeamMember[]>(res);
  },

  getById: async (teamId: string): Promise<Team> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Team>(res);
  },

  getAll: async (): Promise<Team[]> => {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      headers: authHeaders(),
    });
    return handleResponse<Team[]>(res);
  },

  getTasks: async (teamId: string): Promise<Task[]> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/tasks`, {
      headers: authHeaders(),
    });
    return handleResponse<Task[]>(res);
  },

  getSprints: async (teamId: string): Promise<Sprint[]> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/sprints`, {
      headers: authHeaders(),
    });
    return handleResponse<Sprint[]>(res);
  },

  inviteMember: async (teamId: string, email: string, role: UserRole): Promise<TeamMember> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/invite`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, role }),
    });
    return handleResponse<TeamMember>(res);
  },
};

// ==================== TASKS API ====================

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: Task['priority'];
  type: Task['type'];
  assigneeId?: string;
  storyPoints?: number;
  sprintId?: string;
  projectId: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  type?: Task['type'];
  assigneeId?: string;
  storyPoints?: number;
  sprintId?: string;
  tags?: string[];
}

export const tasksApi = {
  getAll: async (filters?: {
    projectId?: string;
    sprintId?: string;
    assigneeId?: string;
    status?: Task['status'];
  }): Promise<Task[]> => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters ?? {}).filter(([, v]) => v !== undefined) as [string, string][]
      )
    );
    const res = await fetch(`${API_BASE_URL}/tasks?${params}`, {
      headers: authHeaders(),
    });
    return handleResponse<Task[]>(res);
  },

  getById: async (taskId: string): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Task>(res);
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  update: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  delete: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ==================== PROJECTS API ====================

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  key?: string;
  status?: string;
}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      headers: authHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  getByTeam: async (teamId: string): Promise<Project[]> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/projects`, {
      headers: authHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  getById: async (projectId: string): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Project>(res);
  },

  create: async (data: Partial<Project> & { teamId: string }): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  update: async (projectId: string, data: UpdateProjectRequest): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  delete: async (projectId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ==================== SPRINTS API ====================

export const sprintsApi = {
  /** Get sprints for a specific project */
  getByProject: async (projectId: string): Promise<Sprint[]> => {
    const res = await fetch(`${API_BASE_URL}/sprints?projectId=${projectId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Sprint[]>(res);
  },

  /** Get all sprints for the authenticated user (across all their projects) */
  getAll: async (): Promise<Sprint[]> => {
    const res = await fetch(`${API_BASE_URL}/sprints`, {
      headers: authHeaders(),
    });
    return handleResponse<Sprint[]>(res);
  },

  create: async (data: Partial<Sprint> & { projectId: string }): Promise<Sprint> => {
    const res = await fetch(`${API_BASE_URL}/sprints`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Sprint>(res);
  },
};
