/**
 * API Service Layer
 *
 * All endpoints point to the Spring Boot backend running on port 3001.
 * During development Vite proxies /api → http://localhost:3001
 * In production the built static files are served by Spring Boot directly.
 */

import { User, Team, Project, Task, Sprint, TeamMember, UserRole } from '../types';

// Vite exposes env vars via import.meta.env (VITE_ prefix).
// Falls back to the absolute URL for standalone dev runs.
const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001/api';

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
  // 204 No Content → return undefined cast to T
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

/**
 * POST /api/auth/login
 */
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(res);
  },

  /**
   * POST /api/auth/register
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(res);
  },

  /**
   * POST /api/auth/logout
   */
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
  /**
   * POST /api/teams/create
   */
  create: async (data: CreateTeamRequest): Promise<CreateTeamResponse> => {
    const res = await fetch(`${API_BASE_URL}/teams/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<CreateTeamResponse>(res);
  },

  /**
   * POST /api/teams/join
   */
  join: async (data: JoinTeamRequest): Promise<JoinTeamResponse> => {
    const res = await fetch(`${API_BASE_URL}/teams/join`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<JoinTeamResponse>(res);
  },

  /**
   * GET /api/teams/{id}
   */
  getById: async (teamId: string): Promise<Team> => {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Team>(res);
  },

  /**
   * GET /api/teams
   */
  getAll: async (): Promise<Team[]> => {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      headers: authHeaders(),
    });
    return handleResponse<Team[]>(res);
  },

  /**
   * POST /api/teams/{id}/invite
   */
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
  /**
   * GET /api/tasks
   */
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

  /**
   * GET /api/tasks/{id}
   */
  getById: async (taskId: string): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Task>(res);
  },

  /**
   * POST /api/tasks
   */
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  /**
   * PUT /api/tasks/{id}
   */
  update: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  /**
   * DELETE /api/tasks/{id}
   */
  delete: async (taskId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse<void>(res);
  },
};

// ==================== PROJECTS API ====================

export const projectsApi = {
  /**
   * GET /api/projects
   */
  getAll: async (): Promise<Project[]> => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      headers: authHeaders(),
    });
    return handleResponse<Project[]>(res);
  },

  /**
   * GET /api/projects/{id}
   */
  getById: async (projectId: string): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Project>(res);
  },

  /**
   * POST /api/projects
   */
  create: async (data: Partial<Project>): Promise<Project> => {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },
};

// ==================== SPRINTS API ====================

export const sprintsApi = {
  /**
   * GET /api/sprints?projectId={projectId}
   */
  getByProject: async (projectId: string): Promise<Sprint[]> => {
    const res = await fetch(`${API_BASE_URL}/sprints?projectId=${projectId}`, {
      headers: authHeaders(),
    });
    return handleResponse<Sprint[]>(res);
  },

  /**
   * POST /api/sprints
   */
  create: async (data: Partial<Sprint>): Promise<Sprint> => {
    const res = await fetch(`${API_BASE_URL}/sprints`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Sprint>(res);
  },
};
