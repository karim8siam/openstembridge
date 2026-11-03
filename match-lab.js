'use strict';

const SAMPLE_PROJECTS = [
  {
    id: 'example-quantum',
    discipline: 'Physics',
    project_title: 'Numerical Simulation of Open Quantum Spin Systems',
    institution: 'Quantum Information Lab, Tech Institute',
    full_name: 'Dr. Elena Rostova',
    required_skills: 'Python, Qiskit, Linear algebra, Master equations',
    project_summary: 'Investigating decoherence mitigation in open quantum spin networks. Reproduce published Lindblad master-equation simulations, evaluate numerical stability under varying coupling strengths, and contribute to an open benchmark suite.',
    opportunity_type: 'Funded research position',
    work_mode: 'Remote',
    weekly_hours: '8–10 h/week',
    duration: '10 weeks',
    location_detail: 'Fully remote with weekly video meetings (UTC+1 to UTC+6)',
    compensation_detail: 'Stipend available via university grant ($600/month)',
    eligibility: 'Undergraduate or Master’s student with Python and quantum mechanics basics',
    mentor_support: 'Weekly 1-on-1 supervision, dedicated Discord office hours, computational cluster access, and co-authorship opportunity if benchmarks are accepted.',
    deadline: '2026-12-31'
  },
  {
    id: 'example-biocompute',
    discipline: 'Biology',
    project_title: 'Benchmarking Single-Cell Trajectory Reconstruction in Immune Cells',
    institution: 'Center for Computational Biology',
    full_name: 'Prof. Marcus Vance',
    required_skills: 'R, Python, Seurat / Scanpy, Statistics, Visualization',
    project_summary: 'Benchmarking trajectory-inference algorithms across public single-cell RNA-seq datasets of immune cell differentiation. You will evaluate reproducibility of published clusters and identify algorithmic sensitivity to preprocessing filters.',
    opportunity_type: 'Academic credit / internship',
    work_mode: 'Flexible',
    weekly_hours: '6–8 h/week',
    duration: '12 weeks',
    location_detail: 'Hybrid or remote; core meetings in European time zones',
    compensation_detail: 'Academic internship credit, compute resources provided',
    eligibility: 'Familiarity with R or Python and foundational biology or bioinformatics',
    mentor_support: 'Fortnightly review with senior postdoc, code review on GitHub, and guidance drafting a short conference abstract.',
    deadline: '2026-11-30'
  },
  {
    id: 'example-ml',
    discipline: 'Computer Science',
    project_title: 'Scientific ML Surrogates for Atmospheric Transport Models',
    institution: 'Atmospheric Physics & Data Science Group',
    full_name: 'Dr. Ananya Sen',
    required_skills: 'Python, PyTorch, NumPy, Physics-Informed Neural Networks',
    project_summary: 'Developing lightweight surrogate models for advection-diffusion equations in regional weather prediction. Comparing Fourier Neural Operators (FNO) against standard CNN baselines with an emphasis on physical conservation laws.',
    opportunity_type: 'Paid research role',
    work_mode: 'Remote',
    weekly_hours: '10–12 h/week',
    duration: '8 weeks',
    location_detail: 'Global remote collaboration',
    compensation_detail: '$22/hour funded by national climate data initiative',
    eligibility: 'Strong background in deep learning baselines and ODEs/PDEs',
    mentor_support: 'Weekly structured check-ins, cloud GPU allocation (A100 instances), and support preparing findings for publication.',
    deadline: '2026-12-15'
  }
];

let publishedProjects = [];
let projectsLoaded = false;
let charterText = '';
let charterMarkdown = '';

let activeModeFilter = 'all';
let activeTypeFilter = 'all';

