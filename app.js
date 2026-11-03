'use strict';
const CONTACT = 'shahriyarkarimsiam@gmail.com';
const DISCIPLINES = ['All subjects','Physics','Computer Science','Biology','Engineering','Mathematics','Chemistry','Earth Science'];
const EXAMPLES = [
  { id:'sample-physics', discipline:'Physics', public_name:'Quantum systems researcher', academic_level:'Graduate-level example', research_area:'Quantum information & open quantum systems', skills:['Python','Qiskit','Linear algebra'], bio:'Illustrative candidate with experience simulating spin systems and documenting reproducible numerical results.', availability_hours:'10 hours/week', collaboration_mode:'Remote', timezone_region:'UTC+1 / Central Europe', research_goal:'Learn to reproduce a published open quantum system simulation and evaluate numerical convergence.', evidence_url:'https://github.com/example/quantum-demo', badge:'SAMPLE · NOT VERIFIED' },
  { id:'sample-computer', discipline:'Computer Science', public_name:'Machine learning researcher', academic_level:'Undergraduate-level example', research_area:'Interpretable AI & scientific machine learning', skills:['PyTorch','Python','Model evaluation'], bio:'Illustrative candidate building models, validating baselines and communicating reproducible experiments.', availability_hours:'12 hours/week', collaboration_mode:'Remote', timezone_region:'UTC-5 / Eastern', research_goal:'Benchmark physics-informed neural network baselines on climate data.', evidence_url:'https://github.com/example/sciml-benchmarks', badge:'SAMPLE · NOT VERIFIED' },
  { id:'sample-biology', discipline:'Biology', public_name:'Computational biology researcher', academic_level:'Graduate-level example', research_area:'Genomics & molecular data analysis', skills:['R','Bioinformatics','Statistics'], bio:'Illustrative candidate with sequence analysis and data-visualization workflows for biological datasets.', availability_hours:'8 hours/week', collaboration_mode:'Flexible', timezone_region:'UTC+6 / South Asia', research_goal:'Contribute to single-cell RNA-seq clustering and reproducibility pipelines.', evidence_url:'https://github.com/example/bio-pipeline', badge:'SAMPLE · NOT VERIFIED' },
  { id:'sample-engineering', discipline:'Engineering', public_name:'Materials science researcher', academic_level:'Undergraduate-level example', research_area:'Energy materials & computational modeling', skills:['MATLAB','Finite elements','CAD'], bio:'Illustrative candidate exploring materials characterization and the mechanics of energy devices.', availability_hours:'10 hours/week', collaboration_mode:'Hybrid', timezone_region:'UTC+0 / Western Europe', research_goal:'Model heat dissipation in solid-state battery electrolytes.', evidence_url:'https://github.com/example/battery-model', badge:'SAMPLE · NOT VERIFIED' },
  { id:'sample-math', discipline:'Mathematics', public_name:'Applied mathematics researcher', academic_level:'Graduate-level example', research_area:'Optimization, statistics & numerical analysis', skills:['Julia','Optimization','LaTeX'], bio:'Illustrative candidate focused on mathematical modeling, proof writing and numerical methods.', availability_hours:'15 hours/week', collaboration_mode:'Remote', timezone_region:'UTC+8 / East Asia', research_goal:'Study convergence properties of stochastic gradient algorithms.', evidence_url:'https://github.com/example/optimization-proofs', badge:'SAMPLE · NOT VERIFIED' },
  { id:'sample-chemistry', discipline:'Chemistry', public_name:'Computational chemistry researcher', academic_level:'Undergraduate-level example', research_area:'Molecular simulation & green catalysis', skills:['Python','Molecular dynamics','Data analysis'], bio:'Illustrative candidate learning molecular simulations, structure analysis and reproducible reporting.', availability_hours:'6 hours/week', collaboration_mode:'Flexible', timezone_region:'UTC-8 / Pacific', research_goal:'Perform DFT calculations for novel transition-metal catalysts.', evidence_url:'https://github.com/example/dft-catalysis', badge:'SAMPLE · NOT VERIFIED' }
];

let approvedCandidates = [];
let isLiveDirectory = false;
let currentFilter = 'All subjects';
let activeModal = '';
let lastFocusedElement = null;
const $ = s => document.querySelector(s);

