# Sprint Management — SQL Sample Data

> Standard MySQL syntax. For Oracle substitute `AUTO_INCREMENT` → `GENERATED ALWAYS AS IDENTITY`
> and `NOW()` → `SYSDATE`.

---

## Table Relationships

```
teams
 └── projects          (team_id → teams.id)
      └── sprints      (project_id → projects.id)
           └── tasks   (sprint_id → sprints.id, project_id → projects.id)
                       sprint_id is nullable → NULL means "backlog"
```

---

## 1. Teams

```sql
INSERT INTO teams (id, name, description, join_code, created_at) VALUES
  (1, 'Core Engineering', 'Main product team',          'ENG001', NOW()),
  (2, 'Mobile Squad',     'iOS and Android developers', 'MOB002', NOW());
```

---

## 2. Projects

```sql
INSERT INTO projects (id, name, description, project_key, status, team_id, created_at, updated_at) VALUES
  (1, 'Project Alpha', 'Internal DevOps dashboard',        'ALPHA', 'active',    1, NOW(), NOW()),
  (2, 'Project Beta',  'Client-facing analytics platform', 'BETA',  'active',    1, NOW(), NOW()),
  (3, 'Project Gamma', 'Mobile companion app',             'GAMMA', 'planning',  2, NOW(), NOW());
```

---

## 3. Sprints — multiple per project

Each project has three sprints showing different lifecycle states.

```sql
-- ── Project Alpha (ALPHA) ──────────────────────────────────────────────────
INSERT INTO sprints (id, name, goal, start_date, end_date, status, project_id) VALUES
  (1, 'Sprint 1', 'Core infrastructure: auth, DB, CI/CD pipeline',
      '2026-01-06', '2026-01-19', 'completed', 1),

  (2, 'Sprint 2', 'Dashboard, analytics endpoints, Kanban board',
      '2026-01-20', '2026-02-02', 'completed', 1),

  (3, 'Sprint 3', 'Sprint management, KPI filters, profile editing',
      '2026-02-03', '2026-02-16', 'active',    1);

-- ── Project Beta (BETA) ────────────────────────────────────────────────────
INSERT INTO sprints (id, name, goal, start_date, end_date, status, project_id) VALUES
  (4, 'Sprint 1', 'Design system: tokens, Radix UI wrappers, dark mode',
      '2026-01-13', '2026-01-26', 'completed', 2),

  (5, 'Sprint 2', 'Data visualization: charts, responsive grid',
      '2026-01-27', '2026-02-09', 'active',    2),

  (6, 'Sprint 3', 'Export, PDF reports, email notifications',
      '2026-02-10', '2026-02-23', 'planning',  2);

-- ── Project Gamma (GAMMA) ──────────────────────────────────────────────────
INSERT INTO sprints (id, name, goal, start_date, end_date, status, project_id) VALUES
  (7, 'Sprint 1', 'React Native scaffold, navigation, auth screens',
      '2026-02-03', '2026-02-16', 'planning',  3),

  (8, 'Sprint 2', 'Offline sync, push notifications',
      '2026-02-17', '2026-03-02', 'planning',  3);
```

---

## 4. Tasks — distributed across sprints + backlog

`sprint_id = NULL` means the task lives in the **backlog** (not yet committed to a sprint).