const qs = id => document.getElementById(id);
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function board() {
  const source = projectsLoaded && publishedProjects.length ? publishedProjects : SAMPLE_PROJECTS;
  const isCuratedPreview = !(projectsLoaded && publishedProjects.length);
  const keyword = (qs('opportunity-search')?.value || '').trim().toLowerCase();
  const discipline = qs('opportunity-discipline')?.value || 'All subjects';

  const matches = source.filter(p => {
    const matchDiscipline = discipline === 'All subjects' || p.discipline === discipline;
    const matchKeyword = [p.project_title, p.institution, p.discipline, p.required_skills, p.project_summary, p.work_mode, p.opportunity_type, p.compensation_detail]
      .join(' ').toLowerCase().includes(keyword);
    const matchMode = activeModeFilter === 'all' || (p.work_mode && p.work_mode.toLowerCase().includes(activeModeFilter.toLowerCase()));
    const matchType = activeTypeFilter === 'all' || 
      (activeTypeFilter === 'Funded' && (p.opportunity_type?.includes('Paid') || p.opportunity_type?.includes('Funded'))) ||
      (activeTypeFilter === 'Credit' && p.opportunity_type?.includes('credit'));
    return matchDiscipline && matchKeyword && matchMode && matchType;
  });

  const modeEl = qs('opportunity-mode');
  if(modeEl) modeEl.textContent = isCuratedPreview ? 'Curated demonstration calls · Verified specifications' : 'Active verified research calls · Identity confirmed';
  
  const countEl = qs('opportunity-count');
  if(countEl) countEl.textContent = `${matches.length} ${isCuratedPreview ? 'illustrated calls' : 'published calls'}`;

  const grid = qs('opportunity-grid');
  if(!grid) return;

  grid.innerHTML = matches.map((p, i) => `
    <article class="opportunity-card" data-opp-id="${esc(p.id)}">
      <div class="opp-top">
        <span>${esc(p.discipline)}</span>
        <span class="opp-status">${isCuratedPreview ? 'CURATED DEMO' : 'ACTIVE · ACCEPTING'}</span>
      </div>
      <div class="opp-number">PROJECT / ${String(i + 1).padStart(2, '0')}</div>
      <h3>${esc(p.project_title || 'Research Collaboration')}</h3>
      <div class="opp-affiliation">${esc(p.institution)}</div>
      <p>${esc(p.project_summary)}</p>
      
      <div class="opp-tags">
        <span>📍 ${esc(p.work_mode || 'Mode TBD')}</span>
        <span>⏱ ${esc(p.weekly_hours || 'Hours TBD')}</span>
        <span>💼 ${esc(p.opportunity_type)}</span>
      </div>

      ${p.compensation_detail ? `<div class="opp-compensation"><strong>Funding details:</strong> ${esc(p.compensation_detail)}</div>` : ''}
      
      <div class="opp-skills">
        <small>PREREQUISITE METHODS</small>
        <strong>${esc(p.required_skills)}</strong>
      </div>
      
      <div class="opp-footer">
        <button type="button" class="opp-details-btn" data-view-opp="${esc(p.id)}">View full brief ↗</button>
        <button type="button" class="opp-interest" data-interest="${esc(p.id)}">Express interest ↗</button>
      </div>
    </article>
  `).join('') || `
    <div class="opportunity-empty">
      <h3>No matching research calls</h3>
      <p>Try clearing your keyword filters, or invite a research lab in this discipline to post a project brief.</p>
      <button type="button" class="btn btn-dark" data-open="researcher" id="new-brief">Submit a research brief ↗</button>
    </div>
  `;

  grid.querySelectorAll('[data-interest]').forEach(b => b.addEventListener('click', () => window.openMatchModal?.('interest', b.dataset.interest)));
  grid.querySelectorAll('[data-view-opp]').forEach(b => b.addEventListener('click', () => openOpportunityDetail(b.dataset.viewOpp)));
  qs('new-brief')?.addEventListener('click', () => window.openMatchModal?.('researcher'));
}

