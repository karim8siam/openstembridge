-- For existing v1 deployments only. Backup DB before migrating; run ONCE.
ALTER TABLE candidates ADD COLUMN availability_hours TEXT NOT NULL DEFAULT '';
ALTER TABLE candidates ADD COLUMN timezone_region TEXT NOT NULL DEFAULT '';
ALTER TABLE candidates ADD COLUMN collaboration_mode TEXT NOT NULL DEFAULT '';
ALTER TABLE candidates ADD COLUMN research_goal TEXT NOT NULL DEFAULT '';
ALTER TABLE candidates ADD COLUMN discovery_source TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN project_title TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN weekly_hours TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN duration TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN work_mode TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN location_detail TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN compensation_detail TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN eligibility TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN mentor_support TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN deadline TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN discovery_source TEXT NOT NULL DEFAULT '';
ALTER TABLE research_requests ADD COLUMN public_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(public_opt_in IN (0,1));
ALTER TABLE research_requests ADD COLUMN identity_checked INTEGER NOT NULL DEFAULT 0 CHECK(identity_checked IN (0,1));
CREATE INDEX IF NOT EXISTS idx_requests_public ON research_requests(status,identity_checked,public_opt_in,discipline);
CREATE TABLE IF NOT EXISTS project_interests (
 id TEXT PRIMARY KEY,
 project_id TEXT NOT NULL REFERENCES research_requests(id) ON DELETE CASCADE,
 full_name TEXT NOT NULL,
 email TEXT NOT NULL,
 institution TEXT NOT NULL,
 academic_level TEXT NOT NULL,
 skills TEXT NOT NULL,
 motivation TEXT NOT NULL,
 evidence_url TEXT,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','contacted')),
 created_at TEXT NOT NULL,
 reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_interests_project ON project_interests(project_id,status,created_at);