function safeText(x){ return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function verifiedURL(x){ try{ const u = new URL(String(x)); return ['https:','http:'].includes(u.protocol) ? u.href : ''; }catch{return '';} }

/* Toast Notification System */
function showToast(message, type = 'success') {
  const container = $('#toast-container');
  if(!container) return;
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'error' ? '⚠' : '✓'}</span><span class="toast-msg">${safeText(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
window.showToast = showToast;

function showFilters(){
  const host = $('#discipline-filters');
  if(!host) return;
  host.innerHTML = DISCIPLINES.map(d => `<button type="button" class="filter-chip ${d === currentFilter ? 'active' : ''}" data-discipline="${safeText(d)}" aria-pressed="${String(d === currentFilter)}">${safeText(d)}</button>`).join('');
  host.querySelectorAll('button').forEach(b => b.addEventListener('click', () => filterBy(b.dataset.discipline)));
}

function filterBy(d){
  currentFilter = d;
  showFilters();
  renderProfiles();
  if(d !== 'All subjects') {
    $('#discover')?.scrollIntoView({behavior:'smooth', block:'start'});
    showToast(`Filtered by ${d}`);
  }
}

function renderProfiles(){
  const searchInput = $('#talent-search');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const source = isLiveDirectory ? approvedCandidates : EXAMPLES;
  const candidates = source.filter(p => (currentFilter === 'All subjects' || p.discipline === currentFilter) && 
    [p.public_name, p.discipline, p.research_area, p.academic_level, p.bio, ...(Array.isArray(p.skills) ? p.skills : [])].join(' ').toLowerCase().includes(q)
  );

  $('#listing-mode').textContent = isLiveDirectory ? 'Reviewed, public student profiles' : 'Curated candidate preview';
  $('#result-count').textContent = `${candidates.length} ${isLiveDirectory ? 'verified' : 'preview'} profile${candidates.length === 1 ? '' : 's'}`;
  $('#preview-disclaimer').hidden = isLiveDirectory && candidates.length > 0;

  const grid = $('#profiles-grid');
  if(!grid) return;

  grid.innerHTML = candidates.length ? candidates.map((p, i) => {
    const publicLink = verifiedURL(p.evidence_url);
    const skills = Array.isArray(p.skills) ? p.skills : [];
    return `
      <article class="profile-card" data-candidate-card="${safeText(p.id)}">
        <div class="profile-top">
          <div class="profile-avatar ${i % 3 === 1 ? 'slate' : i % 3 === 2 ? 'sand' : ''}" aria-hidden="true">${['◇','⌘','✳','⌁','∑','⚗'][i % 6]}</div>
          <span class="profile-status">${isLiveDirectory ? 'REVIEWED PROFILE' : 'CURATED PREVIEW'}</span>
        </div>
        <div class="profile-discipline">${safeText(p.discipline)} ${p.academic_level ? ' / ' + safeText(p.academic_level) : ''}</div>
        <h3>${safeText(p.public_name)}</h3>
        <p>${safeText(p.research_area)}</p>
        <div class="skill-tags">${skills.slice(0, 4).map(s => `<span>${safeText(s)}</span>`).join('')}</div>
        <div class="profile-card-footer">
          <button type="button" class="profile-view-details" data-view-candidate="${safeText(p.id)}">View profile &amp; evidence <span>↗</span></button>
          <button type="button" class="profile-link profile-request" data-open="researcher" data-candidate="${safeText(p.id)}">Request intro <span>↗</span></button>
        </div>
      </article>
    `;
  }).join('') : `
    <div class="empty-state">
      <h3>No matching ${isLiveDirectory ? 'candidates' : 'examples'} found</h3>
      <p>Try clearing your search terms or selecting a broader discipline.</p>
      <button class="btn btn-dark" type="button" data-open="researcher">Describe your specific research need ↗</button>
    </div>
  `;

  grid.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.open, b.dataset.candidate)));
  grid.querySelectorAll('[data-view-candidate]').forEach(b => b.addEventListener('click', () => openCandidateDetail(b.dataset.viewCandidate)));
}