function openOpportunityDetail(oppId) {
  const source = projectsLoaded && publishedProjects.length ? publishedProjects : SAMPLE_PROJECTS;
  const opp = source.find(x => x.id === oppId);
  if(!opp) return;

  const titleEl = qs('detail-title');
  const eyebrowEl = qs('detail-eyebrow');
  const bodyEl = qs('detail-body');
  const actionsEl = qs('detail-actions');

  if(eyebrowEl) eyebrowEl.textContent = 'RESEARCH PROJECT SPECIFICATION';
  if(titleEl) titleEl.textContent = opp.project_title;

  if(bodyEl) {
    bodyEl.innerHTML = `
      <div class="detail-meta-grid">
        <div class="detail-meta-item">
          <span class="detail-label">DISCIPLINE</span>
          <strong>${esc(opp.discipline)}</strong>
        </div>
        <div class="detail-meta-item">
          <span class="detail-label">INSTITUTION / LAB</span>
          <strong>${esc(opp.institution)}</strong>
        </div>
        <div class="detail-meta-item">
          <span class="detail-label">WORK MODE &amp; HOURS</span>
          <strong>${esc(opp.work_mode)} · ${esc(opp.weekly_hours)}</strong>
        </div>
        <div class="detail-meta-item">
          <span class="detail-label">ARRANGEMENT</span>
          <strong>${esc(opp.opportunity_type)}</strong>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="detail-heading">Research Scope &amp; Project Summary</h4>
        <p class="detail-text">${esc(opp.project_summary)}</p>
      </div>

      <div class="detail-section">
        <h4 class="detail-heading">Required Skills, Tools &amp; Methods</h4>
        <div class="skill-tags">
          ${String(opp.required_skills || '').split(/[,;]+/).map(s => s.trim()).filter(Boolean).map(s => `<span>${esc(s)}</span>`).join('')}
        </div>
      </div>

      <div class="detail-section">
        <h4 class="detail-heading">Mentorship, Supervision &amp; Cadence</h4>
        <p class="detail-text">${esc(opp.mentor_support || 'Supervision details provided upon direct introduction.')}</p>
      </div>

      ${opp.eligibility ? `
        <div class="detail-section">
          <h4 class="detail-heading">Eligibility &amp; Prerequisites</h4>
          <p class="detail-text">${esc(opp.eligibility)}</p>
        </div>
      ` : ''}

      ${opp.compensation_detail ? `
        <div class="detail-section detail-evidence-card">
          <h4 class="detail-heading">Funding &amp; Compensation</h4>
          <p class="detail-text">${esc(opp.compensation_detail)}</p>
        </div>
      ` : ''}

      ${opp.deadline ? `
        <div class="detail-section">
          <small class="detail-label">APPLICATION DEADLINE: <strong>${esc(opp.deadline)}</strong></small>
        </div>
      ` : ''}
    `;
  }

  if(actionsEl) {
    actionsEl.innerHTML = `
      <button type="button" class="btn btn-lime" id="detail-apply-btn">Express Interest in this Project ↗</button>
      <button type="button" class="btn btn-outline-dark" id="detail-close-btn2">Close</button>
    `;

    qs('detail-apply-btn')?.addEventListener('click', () => {
      window.closeDetailModal?.();
      window.openMatchModal?.('interest', opp.id);
    });
    qs('detail-close-btn2')?.addEventListener('click', () => window.closeDetailModal?.());
  }

  const backdrop = qs('detail-backdrop');
  if(backdrop) {
    backdrop.hidden = false;
    document.body.classList.add('modal-open');
  }
}
window.openOpportunityDetail = openOpportunityDetail;

async function loadProjects() {
  try {
    const r = await fetch('/api/opportunities', { headers: { Accept: 'application/json' } });
    if(!r.ok) throw new Error('No live board');
    const j = await r.json();
    if(Array.isArray(j.opportunities) && j.opportunities.length) {
      publishedProjects = j.opportunities;
      projectsLoaded = true;
    }
  } catch(err) {
    console.log('Using curated preview opportunities.');
  }
  board();
}

function cleanLine(v) {
  return String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim();
}