```sql
-- ── Alpha · Sprint 1 (completed) ──────────────────────────────────────────
INSERT INTO tasks (id, title, description, task_status, priority, task_type,
                   assignee_id, story_points, worked_hours,
                   sprint_id, project_id, created_at, updated_at, completed_at)
VALUES
  (1,  'Initialize Spring Boot project',
       'Maven setup with all required dependencies',
       'done', 'high', 'task', 2, 3, 3, 1, 1, '2026-01-06', '2026-01-07', '2026-01-07'),

  (2,  'Configure Oracle DB + UCP pool',
       'Wallet setup, connection pool tuning',
       'done', 'high', 'task', 2, 5, 6, 1, 1, '2026-01-06', '2026-01-08', '2026-01-08'),

  (3,  'Implement JWT authentication',
       'Register, login, token validation middleware',
       'done', 'high', 'task', 1, 8, 9, 1, 1, '2026-01-07', '2026-01-10', '2026-01-10'),

  (4,  'Set up React + Vite + Tailwind',
       'Frontend scaffolding with TypeScript and dark mode',
       'done', 'medium', 'task', 3, 4, 4, 1, 1, '2026-01-08', '2026-01-09', '2026-01-09'),

  (5,  'GitHub Actions CI/CD pipeline',
       'Build, test, deploy to OCI on push to main',
       'done', 'high', 'task', 1, 6, 7, 1, 1, '2026-01-09', '2026-01-12', '2026-01-12');

-- ── Alpha · Sprint 2 (completed) ──────────────────────────────────────────
INSERT INTO tasks (id, title, description, task_status, priority, task_type,
                   assignee_id, story_points, worked_hours,
                   sprint_id, project_id, created_at, updated_at, completed_at)
VALUES
  (6,  'Analytics service: velocity + priority',
       'AnalyticsService with ISO week aggregation',
       'done', 'high', 'task', 2, 10, 12, 2, 1, '2026-01-20', '2026-01-25', '2026-01-25'),

  (7,  'Dashboard charts with Recharts',
       'Bar, pie, stacked bar charts',
       'done', 'medium', 'task', 3, 8, 8, 2, 1, '2026-01-21', '2026-01-26', '2026-01-26'),

  (8,  'Kanban board with React DnD',
       'Drag-and-drop between status columns',
       'done', 'medium', 'task', 3, 6, 7, 2, 1, '2026-01-22', '2026-01-28', '2026-01-28'),

  (9,  'Team management endpoints',
       'Create, join, invite; join-code system',
       'done', 'high', 'task', 1, 8, 9, 2, 1, '2026-01-23', '2026-01-29', '2026-01-29');

-- ── Alpha · Sprint 3 (active — current sprint) ────────────────────────────
INSERT INTO tasks (id, title, description, task_status, priority, task_type,
                   assignee_id, story_points, worked_hours,
                   sprint_id, project_id, created_at, updated_at, completed_at)
VALUES
  (10, 'KPI project/sprint selectors on dashboard',
       '3 dropdowns: project, sprint, chart range',
       'done', 'high', 'task', 3, 6, 5, 3, 1, '2026-02-03', '2026-02-05', '2026-02-05'),

  (11, 'GET /api/analytics/kpis endpoint',
       'Filter by projectId + sprintId, return SprintKpiDTO',
       'done', 'high', 'task', 2, 4, 4, 3, 1, '2026-02-03', '2026-02-04', '2026-02-04'),

  (12, 'Sprint creation dialog + Backlog integration',
       'SprintCreateDialog, Create Sprint button, sprint pills',
       'in-progress', 'high', 'task', 3, 5, 4, 3, 1, '2026-02-10', '2026-02-12', NULL),

  (13, 'Board sprint selector filters tasks',
       'Project + sprint dropdowns filter Kanban columns',
       'in-progress', 'high', 'task', 1, 4, 3, 3, 1, '2026-02-10', '2026-02-12', NULL),

  (14, 'Global error toast component',
       'ErrorContext + ErrorToast bottom-right corner',
       'todo', 'medium', 'task', 2, 3, 0, 3, 1, '2026-02-11', '2026-02-11', NULL);

-- ── Alpha · Backlog (sprint_id = NULL) ────────────────────────────────────
INSERT INTO tasks (id, title, description, task_status, priority, task_type,
                   assignee_id, story_points, worked_hours,
                   sprint_id, project_id, created_at, updated_at, completed_at)
VALUES
  (15, 'Telegram bot task status updates',
       'Allow /ModStatus command from Telegram',
       'todo', 'low', 'task', 2, 4, 0, NULL, 1, '2026-02-05', '2026-02-05', NULL),

  (16, 'Email notification on task assignment',
       'Send email when assignee changes',
       'todo', 'low', 'task', NULL, 3, 0, NULL, 1, '2026-02-06', '2026-02-06', NULL);

-- ── Beta · Sprint 1 (completed) ───────────────────────────────────────────
INSERT INTO tasks (id, title, description, task_status, priority, task_type,
                   assignee_id, story_points, worked_hours,
                   sprint_id, project_id, created_at, updated_at, completed_at)
VALUES
  (17, 'Design token system',
       'Colors, spacing, typography in Tailwind v4',
       'done', 'medium', 'task', 3, 5, 6, 4, 2, '2026-01-13', '2026-01-17', '2026-01-17'),

  (18, 'Radix UI component wrappers',
       'Button, Card, Dialog, Select, Input, Badge',
       'done', 'high', 'task', 3, 8, 9, 4, 2, '2026-01-14', '2026-01-20', '2026-01-20'),

  (19, 'Dark mode theme toggle',
       'ThemeContext + CSS class strategy',
       'done', 'medium', 'task', 1, 4, 4, 4, 2, '2026-01-15', '2026-01-18', '2026-01-18');

-- ── Beta · Sprint 2 (active) ──────────────────────────────────────────────
INSERT INTO tasks (id, title, description, task_status, priority, task_type,
                   assignee_id, story_points, worked_hours,
                   sprint_id, project_id, created_at, updated_at, completed_at)
VALUES
  (20, 'Recharts dark mode theming',
       'All chart colors adapt to dark/light mode',
       'in-progress', 'medium', 'task', 3, 4, 2, 5, 2, '2026-01-27', '2026-02-01', NULL),

  (21, 'Responsive 4-column dashboard grid',
       '2-col mobile, 4-col desktop layout',
       'todo', 'low', 'task', 1, 3, 0, 5, 2, '2026-01-28', '2026-01-28', NULL),

  (22, 'Stacked bar chart for worked hours',
       'Per-user per-week stacked bar visualization',
       'done', 'medium', 'task', 2, 5, 5, 5, 2, '2026-01-29', '2026-02-03', '2026-02-03');
```

