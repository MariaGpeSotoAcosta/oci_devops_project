-- ============================================================
-- Sprint assignment + duplicate cleanup for PROJECT_ID = 39
-- Sprints:
--   Sprint 0  (ID=6)  → created before  2026-03-23
--   Sprint 1  (ID=3)  → 2026-03-23 .. 2026-04-03
--   Sprint 2  (ID=4)  → 2026-04-06 .. 2026-04-17
--   Sprint 3  (ID=5)  → 2026-04-17 .. 2026-04-30
-- ============================================================

-- ── Step 1: Remove duplicate tasks (same DESCRIPTION, keep lowest ID) ───────
DELETE FROM TASKS
WHERE PROJECT_ID = 39
  AND ID NOT IN (
      SELECT MIN(ID)
      FROM   TASKS
      WHERE  PROJECT_ID = 39
      GROUP BY DESCRIPTION
  );

-- ── Step 2: Assign SPRINT_ID based on CREATED_AT date ────────────────────────

-- Sprint 1 (ID=3): March 23 – April 3
UPDATE TASKS
SET    SPRINT_ID = 3
WHERE  PROJECT_ID = 39
  AND  TRUNC(CREATED_AT) BETWEEN DATE '2026-03-23' AND DATE '2026-04-03';

-- Sprint 2 (ID=4): April 6 – April 17
UPDATE TASKS
SET    SPRINT_ID = 4
WHERE  PROJECT_ID = 39
  AND  TRUNC(CREATED_AT) BETWEEN DATE '2026-04-06' AND DATE '2026-04-17';

-- Sprint 3 (ID=5): April 17 – April 30
-- Note: April 17 overlaps with Sprint 2 boundary — this UPDATE runs AFTER sprint 2
-- so April 17 tasks will end up in Sprint 3. Adjust the >= date if you want Sprint 2
-- to own April 17 (change to DATE '2026-04-18' below).
UPDATE TASKS
SET    SPRINT_ID = 5
WHERE  PROJECT_ID = 39
  AND  TRUNC(CREATED_AT) BETWEEN DATE '2026-04-17' AND DATE '2026-04-30';

-- Sprint 0 (ID=6): anything before March 23 (backlog / pre-sprint)
UPDATE TASKS
SET    SPRINT_ID = 6
WHERE  PROJECT_ID = 39
  AND  TRUNC(CREATED_AT) < DATE '2026-03-23';

COMMIT;

-- ── Verification query (run separately to check results) ─────────────────────
-- SELECT SPRINT_ID, COUNT(*) AS TASK_COUNT
-- FROM   TASKS
-- WHERE  PROJECT_ID = 39
-- GROUP  BY SPRINT_ID
-- ORDER  BY SPRINT_ID;
