import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'openstem.sqlite');

const db = new DatabaseSync(DB_PATH);

console.log('Seeding initial curated opportunities and candidates into local database...');

const sampleOpportunities = [
  {
    id: 'opp-quantum-optics-2026',
    full_name: 'Dr. Elena Rostova',
    email: 'e.rostova@quantum-lab.org',
    institution: 'Quantum Information Lab, Tech Institute',
    discipline: 'Physics',
    required_skills: 'Python, Qiskit, Linear Algebra, Master Equations',
    project_summary: 'Investigating decoherence mitigation in open quantum spin networks. The student will reproduce published Lindblad master-equation simulations, evaluate numerical stability under varying coupling strengths, and contribute to an open-source benchmark suite.',
    opportunity_type: 'Funded research position',
    project_title: 'Numerical Simulation of Open Quantum Spin Systems',
    weekly_hours: '8–10 hours/week',
    duration: '10 weeks',
    work_mode: 'Remote',
    location_detail: 'Fully remote with weekly video meetings (UTC+1 to UTC+6)',
    compensation_detail: 'Stipend available via university grant ($600/month)',
    eligibility: 'Undergraduate or Master’s student with Python and quantum mechanics basics',
    mentor_support: 'Weekly 1-on-1 supervision, dedicated Discord office hours, computational cluster access, and co-authorship opportunity if benchmarks are accepted.',
    deadline: '2026-12-31',
    discovery_source: 'Researcher or lab',
    public_opt_in: 1,
    identity_checked: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'opp-bio-single-cell-2026',
    full_name: 'Prof. Marcus Vance',
    email: 'm.vance@genomics-center.edu',
    institution: 'Center for Computational Biology',
    discipline: 'Biology',
    required_skills: 'R or Python, Seurat / Scanpy, Statistics, Data Visualization',
    project_summary: 'Benchmarking trajectory-inference algorithms across public single-cell RNA-seq datasets of immune cell differentiation. You will evaluate reproducibility of published clusters and identify algorithmic sensitivity to preprocessing filters.',
    opportunity_type: 'Academic credit / internship',
    project_title: 'Benchmarking Single-Cell Trajectory Reconstruction in Immune Cells',
    weekly_hours: '6–8 hours/week',
    duration: '12 weeks',
    work_mode: 'Flexible',
    location_detail: 'Hybrid or remote; core meetings in European time zones',
    compensation_detail: 'Academic internship credit, compute resources provided',
    eligibility: 'Familiarity with R or Python and foundational biology or bioinformatics',
    mentor_support: 'Fortnightly review with senior postdoc, code review on GitHub, and guidance drafting a short conference abstract.',
    deadline: '2026-11-30',
    discovery_source: 'OpenSTEM website',
    public_opt_in: 1,
    identity_checked: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'opp-sciml-climate-2026',
    full_name: 'Dr. Ananya Sen',
    email: 'ananya.sen@earth-datascience.org',
    institution: 'Atmospheric Physics & Data Science Group',
    discipline: 'Computer Science',
    required_skills: 'Python, PyTorch, NumPy, Physics-Informed Neural Networks',
    project_summary: 'Developing lightweight surrogate models for advection-diffusion equations in regional weather prediction. Comparing Fourier Neural Operators (FNO) against standard CNN baselines with an emphasis on physical conservation laws.',
    opportunity_type: 'Paid research role',
    project_title: 'Scientific ML Surrogates for Atmospheric Transport Models',
    weekly_hours: '10–12 hours/week',
    duration: '8 weeks',
    work_mode: 'Remote',
    location_detail: 'Global remote collaboration',
    compensation_detail: '$22/hour funded by national climate data initiative',
    eligibility: 'Strong background in deep learning baselines and ODEs/PDEs',
    mentor_support: 'Weekly structured check-ins, cloud GPU allocation (A100 instances), and support preparing findings for publication.',
    deadline: '2026-12-15',
    discovery_source: 'OpenSTEM website',
    public_opt_in: 1,
    identity_checked: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const sampleCandidates = [
  {
    id: 'cand-sofia-chen-2026',
    public_name: 'Sofia Chen',
    email: 'sofia.c@student-mail.edu',
    institution: 'State University',
    academic_level: 'Undergraduate',
    discipline: 'Physics',
    research_area: 'Quantum Computing & Simulation',
    skills: 'Python, Qiskit, QuTiP, Linear Algebra, LaTeX',
    bio: 'Undergraduate researcher focusing on open quantum systems. Built and published an open-source reproducibility notebook replicating the Jaynes-Cummings model dynamics with dissipative photon loss.',
    evidence_url: 'https://github.com/example/quantum-reproducibility-demo',
    availability_hours: '10 hours/week',
    timezone_region: 'UTC-5 / North America',
    collaboration_mode: 'Remote',
    research_goal: 'Collaborate on numerical modeling of quantum decoherence and contribute to open peer-reviewed work.',
    discovery_source: 'Discord community',
    public_opt_in: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'cand-tariq-ahmed-2026',
    public_name: 'Tariq Ahmed',
    email: 'tariq.a@grad-portal.org',
    institution: 'Institute of Applied Sciences',
    academic_level: 'Master’s student',
    discipline: 'Computer Science',
    research_area: 'Scientific Machine Learning & PINNs',
    skills: 'Python, PyTorch, JAX, Numerical Analysis, SciPy',
    bio: 'MSc student exploring physics-informed neural networks for fluid dynamics. Implemented benchmark models for 1D Burgers equation and verified conservation of mass constraints across test suites.',
    evidence_url: 'https://github.com/example/pinn-fluid-benchmarks',
    availability_hours: '12 hours/week',
    timezone_region: 'UTC+6 / South Asia',
    collaboration_mode: 'Remote',
    research_goal: 'Gain hands-on experience applying neural operators to climate and atmospheric physics modeling.',
    discovery_source: 'OpenSTEM website',
    public_opt_in: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'cand-maya-lin-2026',
    public_name: 'Maya Lin',
    email: 'maya.lin@biocompute.org',
    institution: 'Metropolitan University',
    academic_level: 'Undergraduate',
    discipline: 'Biology',
    research_area: 'Computational Genomics & Data Analysis',
    skills: 'R, Python, Bioconductor, Scanpy, ggplot2',
    bio: '3rd year computational biology major. Completed an independent replication of a single-cell RNA-seq clustering workflow on pancreas islet cells, documenting batch correction trade-offs.',
    evidence_url: 'https://github.com/example/scrna-replication-study',
    availability_hours: '8 hours/week',
    timezone_region: 'UTC+1 / Europe',
    collaboration_mode: 'Flexible',
    research_goal: 'Learn cutting-edge spatial transcriptomics analysis and assist a lab with data quality pipelines.',
    discovery_source: 'Researcher or lab',
    public_opt_in: 1,
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    reviewed_at: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

// Insert opportunities
const insertOpp = db.prepare(`
  INSERT INTO research_requests (
    id, full_name, email, institution, discipline, required_skills, project_summary,
    opportunity_type, project_title, weekly_hours, duration, work_mode, location_detail,
    compensation_detail, eligibility, mentor_support, deadline, discovery_source,
    public_opt_in, identity_checked, status, created_at, reviewed_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET
    project_title=excluded.project_title,
    project_summary=excluded.project_summary,
    status='approved',
    identity_checked=1,
    public_opt_in=1
`);

for (const opp of sampleOpportunities) {
  insertOpp.run(
    opp.id, opp.full_name, opp.email, opp.institution, opp.discipline,
    opp.required_skills, opp.project_summary, opp.opportunity_type, opp.project_title,
    opp.weekly_hours, opp.duration, opp.work_mode, opp.location_detail,
    opp.compensation_detail, opp.eligibility, opp.mentor_support, opp.deadline,
    opp.discovery_source, opp.public_opt_in, opp.identity_checked, opp.status,
    opp.created_at, opp.reviewed_at
  );
}

// Insert candidates
const insertCand = db.prepare(`
  INSERT INTO candidates (
    id, public_name, email, institution, academic_level, discipline, research_area,
    skills, bio, evidence_url, availability_hours, timezone_region, collaboration_mode,
    research_goal, discovery_source, public_opt_in, status, created_at, reviewed_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET
    public_name=excluded.public_name,
    bio=excluded.bio,
    status='approved',
    public_opt_in=1
`);

for (const cand of sampleCandidates) {
  insertCand.run(
    cand.id, cand.public_name, cand.email, cand.institution, cand.academic_level,
    cand.discipline, cand.research_area, cand.skills, cand.bio, cand.evidence_url,
    cand.availability_hours, cand.timezone_region, cand.collaboration_mode,
    cand.research_goal, cand.discovery_source, cand.public_opt_in, cand.status,
    cand.created_at, cand.reviewed_at
  );
}

console.log('✅ Successfully seeded curated opportunities and approved candidate profiles.');