/* 30-Day Collaboration Charter Generator */
function updateCharterFromForm() {
  const form = qs('charter-form');
  if(!form) return;
  const d = Object.fromEntries(new FormData(form));

  const topic = cleanLine(d.topic) || 'Open STEM Research Question';
  const arrangement = cleanLine(d.arrangement) || 'Discuss and agree together';
  const hours = cleanLine(d.hours) || '8–10 hours/week';
  const cadence = cleanLine(d.cadence) || 'Weekly 1-on-1 check-in';
  const channel = cleanLine(d.channel) || 'Dedicated Discord / Slack + weekly video meeting';
  const deliverable = cleanLine(d.deliverable) || 'Reproducible baseline experiment and research log';
  const notes = cleanLine(d.notes) || 'Confirm training, compute access, data safety, and authorship criteria before commencing experiments.';

  charterText = `OPENSTEM MATCH — FIRST 30-DAY COLLABORATION CHARTER
Draft for discussion; not an institutional contract.

RESEARCH FOCUS: ${topic}
ARRANGEMENT: ${arrangement}
TIME COMMITMENT: ${hours} (maintain scheduling transparency)
CHECK-IN CADENCE: ${cadence}
COMMUNICATION CHANNELS: ${channel}
FIRST TARGET DELIVERABLE: ${deliverable}

WEEK 1 · SCOPE, ETHICS & SAFETY
Discuss the research question, learning goals, supervisor availability, lab safety protocols, data access credentials, and what success looks like. Confirm compensation, supervision, and necessary institutional approvals.

WEEK 2 · FIRST REPRODUCIBLE RESULT
Develop a reproducible baseline, annotated literature review, or initial computational experiment. Maintain an active research log and flag roadblocks early.

WEEK 3 · FEEDBACK & METHODOLOGICAL REVIEW
Inspect methods, numerical stability, code cleanliness, and data quality. Clarify ownership, authorship criteria, and roadmap decisions for next steps.

WEEK 4 · DELIVERABLE EVALUATION & NEXT STAGE
Review the agreed deliverable, assess progress and student learning, review the commitment arrangement, and mutually agree whether to continue into a formal project.

ADDITIONAL SAFEGUARDS & AGREEMENTS
${notes}

MUTUAL COMMITMENTS
• Supervisor: Provide clear technical guidance, constructive feedback, escalation pathways, and appropriate safety oversight.
• Student: Document experiments rigorously, acknowledge limitations, respect confidentiality, and communicate early when blocked.
• Both: Refine this living charter collaboratively as research evolves.`;

  charterMarkdown = `# OpenSTEM Match — First 30-Day Collaboration Charter
*Draft for discussion; not a legal or institutional contract.*

## Overview
- **Research Focus:** ${topic}
- **Arrangement:** ${arrangement}
- **Time Commitment:** ${hours}
- **Check-in Cadence:** ${cadence}
- **Communication:** ${channel}
- **First Deliverable:** ${deliverable}

---

## Weekly Milestones

### Week 1 · Scope, Ethics & Safety
Align on the exact research question, learning goals, safety approvals, compute credentials, and definitions of success.

### Week 2 · First Working Result
Build a reproducible baseline, literature review, or initial simulation notebook. Keep a daily lab log.

### Week 3 · Feedback & Methodological Review
Review experimental data, code quality, and numerical convergence. Clarify authorship expectations and conference targets.

### Week 4 · Deliverable Evaluation & Next Steps
Demo the first deliverable, review learning outcomes, and decide together on subsequent phases.

---

## Safeguards & Notes
${notes}
`;

  const out = qs('charter-output');
  if(out) {
    out.textContent = charterText;
    out.classList.add('charter-ready');
  }

  if(qs('copy-charter')) qs('copy-charter').disabled = false;
  if(qs('download-charter')) qs('download-charter').disabled = false;
  if(qs('download-charter-md')) qs('download-charter-md').disabled = false;
}

const CHARTER_PRESETS = {
  ml: {
    topic: 'Benchmark Physics-Informed Neural Networks on Fluid Equations',
    arrangement: 'Paid / funded research role',
    hours: '8–10 hours/week',
    cadence: 'Weekly 1-on-1 check-in',
    channel: 'Dedicated Discord + weekly Zoom meeting',
    deliverable: 'Clean GitHub repo reproducing 1D baseline with conservation loss verification',
    notes: 'Lab provides cloud GPU instance (A100). Co-authorship offered if benchmarks are accepted into workshop.'
  },
  lab: {
    topic: 'Sample Characterization and Spectroscopic Data Analysis',
    arrangement: 'Academic credit / internship',
    hours: '12–15 hours/week',
    cadence: 'Twice-weekly check-in',
    channel: 'University email + in-person lab meetings',
    deliverable: 'Standardized preprocessing pipeline and peak analysis report',
    notes: 'Lab safety training must be completed prior to on-site access. All raw spectra stored in institutional drive.'
  },
  baseline: {
    topic: 'Literature Replication of Open Quantum Spin Dynamics',
    arrangement: 'Discuss and agree together',
    hours: '6–8 hours/week',
    cadence: 'Weekly 1-on-1 check-in',
    channel: 'Discord channel + async GitHub issues',
    deliverable: 'Annotated Jupyter notebook replicating published Fig. 2 with error margins',
    notes: 'Student works with open Python tools (QuTiP/Qiskit). Supervisor provides weekly async code reviews.'
  }
};

function applyCharterPreset(presetKey) {
  const preset = CHARTER_PRESETS[presetKey];
  if(!preset) return;

  const form = qs('charter-form');
  if(!form) return;

  if(form.elements['topic']) form.elements['topic'].value = preset.topic;
  if(form.elements['arrangement']) form.elements['arrangement'].value = preset.arrangement;
  if(form.elements['hours']) form.elements['hours'].value = preset.hours;
  if(form.elements['cadence']) form.elements['cadence'].value = preset.cadence;
  if(form.elements['channel']) form.elements['channel'].value = preset.channel;
  if(form.elements['deliverable']) form.elements['deliverable'].value = preset.deliverable;
  if(form.elements['notes']) form.elements['notes'].value = preset.notes;

  document.querySelectorAll('.preset-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.preset === presetKey);
  });

  updateCharterFromForm();
  window.showToast?.(`Loaded "${presetKey.toUpperCase()}" charter preset`);
}