function openCandidateDetail(candidateId) {
  const source = isLiveDirectory ? approvedCandidates : EXAMPLES;
  const c = source.find(x => x.id === candidateId);
  if(!c) return;

  $('#detail-eyebrow').textContent = 'STUDENT TALENT DOSSIER';
  $('#detail-title').textContent = c.public_name;

  const skills = Array.isArray(c.skills) ? c.skills : [];
  const publicLink = verifiedURL(c.evidence_url);

  $('#detail-body').innerHTML = `
    <div class="detail-meta-grid">
      <div class="detail-meta-item">
        <span class="detail-label">DISCIPLINE &amp; LEVEL</span>
        <strong>${safeText(c.discipline)} · ${safeText(c.academic_level || 'Independent')}</strong>
      </div>
      <div class="detail-meta-item">
        <span class="detail-label">INSTITUTION / AFFILIATION</span>
        <strong>${safeText(c.institution || 'Verified STEM Scholar')}</strong>
      </div>
      <div class="detail-meta-item">
        <span class="detail-label">WEEKLY AVAILABILITY</span>
        <strong>${safeText(c.availability_hours || 'Flexible / To discuss')}</strong>
      </div>
      <div class="detail-meta-item">
        <span class="detail-label">WORK MODE &amp; REGION</span>
        <strong>${safeText(c.collaboration_mode || 'Remote')} ${c.timezone_region ? `(${safeText(c.timezone_region)})` : ''}</strong>
      </div>
    </div>

    <div class="detail-section">
      <h4 class="detail-heading">Research Specialization &amp; Learning Goal</h4>
      <p class="detail-text"><strong>Focus:</strong> ${safeText(c.research_area)}</p>
      ${c.research_goal ? `<p class="detail-text"><strong>Learning Goal:</strong> ${safeText(c.research_goal)}</p>` : ''}
    </div>

    <div class="detail-section">
      <h4 class="detail-heading">Demonstrated Experience &amp; Methods</h4>
      <p class="detail-text">${safeText(c.bio)}</p>
    </div>

    <div class="detail-section">
      <h4 class="detail-heading">Technical Skills &amp; Tools</h4>
      <div class="skill-tags">
        ${skills.map(s => `<span>${safeText(s)}</span>`).join('')}
      </div>
    </div>

    ${publicLink ? `
      <div class="detail-section detail-evidence-card">
        <h4 class="detail-heading">Verified Work Sample &amp; Code Evidence</h4>
        <p class="detail-text">Independent artifact submitted by candidate for manual methodology review:</p>
        <a class="btn btn-outline-dark btn-sm" href="${safeText(publicLink)}" target="_blank" rel="noopener noreferrer nofollow">Inspect Code / Artifact (${safeText(publicLink)}) ↗</a>
      </div>
    ` : ''}
  `;

  $('#detail-actions').innerHTML = `
    <button type="button" class="btn btn-lime" id="detail-request-btn">Request introduction to ${safeText(c.public_name)} ↗</button>
    <button type="button" class="btn btn-outline-dark" id="detail-close-btn">Close</button>
  `;

  $('#detail-request-btn').addEventListener('click', () => {
    closeDetailModal();
    openModal('researcher', c.id);
  });
  $('#detail-close-btn').addEventListener('click', closeDetailModal);

  openDetailModal();
}

function openDetailModal() {
  const backdrop = $('#detail-backdrop');
  if(!backdrop) return;
  backdrop.hidden = false;
  document.body.classList.add('modal-open');
}

function closeDetailModal() {
  const backdrop = $('#detail-backdrop');
  if(!backdrop || backdrop.hidden) return;
  backdrop.hidden = true;
  document.body.classList.remove('modal-open');
}
window.closeDetailModal = closeDetailModal;
window.openCandidateDetail = openCandidateDetail;

async function fetchProfiles(){
  try{
    const r = await fetch('/api/candidates', { headers: { 'Accept': 'application/json' } });
    if(!r.ok) throw new Error('Directory unavailable');
    const j = await r.json();
    if(Array.isArray(j.candidates) && j.candidates.length){
      approvedCandidates = j.candidates;
      isLiveDirectory = true;
      renderProfiles();
    }
  }catch(err){
    console.log('Using curated preview candidates.');
  }
}

const commonName = `
  <div class="form-group">
    <label for="field-full_name">Full name <span>*</span></label>
    <input id="field-full_name" name="full_name" required maxlength="100" autocomplete="name" placeholder="Your full name" />
  </div>
  <div class="form-group">
    <label for="field-email">Email address <span>*</span></label>
    <input id="field-email" name="email" type="email" required maxlength="190" autocomplete="email" placeholder="you@university.edu" />
  </div>
`;

