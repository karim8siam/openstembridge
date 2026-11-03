-- OpenSTEM Research Match v2 | run once for a NEW D1 database.
-- Already running v1? Run migrations/001_research_exchange.sql INSTEAD.
CREATE TABLE IF NOT EXISTS candidates (
 id TEXT PRIMARY KEY,
 public_name TEXT NOT NULL,
 email TEXT NOT NULL,
 institution TEXT NOT NULL,
 academic_level TEXT NOT NULL,
 discipline TEXT NOT NULL,
 research_area TEXT NOT NULL,
 skills TEXT NOT NULL,
 bio TEXT NOT NULL,
 evidence_url TEXT,
 availability_hours TEXT NOT NULL DEFAULT '',
 timezone_region TEXT NOT NULL DEFAULT '',
 collaboration_mode TEXT NOT NULL DEFAULT '',
 research_goal TEXT NOT NULL DEFAULT '',
 discovery_source TEXT NOT NULL DEFAULT '',
 public_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(public_opt_in IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','contacted')),
 created_at TEXT NOT NULL,
 reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_candidates_public ON candidates(status,public_opt_in,discipline);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE TABLE IF NOT EXISTS research_requests (
 id TEXT PRIMARY KEY,
 full_name TEXT NOT NULL,
 email TEXT NOT NULL,
 institution TEXT NOT NULL,
 discipline TEXT NOT NULL,
 required_skills TEXT NOT NULL,
 project_summary TEXT NOT NULL,
 opportunity_type TEXT NOT NULL,
 candidate_id TEXT,
 project_title TEXT NOT NULL DEFAULT '',
 weekly_hours TEXT NOT NULL DEFAULT '',
 duration TEXT NOT NULL DEFAULT '',
 work_mode TEXT NOT NULL DEFAULT '',
 location_detail TEXT NOT NULL DEFAULT '',
 compensation_detail TEXT NOT NULL DEFAULT '',
 eligibility TEXT NOT NULL DEFAULT '',
 mentor_support TEXT NOT NULL DEFAULT '',
 deadline TEXT NOT NULL DEFAULT '',
 discovery_source TEXT NOT NULL DEFAULT '',
 public_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(public_opt_in IN (0,1)),
 identity_checked INTEGER NOT NULL DEFAULT 0 CHECK(identity_checked IN (0,1)),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','contacted')),
 created_at TEXT NOT NULL,
 reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON research_requests(status,created_at);
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
CREATE TABLE IF NOT EXISTS rate_limits (
 key TEXT PRIMARY KEY,
 window_hour INTEGER NOT NULL,
 hits INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_hour ON rate_limits(window_hour);