---

## 5. KPI Snapshot Table (optional cache)

KPIs are computed on demand by `GET /api/analytics/kpis?projectId=X&sprintId=Y`.
Use this table only if you want to **cache or audit** historical snapshots.

```sql
CREATE TABLE kpi_snapshots (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  project_id        INT NOT NULL,
  sprint_id         INT,                          -- NULL = all sprints aggregate
  snapshot_at       DATETIME NOT NULL DEFAULT NOW(),
  total_tasks       INT     NOT NULL DEFAULT 0,
  completed_tasks   INT     NOT NULL DEFAULT 0,
  hours_worked      INT     NOT NULL DEFAULT 0,
  hours_estimated   INT     NOT NULL DEFAULT 0,
  completion_rate   DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (sprint_id)  REFERENCES sprints(id)
);

-- Realistic snapshots matching the tasks above
INSERT INTO kpi_snapshots
  (project_id, sprint_id, total_tasks, completed_tasks, hours_worked, hours_estimated, completion_rate)
VALUES
  -- Alpha per sprint
  (1, 1,  5, 5, 29, 26, 100.00),
  (1, 2,  4, 4, 36, 32, 100.00),
  (1, 3,  5, 2, 12, 22,  40.00),
  -- Alpha aggregate (all sprints)
  (1, NULL, 14, 11, 77, 80,  78.57),

  -- Beta per sprint
  (2, 4,  3, 3, 19, 17, 100.00),
  (2, 5,  3, 1,  7, 12,  33.33),
  -- Beta aggregate
  (2, NULL, 6, 4, 26, 29, 66.67),

  -- Gamma (no tasks yet)
  (3, 7,  0, 0,  0,  0,   0.00),
  (3, 8,  0, 0,  0,  0,   0.00);
```

---

## KPI Summary Table

Derived from the tasks above — matches what `GET /api/analytics/kpis` returns at runtime:

| Project       | Sprint   | Tasks | Done | Hours Worked | Hours Est. | Completion |
|---------------|----------|-------|------|--------------|------------|-----------|
| Project Alpha | Sprint 1 | 5     | 5    | 29h          | 26h        | **100%**  |
| Project Alpha | Sprint 2 | 4     | 4    | 36h          | 32h        | **100%**  |
| Project Alpha | Sprint 3 | 5     | 2    | 12h          | 22h        | **40%**   |
| Project Beta  | Sprint 1 | 3     | 3    | 19h          | 17h        | **100%**  |
| Project Beta  | Sprint 2 | 3     | 1    | 7h           | 12h        | **33%**   |
| Project Gamma | Sprint 1 | 0     | 0    | 0h           | 0h         | —         |
| Project Gamma | Sprint 2 | 0     | 0    | 0h           | 0h         | —         |

---

## Flow: Project → Sprint → Task → KPI

```
POST /api/projects          → creates project (team_id required)
POST /api/sprints           → creates sprint  (projectId required)
POST /api/tasks             → creates task    (projectId required, sprintId optional)
PUT  /api/tasks/{id}        → move task into sprint (sprintId field)
GET  /api/sprints?projectId=1          → list sprints for project
GET  /api/tasks?sprintId=3             → tasks for a sprint (for Kanban board)
GET  /api/analytics/kpis?projectId=1&sprintId=3  → KPI metrics for sprint
```
