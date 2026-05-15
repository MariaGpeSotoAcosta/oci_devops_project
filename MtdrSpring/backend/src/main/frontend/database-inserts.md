# Database Sample Data — MySQL INSERT Statements

> **Note:** The production database is Oracle Autonomous DB. These statements use standard MySQL syntax for documentation and local testing. Replace `AUTO_INCREMENT` with `GENERATED ALWAYS AS IDENTITY` for Oracle.

---

## Table of Contents

1. [users (app_users)](#1-users)
2. [projects](#2-projects)
3. [sprints](#3-sprints)
4. [tasks](#4-tasks)
5. [kpis (derived view)](#5-kpis)
6. [error_logs](#6-error_logs)

---

## 1. Users

```sql
-- app_users: stores all registered users
-- bio column added in latest migration (nullable)

INSERT INTO app_users (id, name, email, password, role, bio, telegram_connected, telegram_username, created_at)
VALUES
  (1, 'Ana García',    'ana@example.com',    '$2a$10$hashed_pw_1', 'admin',     'Team lead and full-stack developer.',    FALSE, NULL,         NOW()),
  (2, 'Carlos Méndez', 'carlos@example.com', '$2a$10$hashed_pw_2', 'developer', 'Backend specialist, loves clean APIs.',  FALSE, NULL,         NOW()),
  (3, 'María López',   'maria@example.com',  '$2a$10$hashed_pw_3', 'developer', 'Frontend React developer.',              TRUE,  '@maria_dev', NOW()),
  (4, 'Luis Torres',   'luis@example.com',   '$2a$10$hashed_pw_4', 'viewer',    'QA and testing lead.',                   FALSE, NULL,         NOW());
```

**Why each field matters:**
- `password` → always BCrypt-hashed, never plain text
- `bio` → new field; displayed on the editable profile page
- `telegram_connected` / `telegram_username` → populated when user links their Telegram account via `/ConfigUser`

---

## 2. Projects

```sql
-- projects: top-level containers for sprints and tasks
-- each project belongs to a team

INSERT INTO projects (id, name, description, project_key, status, team_id, created_at, updated_at)
VALUES
  (1, 'Project Alpha', 'Internal tool for time tracking',      'ALPHA', 'active',    1, NOW(), NOW()),
  (2, 'Project Beta',  'Client-facing dashboard application',  'BETA',  'active',    1, NOW(), NOW()),
  (3, 'Project Gamma', 'Mobile companion app',                 'GAMMA', 'planning',  2, NOW(), NOW());
```

**Relationships:**
- `team_id` → foreign key to `teams` table
- `status` → one of: `planning`, `active`, `on-hold`, `completed`

---

## 3. Sprints

Each project has multiple sprints. Sprint KPIs are scoped per sprint.

```sql
-- sprints: time-boxed iterations within a project

INSERT INTO sprints (id, name, goal, start_date, end_date, status, project_id)
VALUES
  -- Project Alpha sprints
  (1, 'Sprint 1', 'Set up core infrastructure and auth',           '2026-01-06', '2026-01-19', 'completed', 1),
  (2, 'Sprint 2', 'Build dashboard and analytics endpoints',       '2026-01-20', '2026-02-02', 'completed', 1),
  (3, 'Sprint 3', 'KPI filters, profile edit, error handling',     '2026-02-03', '2026-02-16', 'active',    1),

  -- Project Beta sprints
  (4, 'Sprint 1', 'Design system and component library',           '2026-01-13', '2026-01-26', 'completed', 2),
  (5, 'Sprint 2', 'Data visualization and chart components',       '2026-01-27', '2026-02-09', 'active',    2),

  -- Project Gamma sprints
  (6, 'Sprint 1', 'React Native project setup and navigation',     '2026-02-10', '2026-02-23', 'planning',  3);
```

**Sprint status flow:** `planning` → `active` → `completed`

---

## 4. Tasks

All work items are unified as **tasks** (type is always `task` — story/epic/bug types removed from UI).

```sql
-- tasks: all work items, always type = 'task'
-- story_points = estimated hours, worked_hours = actual hours logged

INSERT INTO tasks (
  id, title, description, task_status, priority, task_type,
  assignee_id, story_points, worked_hours, sprint_id, project_id,
  created_at, updated_at, completed_at
)
VALUES
  -- Alpha · Sprint 1 (completed)
  (1,  'Set up Spring Boot project',      'Initialize Maven project with dependencies', 'done',        'high',   'task', 2, 4,  4,  1, 1, '2026-01-06', '2026-01-07', '2026-01-07'),
  (2,  'Configure Oracle DB connection',  'Set up UCP pool and wallet',                 'done',        'high',   'task', 2, 6,  7,  1, 1, '2026-01-06', '2026-01-08', '2026-01-08'),
  (3,  'Implement JWT authentication',    'Login, register, token validation',          'done',        'high',   'task', 1, 8,  9,  1, 1, '2026-01-07', '2026-01-10', '2026-01-10'),
  (4,  'Create React app with Vite',      'Frontend scaffolding with TypeScript',       'done',        'medium', 'task', 3, 4,  4,  1, 1, '2026-01-08', '2026-01-09', '2026-01-09'),

  -- Alpha · Sprint 2 (completed)
  (5,  'Build analytics service',         'Velocity, priority, worked hours APIs',      'done',        'high',   'task', 2, 10, 12, 2, 1, '2026-01-20', '2026-01-25', '2026-01-25'),
  (6,  'Dashboard charts with Recharts',  'Bar, pie, line chart components',            'done',        'medium', 'task', 3, 8,  8,  2, 1, '2026-01-21', '2026-01-26', '2026-01-26'),
  (7,  'Kanban board drag-and-drop',      'React DnD integration on Board page',        'done',        'medium', 'task', 3, 6,  7,  2, 1, '2026-01-22', '2026-01-28', '2026-01-28'),
  (8,  'Team management endpoints',       'Create, join, invite team members',          'done',        'high',   'task', 1, 8,  9,  2, 1, '2026-01-23', '2026-01-29', '2026-01-29'),

  -- Alpha · Sprint 3 (active — current)
  (9,  'KPI project/sprint selectors',    'Add 3 dropdowns to dashboard',               'done',        'high',   'task', 3, 6,  5,  3, 1, '2026-02-03', '2026-02-05', '2026-02-05'),
  (10, 'Sprint KPI backend endpoint',     'GET /api/analytics/kpis?projectId&sprintId', 'done',        'high',   'task', 2, 4,  4,  3, 1, '2026-02-03', '2026-02-04', '2026-02-04'),
  (11, 'Editable user profile',           'PUT /api/users/profile + Settings form',     'in-progress', 'medium', 'task', 1, 5,  3,  3, 1, '2026-02-04', '2026-02-06', NULL),
  (12, 'Global error toast component',    'ErrorContext + ErrorToast + App wiring',      'in-progress', 'medium', 'task', 3, 3,  2,  3, 1, '2026-02-05', '2026-02-06', NULL),
  (13, 'Remove task type distinctions',   'Default all tasks to type=task in UI',       'todo',        'low',    'task', 2, 2,  0,  3, 1, '2026-02-05', '2026-02-05', NULL),

  -- Beta · Sprint 1 (completed)
  (14, 'Design token system',             'Colors, spacing, typography in Tailwind',    'done',        'medium', 'task', 3, 5,  6,  4, 2, '2026-01-13', '2026-01-17', '2026-01-17'),
  (15, 'Radix UI component wrappers',     'Button, Card, Dialog, Select, Input',        'done',        'high',   'task', 3, 8,  9,  4, 2, '2026-01-14', '2026-01-20', '2026-01-20'),

  -- Beta · Sprint 2 (active)
  (16, 'Chart color theming',             'Support dark mode in all Recharts graphs',   'in-progress', 'medium', 'task', 3, 4,  2,  5, 2, '2026-01-27', '2026-02-01', NULL),
  (17, 'Responsive dashboard grid',       '2-col mobile, 4-col desktop layout',         'todo',        'low',    'task', 1, 3,  0,  5, 2, '2026-01-28', '2026-01-28', NULL);
```

---

## 5. KPIs

KPIs are **computed on the fly** by `GET /api/analytics/kpis?projectId=X&sprintId=Y` — they are not stored in a separate table. The endpoint aggregates tasks from the `tasks` table.

**Example output for each sprint:**

| Project       | Sprint   | Total Tasks | Completed | Hours Worked | Hours Estimated | Completion % |
|---------------|----------|-------------|-----------|--------------|-----------------|-------------|
| Project Alpha | Sprint 1 | 4           | 4         | 24h          | 22h             | 100%        |
| Project Alpha | Sprint 2 | 4           | 4         | 36h          | 32h             | 100%        |
| Project Alpha | Sprint 3 | 5           | 2         | 14h          | 20h             | 40%         |
| Project Beta  | Sprint 1 | 2           | 2         | 15h          | 13h             | 100%        |
| Project Beta  | Sprint 2 | 2           | 0         | 2h           | 7h              | 0%          |

If you want to **materialise KPIs** as a table for reporting or caching:

```sql
-- Optional: materialised KPI snapshot table (for caching or audit trail)
CREATE TABLE kpi_snapshots (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  project_id   INT NOT NULL,
  sprint_id    INT,                          -- NULL = aggregate across all sprints
  snapshot_at  DATETIME NOT NULL DEFAULT NOW(),
  total_tasks       INT NOT NULL DEFAULT 0,
  completed_tasks   INT NOT NULL DEFAULT 0,
  hours_worked      INT NOT NULL DEFAULT 0,
  hours_estimated   INT NOT NULL DEFAULT 0,
  completion_rate   DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (sprint_id)  REFERENCES sprints(id)
);

-- Example snapshot inserts
INSERT INTO kpi_snapshots (project_id, sprint_id, total_tasks, completed_tasks, hours_worked, hours_estimated, completion_rate)
VALUES
  (1, 1, 4, 4, 24, 22, 100.00),
  (1, 2, 4, 4, 36, 32, 100.00),
  (1, 3, 5, 2, 14, 20,  40.00),
  (2, 4, 2, 2, 15, 13, 100.00),
  (2, 5, 2, 0,  2,  7,   0.00),
  -- project-level aggregate (no sprint)
  (1, NULL, 13, 10, 74, 74,  76.92),
  (2, NULL,  4,  2, 17, 20,  50.00);
```

---

## 6. Error Logs

Optional table — useful for persisting errors that reach the global `ErrorToast` component or backend exceptions.

```sql
CREATE TABLE error_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,                            -- NULL for unauthenticated errors
  error_code  VARCHAR(20),                    -- e.g. 'HTTP_500', 'NETWORK'
  message     TEXT NOT NULL,
  source      VARCHAR(100),                   -- e.g. 'GET /api/analytics/kpis'
  stack_trace TEXT,
  created_at  DATETIME NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL
);

-- Example frontend API error logs
INSERT INTO error_logs (user_id, error_code, message, source, created_at)
VALUES
  (3, 'HTTP_500', 'Could not load analytics data.',                'GET /api/analytics/velocity',     '2026-02-04 10:23:11'),
  (2, 'HTTP_404', 'Sprint not found: 99',                          'GET /api/analytics/kpis',         '2026-02-04 14:05:32'),
  (1, 'HTTP_401', 'JWT token expired. Please log in again.',       'PUT /api/users/profile',          '2026-02-05 09:15:00'),
  (NULL, 'NETWORK', 'Failed to fetch — backend may be offline.',   'POST /api/auth/login',            '2026-02-05 11:44:02');
```

**How to wire it:** call `POST /api/errors` from the `ErrorProvider` whenever `showError()` is invoked, optionally batching logs before sending.

---

## Summary of Schema Relationships

```
teams
 └── projects (team_id)
      ├── sprints (project_id)
      │    └── tasks (sprint_id, project_id)
      │         └── task_comments (task_id)
      └── tasks (project_id, sprint_id = NULL → backlog)

app_users
 ├── tasks (assignee_id)
 ├── team_memberships (user_id, team_id, role)
 └── join_codes (user_id)

kpi_snapshots (optional)
 ├── project_id → projects
 └── sprint_id  → sprints

error_logs
 └── user_id → app_users
```
