export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskType = 'story' | 'task' | 'bug' | 'epic';
export type UserRole = 'admin' | 'developer' | 'viewer';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  telegramConnected: boolean;
  telegramUsername?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  storyPoints?: number;
  sprintId?: string;
  projectId: string;
  tags: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed';
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  key: string;
  status: ProjectStatus;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  joinCode?: string; // 6-character code for joining the team
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_assigned' | 'sprint_started' | 'sprint_completed' | 'comment_added';
  userId: string;
  userName: string;
  description: string;
  timestamp: Date;
  projectId?: string;
  taskId?: string;
}

export interface NotificationSettings {
  taskAssignment: boolean;
  sprintUpdates: boolean;
  mentions: boolean;
  comments: boolean;
  emailNotifications: boolean;
  telegramNotifications: boolean;
}