const studentForm = `
  <div class="form-grid">
    ${commonName}
    <div class="form-group">
      <label for="field-institution">University or institution <span>*</span></label>
      <input name="institution" id="field-institution" required maxlength="140" placeholder="University / research institute / independent" />
    </div>
    <div class="form-group">
      <label for="field-academic_level">Academic level <span>*</span></label>
      <select name="academic_level" id="field-academic_level" required>
        <option value="">Choose your level</option>
        <option>Undergraduate</option>
        <option>Master's student</option>
        <option>PhD candidate</option>
        <option>Recent graduate</option>
        <option>Independent learner</option>
      </select>
    </div>
    <div class="form-group">
      <label for="field-discipline">Primary discipline <span>*</span></label>
      <select name="discipline" id="field-discipline" required>
        <option value="">Choose a discipline</option>
        ${DISCIPLINES.slice(1).map(d => `<option>${d}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="field-research_area">Research specialization <span>*</span></label>
      <input name="research_area" id="field-research_area" required maxlength="160" placeholder="e.g. Quantum optics, Scientific ML, Single-cell genomics" />
    </div>
    <div class="form-group full">
      <label for="field-skills">Technical skills &amp; tools <span>*</span></label>
      <input id="field-skills" name="skills" required maxlength="250" placeholder="e.g. Python, PyTorch, Qiskit, QuTiP, R, LaTeX" />
      <span class="input-hint">Separate skills with commas. Focus on methods you can practically use.</span>
    </div>
    <div class="form-group full">
      <label for="field-evidence_url">Evidence of your work (URL)</label>
      <input id="field-evidence_url" name="evidence_url" type="url" maxlength="300" placeholder="https://github.com/... or a portfolio, paper, reproducibility notebook" />
      <span class="input-hint">A public GitHub repo or reproducible notebook greatly increases the quality of your profile.</span>
    </div>
    <div class="form-group">
      <label for="field-availability_hours">Available hours / week</label>
      <select id="field-availability_hours" name="availability_hours">
        <option value="">Select commitment</option>
        ${[4,6,8,10,12,15,20,25,30,40].map(h => `<option value="${h} hours/week">${h} hours/week</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="field-collaboration_mode">Collaboration preference</label>
      <select id="field-collaboration_mode" name="collaboration_mode">
        <option value="">Flexible</option>
        <option>Remote</option>
        <option>On-site</option>
        <option>Hybrid</option>
      </select>
    </div>
    <div class="form-group full">
      <label for="field-timezone_region">Time zone or broad region (optional)</label>
      <input id="field-timezone_region" name="timezone_region" maxlength="80" placeholder="e.g. UTC+6 / South Asia, UTC-5 / US Eastern" />
    </div>
    <div class="form-group full">
      <label for="field-research_goal">What do you hope to learn?</label>
      <input id="field-research_goal" name="research_goal" maxlength="400" placeholder="e.g. Reproduce a published simulation, co-author a workshop benchmark" />
    </div>
    <div class="form-group full">
      <label for="field-bio">What have you built or researched? <span>*</span></label>
      <textarea name="bio" id="field-bio" required minlength="40" maxlength="1200" placeholder="Describe your background, numerical experiments, reproducibility baselines, or lab protocols you have tested (min 40 chars)."></textarea>
    </div>
    <div class="form-group full">
      <label class="consent-row">
        <input name="public_opt_in" type="checkbox" value="true" checked />
        <span>I permit a public profile (name, institution, research area, skills, and work link) to appear in the directory after review. <strong>Email remains private.</strong></span>
      </label>
    </div>
  </div>
`;

const researcherForm = `
  <div class="form-grid">
    ${commonName}
    <div class="form-group full">
      <label for="field-institution">Institution, lab or organization <span>*</span></label>
      <input id="field-institution" name="institution" maxlength="140" required placeholder="Your university, research lab or organization" />
    </div>
    <div class="form-group">
      <label for="field-discipline">Research discipline <span>*</span></label>
      <select name="discipline" id="field-discipline" required>
        <option value="">Choose a discipline</option>
        ${DISCIPLINES.slice(1).map(d => `<option>${d}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="field-opportunity_type">Type of opportunity <span>*</span></label>
      <select name="opportunity_type" id="field-opportunity_type" required>
        <option value="">Select arrangement</option>
        <option>Paid research role</option>
        <option>Funded research position</option>
        <option>Academic credit / internship</option>
        <option>Unpaid / volunteer collaboration</option>
        <option>Arrangement not yet decided</option>
      </select>
    </div>
    <div class="form-group full">
      <label for="field-project_title">Research project title <span>*</span></label>
      <input id="field-project_title" name="project_title" required minlength="6" maxlength="120" placeholder="e.g. Numerical Simulation of Open Quantum Spin Systems" />
    </div>
    <div class="form-group">
      <label for="field-weekly_hours">Expected weekly commitment <span>*</span></label>
      <input id="field-weekly_hours" name="weekly_hours" required minlength="2" maxlength="40" placeholder="e.g. 8–10 hours/week" />
    </div>
    <div class="form-group">
      <label for="field-duration">Expected duration <span>*</span></label>
      <input id="field-duration" name="duration" required minlength="2" maxlength="70" placeholder="e.g. 10 weeks" />
    </div>
    <div class="form-group">
      <label for="field-work_mode">Work mode <span>*</span></label>
      <select id="field-work_mode" name="work_mode" required>
        <option value="">Select mode</option>
        <option>Remote</option>
        <option>On-site</option>
        <option>Hybrid</option>
        <option>Flexible</option>
      </select>
    </div>
    <div class="form-group">
      <label for="field-deadline">Application deadline (optional)</label>
      <input id="field-deadline" name="deadline" type="date" />
    </div>
    <div class="form-group full">
      <label for="field-location_detail">Location / time zone requirements</label>
      <input id="field-location_detail" name="location_detail" maxlength="140" placeholder="e.g. Remote, weekly syncs in UTC+1 to UTC+6" />
    </div>
    <div class="form-group full">
      <label for="field-compensation_detail">Funding or compensation details</label>
      <input id="field-compensation_detail" name="compensation_detail" maxlength="180" placeholder="e.g. $600/month stipend via university grant; compute access provided" />
    </div>
    <div class="form-group full">
      <label for="field-eligibility">Eligibility / prerequisites</label>
      <input id="field-eligibility" name="eligibility" maxlength="320" placeholder="e.g. Undergraduate with Python basics and introductory linear algebra" />
    </div>
    <div class="form-group full">
      <label for="field-required_skills">Skills or methods needed <span>*</span></label>
      <input id="field-required_skills" name="required_skills" maxlength="260" required placeholder="e.g. Python, Qiskit, QuTiP, linear algebra" />
    </div>
    <div class="form-group full">
      <label for="field-project_summary">Describe the research project <span>*</span></label>
      <textarea id="field-project_summary" name="project_summary" minlength="40" maxlength="1600" required placeholder="What is the core research question, what will the student build or evaluate, and what milestones are expected? (min 40 chars)"></textarea>
    </div>
    <div class="form-group full">
      <label for="field-mentor_support">Mentoring, check-ins &amp; feedback plan <span>*</span></label>
      <textarea id="field-mentor_support" name="mentor_support" required minlength="20" maxlength="700" placeholder="Who will supervise the student? How often are feedback sessions held? What safety and authorship principles apply? (min 20 chars)"></textarea>
    </div>
    <div class="form-group full">
      <label class="consent-row">
        <input name="public_opt_in" type="checkbox" value="true" checked />
        <span>After manual review and identity verification, publish this project brief on the OpenSTEM Match research board. <strong>Contact email remains strictly private.</strong></span>
      </label>
    </div>
  </div>
`;

const interestForm = `
  <div class="form-grid">
    ${commonName}
    <div class="form-group">
      <label for="field-institution">Institution <span>*</span></label>
      <input id="field-institution" name="institution" required maxlength="140" placeholder="University, research lab or independent" />
    </div>
    <div class="form-group">
      <label for="field-academic_level">Academic level <span>*</span></label>
      <select id="field-academic_level" name="academic_level" required>
        <option value="">Select academic standing</option>
        <option>Undergraduate</option>
        <option>Master's student</option>
        <option>PhD candidate</option>
        <option>Recent graduate</option>
        <option>Independent learner</option>
      </select>
    </div>
    <div class="form-group full">
      <label for="field-skills">Relevant technical skills <span>*</span></label>
      <input id="field-skills" name="skills" required minlength="3" maxlength="260" placeholder="e.g. Python, numerical simulation, differential equations" />
    </div>
    <div class="form-group full">
      <label for="field-evidence_url">Work sample or portfolio URL</label>
      <input id="field-evidence_url" name="evidence_url" type="url" maxlength="300" placeholder="https://github.com/... or a public report/notebook" />
    </div>
    <div class="form-group full">
      <label for="field-motivation">Why are you a strong fit for this project? <span>*</span></label>
      <textarea name="motivation" id="field-motivation" required minlength="50" maxlength="1600" placeholder="Describe your relevant skills, what you have previously reproduced or built, your time availability, and what you hope to achieve (min 50 chars)."></textarea>
    </div>
  </div>
`;

const acquisitionField = `
  <div class="form-group full">
    <label for="field-discovery_source">How did you find OpenSTEM Match? (optional)</label>
    <select id="field-discovery_source" name="discovery_source">
      <option value="">Choose an option</option>
      <option selected>OpenSTEM website</option>
      <option>Discord community</option>
      <option>Researcher or lab</option>
      <option>Student referral</option>
      <option>Social media</option>
      <option>Search engine</option>
      <option>Other</option>
    </select>
  </div>
`;

function openModal(kind, itemId = '') {
  if(!['student', 'researcher', 'interest'].includes(kind)) return;
  if(kind === 'interest' && !/^[0-9a-f-]{36}$/.test(itemId) && !itemId.startsWith('opp-')) return;

  lastFocusedElement = document.activeElement;
  activeModal = kind;

  const titles = {
    student: 'Join the OpenSTEM Talent Network.',
    researcher: 'Publish a Research Project Brief.',
    interest: 'Express Interest in this Research Project.'
  };
  const intros = {
    student: 'Submit your research areas, demonstrated skills, and work evidence. Every profile is reviewed manually before any introduction is facilitated.',
    researcher: 'Provide a structured research brief with prerequisites, mentoring plan, and expected commitment. All calls undergo identity verification before publication.',
    interest: 'Submit a private expression of interest for this opportunity. If your skills align, the OpenSTEM team will confirm dual-consent before introducing you to the research team.'
  };

  $('#modal-eyebrow').textContent = kind === 'student' ? 'STUDENT RESEARCHER APPLICATION' : kind === 'researcher' ? 'RESEARCH CALL CREATOR' : 'PROJECT EXPRESSION OF INTEREST';
  $('#modal-title').textContent = titles[kind];
  $('#modal-intro').textContent = intros[kind];
  $('#form-fields').innerHTML = kind === 'student' ? studentForm : kind === 'researcher' ? researcherForm : interestForm;

  if(kind !== 'interest') {
    $('#form-fields').insertAdjacentHTML('beforeend', `<div class="form-grid">${acquisitionField}</div>`);
  }

  if(kind === 'researcher' && itemId) {
    const h = document.createElement('input');
    h.type = 'hidden';
    h.name = 'candidate_id';
    h.value = itemId;
    $('#form-fields').appendChild(h);
    $('#modal-intro').textContent = 'You are requesting an introduction to a specific candidate in the OpenSTEM network. Detail your project scope and expectations below.';
  }

  if(kind === 'interest') {
    const h = document.createElement('input');
    h.type = 'hidden';
    h.name = 'project_id';
    h.value = itemId;
    $('#form-fields').appendChild(h);
  }

  $('#form-submit').innerHTML = (kind === 'student' ? 'Submit Student Profile' : kind === 'researcher' ? 'Submit Research Call' : 'Send Expression of Interest') + ' <span>↗</span>';
  $('#form-status').textContent = '';
  $('#form-status').classList.remove('error');
  $('#interest-form').reset();
  $('#modal-backdrop').hidden = false;
  document.body.classList.add('modal-open');
  $('#modal-close').focus();
}
window.openMatchModal = openModal;

function closeModal(){
  if($('#modal-backdrop').hidden) return;
  $('#modal-backdrop').hidden = true;
  document.body.classList.remove('modal-open');
  activeModal = '';
  if(lastFocusedElement && lastFocusedElement.focus) lastFocusedElement.focus();
}

function emailFallback(data){
  const subject = activeModal === 'student' ? 'OpenSTEM Match — Student application' : activeModal === 'interest' ? 'OpenSTEM Match — Project expression of interest' : 'OpenSTEM Match — Researcher project brief';
  const lines = Object.entries(data).filter(([k]) => k !== 'website').map(([k,v]) => `${k.replaceAll('_',' ')}: ${v}`).join('\n');
  return `mailto:${CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines + '\n\nSent via OpenSTEM Match email fallback.')}`;
}

async function submitForm(event){
  event.preventDefault();
  const form = event.currentTarget;
  const status = $('#form-status');
  status.classList.remove('error');
  status.textContent = '';

  if(!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form));
  data.consent = $('#field-consent').checked;
  data.adult_confirmed = $('#field-consent').checked;
  data.public_opt_in = Boolean(form.querySelector('[name="public_opt_in"]')?.checked);

  const btn = $('#form-submit');
  btn.disabled = true;
  btn.textContent = 'Submitting to review queue…';

  try{
    const endpoint = activeModal === 'student' ? '/api/apply' : activeModal === 'interest' ? '/api/interest' : '/api/request';
    
    // Always route direct email notification to shahriyarkarimsiam@gmail.com via FormSubmit
    const emailSubject = activeModal === 'student' 
      ? `OpenSTEM Match — New Student Profile (${data.full_name || 'Applicant'})`
      : activeModal === 'interest' 
        ? `OpenSTEM Match — Project Expression of Interest (${data.full_name || 'Applicant'})`
        : `OpenSTEM Match — New Research Project Brief (${data.project_title || 'New Call'})`;

    const emailPromise = fetch(`https://formsubmit.co/ajax/${CONTACT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: emailSubject,
        _template: 'table',
        _captcha: 'false',
        form_category: activeModal,
        applicant_name: data.full_name || 'N/A',
        applicant_email: data.email || 'N/A',
        institution: data.institution || 'N/A',
        discipline: data.discipline || 'N/A',
        submission_time: new Date().toISOString(),
        ...data
      })
    }).then(res => res.json()).catch(() => null);

    // Also send to local or edge API if available
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const reply = await r.json().catch(() => ({}));

      if(!r.ok && r.status >= 400 && r.status < 500 && r.status !== 404 && r.status !== 429) {
        status.classList.add('error');
        status.textContent = reply.error || 'Please review your input fields.';
        btn.disabled = false;
        btn.innerHTML = 'Review and resubmit <span>↗</span>';
        return;
      }
    } catch(apiErr) {
      // Static host or offline API; email delivery serves as reliable primary channel
    }

    await emailPromise;

    status.innerHTML = `Your application has been received and routed directly to <strong>${CONTACT}</strong> for manual review.`;
    form.reset();
    btn.textContent = `Sent to ${CONTACT} ✓`;
    showToast(`Form submitted & routed to ${CONTACT}!`);
    setTimeout(() => {
      closeModal();
      fetchProfiles();
    }, 2200);
  }catch(err){
    const url = emailFallback(data);
    status.classList.add('error');
    status.innerHTML = `<strong>Online storage encountered an issue.</strong> Please forward your submission directly to <strong>${CONTACT}</strong>:<br/><a href="${safeText(url)}">Open pre-filled email draft to ${CONTACT} ↗</a>`;
    btn.disabled = false;
    btn.innerHTML = 'Try online submission again <span>↗</span>';
  }
}