async function copyPlain(t, btn, label = 'Copied ✓') {
  try {
    await navigator.clipboard.writeText(t);
    const orig = btn.textContent;
    btn.textContent = label;
    window.showToast?.('Copied to clipboard!');
    setTimeout(() => { btn.textContent = orig; }, 2000);
  } catch {
    btn.textContent = 'Copy unavailable';
  }
}

const INVITES = {
  student: `I found OpenSTEM Match — an open initiative connecting STEM students with verified research labs through portfolio evidence and shared mentorship charters. It is completely free to explore: ${location.origin}/#discover`,
  researcher: `I wanted to share OpenSTEM Match, a research placement initiative for academic labs and PIs. If your group has a well-scoped project, you can post a transparent brief stating required tools and mentoring cadence: ${location.origin}/#opportunities`
};

/* Research Readiness Checklist with LocalStorage Persistence */
const CHECKLIST_STORAGE_KEY = 'openstem_readiness_checklist';

function loadReadinessState() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if(!raw) return;
    const checkedIds = JSON.parse(raw);
    if(Array.isArray(checkedIds)) {
      document.querySelectorAll('[data-ready]').forEach(el => {
        el.checked = checkedIds.includes(el.dataset.ready);
      });
    }
  } catch(e) {}
}

function saveReadinessState() {
  const checkedIds = [...document.querySelectorAll('[data-ready]:checked')].map(x => x.dataset.ready);
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIds));
  } catch(e) {}
}

function updateReadiness() {
  const inputs = [...document.querySelectorAll('[data-ready]')];
  if(!inputs.length) return;
  const checked = inputs.filter(x => x.checked).length;
  
  const bar = qs('readiness-progress-bar');
  if(bar) bar.style.width = `${(checked / inputs.length) * 100}%`;
  
  const label = qs('readiness-progress-label');
  if(label) {
    if(checked === inputs.length) {
      label.innerHTML = `<strong>4 of 4 evidence steps complete</strong> — Ready to prepare your student profile! 🚀`;
      label.classList.add('ready-celebrate');
    } else {
      label.textContent = `${checked} of ${inputs.length} evidence steps complete — ${checked > 0 ? 'in progress' : 'personal checklist only'}`;
      label.classList.remove('ready-celebrate');
    }
  }
}

function initMatchLab() {
  qs('opportunity-search')?.addEventListener('input', board);
  qs('opportunity-discipline')?.addEventListener('change', board);

  // Quick filter pills for mode & type
  qs('opp-mode-filters')?.querySelectorAll('.quick-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      qs('opp-mode-filters')?.querySelectorAll('.quick-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeModeFilter = btn.dataset.mode;
      board();
    });
  });

  qs('opp-type-filters')?.querySelectorAll('.quick-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      qs('opp-type-filters')?.querySelectorAll('.quick-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTypeFilter = btn.dataset.type;
      board();
    });
  });

  loadProjects();

  // Charter live updates & presets
  document.querySelectorAll('.preset-pill').forEach(b => {
    b.addEventListener('click', () => applyCharterPreset(b.dataset.preset));
  });

  const form = qs('charter-form');
  if(form) {
    form.addEventListener('input', updateCharterFromForm);
    form.addEventListener('submit', e => {
      e.preventDefault();
      updateCharterFromForm();
      window.showToast?.('Charter updated!');
    });
  }

  qs('reset-charter')?.addEventListener('click', () => {
    applyCharterPreset('ml');
  });

  qs('copy-charter')?.addEventListener('click', e => {
    if(charterText) copyPlain(charterText, e.currentTarget);
  });

  qs('download-charter')?.addEventListener('click', () => {
    if(!charterText) return;
    const blob = new Blob([charterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openstem-match-collaboration-charter.txt';
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    window.showToast?.('Downloaded collaboration charter (.txt)');
  });

  qs('download-charter-md')?.addEventListener('click', () => {
    if(!charterMarkdown) return;
    const blob = new Blob([charterMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openstem-match-collaboration-charter.md';
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    window.showToast?.('Downloaded collaboration charter (.md)');
  });

  // Readiness checklist
  loadReadinessState();
  updateReadiness();
  document.querySelectorAll('[data-ready]').forEach(el => {
    el.addEventListener('change', () => {
      saveReadinessState();
      updateReadiness();
    });
  });

  // Invitations
  document.querySelectorAll('[data-share]').forEach(el => {
    el.addEventListener('click', () => copyPlain(INVITES[el.dataset.share], el, 'Copied link ✓'));
  });

  // Initial charter render
  updateCharterFromForm();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMatchLab);
else initMatchLab();