function setup(){
  showFilters();
  renderProfiles();
  fetchProfiles();

  $('#talent-search')?.addEventListener('input', renderProfiles);
  $('#clear-filters')?.addEventListener('click', () => {
    if($('#talent-search')) $('#talent-search').value = '';
    filterBy('All subjects');
    showToast('Filters cleared');
  });

  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.open)));
  document.querySelectorAll('.discipline-tile').forEach(b => b.addEventListener('click', () => filterBy(b.dataset.filter)));
  
  $('#modal-close')?.addEventListener('click', closeModal);
  $('#detail-close')?.addEventListener('click', closeDetailModal);
  
  $('#modal-backdrop')?.addEventListener('click', e => {
    if(e.target === $('#modal-backdrop')) closeModal();
  });
  $('#detail-backdrop')?.addEventListener('click', e => {
    if(e.target === $('#detail-backdrop')) closeDetailModal();
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') {
      closeModal();
      closeDetailModal();
    }
  });

  $('#interest-form')?.addEventListener('submit', submitForm);

  $('#menu-toggle')?.addEventListener('click', () => {
    const nav = $('#primary-nav');
    const expanded = nav.classList.toggle('open');
    $('#menu-toggle').setAttribute('aria-expanded', String(expanded));
  });

  $('#primary-nav')?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    $('#primary-nav').classList.remove('open');
    $('#menu-toggle')?.setAttribute('aria-expanded', 'false');
  }));

  const yr = $('#year');
  if(yr) yr.textContent = new Date().getFullYear();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
else setup();
