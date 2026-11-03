'use strict';
let token = sessionStorage.getItem('openstem_admin_token') || '';
let all = { candidates: [], research_requests: [], project_interests: [] };
let tab = 'candidates';
let statusFilter = 'all';
let searchQuery = '';

const s = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const goodURL = x => { try { const u = new URL(x); return ['http:', 'https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const byId = x => document.getElementById(x);

async function load() {
  const input = byId('admin-token').value.trim();
  if (input) token = input;
  if (!token) {
    byId('admin-message').textContent = 'Please enter the ADMIN_TOKEN.';
    return;
  }
  try {
    const r = await fetch('/api/admin', { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Authentication failed');
    all = j;
    sessionStorage.setItem('openstem_admin_token', token);
    byId('admin-content').classList.remove('admin-hidden');
    byId('admin-message').textContent = 'Review queue loaded successfully. Refresh anytime to poll for new submissions.';
    byId('admin-token').value = '';
    render();
  } catch (err) {
    sessionStorage.removeItem('openstem_admin_token');
    byId('admin-message').textContent = err.message;
  }
}

function matchSuggestions(req) {
  const approved = (all.candidates || []).filter(c => c.status === 'approved' && c.discipline === req.discipline);
  const terms = String(req.required_skills || '').split(/[,;]+/).map(x => x.trim().toLowerCase()).filter(x => x.length > 2);
  return approved.map(c => {
    const own = String(c.skills || '').toLowerCase().split(/[,;]+/).map(x => x.trim());
    const overlaps = terms.filter(t => own.some(k => k === t || (t.length > 4 && k.includes(t)) || (k.length > 4 && t.includes(k))));
    return { candidate: c, overlaps };
  }).sort((a, b) => b.overlaps.length - a.overlaps.length).slice(0, 5);
}

function matchPreview(req) {
  const matches = matchSuggestions(req);
  if (!matches.length) return '<div class="admin-suggestions"><strong>Subject-fit shortlist:</strong> No approved candidates in this discipline yet.</div>';
  return `
    <div class="admin-suggestions">
      <strong>Private, keyword-based shortlist</strong>
      <small>Algorithmic suggestions only. Verify candidate availability and obtain both parties’ explicit permission before initiating an introduction.</small>
      ${matches.map(m => `
        <div>
          <strong>${s(m.candidate.public_name)}</strong> · ${s(m.candidate.academic_level)} · ${s(m.candidate.availability_hours || 'Availability unknown')}
          <small>${m.overlaps.length ? 'Shared methods: ' + s(m.overlaps.join(', ')) : 'Same discipline; methods unconfirmed'}</small>
        </div>
      `).join('')}
    </div>
  `;
}

function extraDetails(v) {
  if (tab === 'candidates') {
    return `
      <p>
        <strong>Level:</strong> ${s(v.academic_level)}<br/>
        <strong>Research area:</strong> ${s(v.research_area)}<br/>
        <strong>Skills:</strong> ${s(v.skills)}<br/>
        <strong>Hours:</strong> ${s(v.availability_hours || 'Not provided')} · ${s(v.timezone_region || 'Time zone unstated')} · ${s(v.collaboration_mode || 'Preference unstated')}<br/>
        <strong>Goal:</strong> ${s(v.research_goal || 'Not provided')}<br/>
        <strong>Public directory opt-in:</strong> ${v.public_opt_in ? '<span style="color:#0f754b;font-weight:700">YES</span>' : '<span style="color:#aa4b36;font-weight:700">NO (STRICTLY PRIVATE)</span>'}
      </p>
      <p><strong>Experience &amp; Bio:</strong> ${s(v.bio)}</p>
      ${goodURL(v.evidence_url) ? `<p><a href="${s(goodURL(v.evidence_url))}" target="_blank" rel="noopener noreferrer">Inspect submitted code / portfolio evidence ↗</a></p>` : ''}
    `;
  }
  if (tab === 'research_requests') {
    return `
      <p>
        <strong>Project title:</strong> ${s(v.project_title || 'Private collaboration request')}<br/>
        <strong>Arrangement:</strong> ${s(v.opportunity_type)}<br/>
        <strong>Skills needed:</strong> ${s(v.required_skills)}<br/>
        <strong>Commitment:</strong> ${s(v.weekly_hours || 'Not provided')} · ${s(v.duration || 'Duration unstated')}<br/>
        <strong>Work mode:</strong> ${s(v.work_mode || 'Not provided')}<br/>
        <strong>Location detail:</strong> ${s(v.location_detail || 'Not provided')}<br/>
        <strong>Funding / Compensation:</strong> ${s(v.compensation_detail || 'Not provided')}<br/>
        <strong>Deadline:</strong> ${s(v.deadline || 'Unspecified')}<br/>
        <strong>Eligibility:</strong> ${s(v.eligibility || 'Not provided')}<br/>
        <strong>Public listing consent:</strong> ${v.public_opt_in ? '<span style="color:#0f754b;font-weight:700">YES</span>' : '<span style="color:#aa4b36;font-weight:700">NO (STRICTLY PRIVATE)</span>'}<br/>
        <strong>Identity verified:</strong> ${v.identity_checked ? '<span style="color:#0f754b;font-weight:700">YES</span>' : '<span style="color:#ca6b24;font-weight:700">NO (PENDING CHECK)</span>'}
      </p>
      <p><strong>Project scope:</strong> ${s(v.project_summary)}</p>
      <p><strong>Mentorship plan:</strong> ${s(v.mentor_support || 'Not provided')}</p>
      ${v.candidate_id ? `<p><strong>Targeted candidate ID:</strong> ${s(v.candidate_id)}</p>` : ''}
      ${matchPreview(v)}
    `;
  }
  return `
    <p><strong>Target project:</strong> ${s(v.project_title || 'Unknown')} · ${s(v.lab_institution || '')}</p>
    <p><strong>Student level:</strong> ${s(v.academic_level)}<br/><strong>Relevant skills:</strong> ${s(v.skills)}</p>
    <p><strong>Statement of interest:</strong> ${s(v.motivation)}</p>
    ${goodURL(v.evidence_url) ? `<p><a href="${s(goodURL(v.evidence_url))}" target="_blank" rel="noopener noreferrer">Inspect student work sample ↗</a></p>` : ''}
    <p class="admin-attention">Confirm student availability and obtain consent before initiating lab introduction.</p>
  `;
}

function render() {
  let arr = all[tab] || [];
  if (statusFilter !== 'all') {
    arr = arr.filter(x => x.status === statusFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    arr = arr.filter(x => [
      x.public_name, x.full_name, x.institution, x.discipline, x.email, x.project_title, x.skills, x.required_skills
    ].join(' ').toLowerCase().includes(q));
  }

  const rawTotal = (all[tab] || []).length;
  const pendingTotal = (all[tab] || []).filter(x => x.status === 'pending').length;

  byId('admin-count').textContent = `${arr.length} shown of ${rawTotal} entries · ${pendingTotal} pending`;

  byId('admin-list').innerHTML = arr.map(v => `
    <article class="admin-card">
      <div class="small">${s(v.created_at)} · <strong>${s(v.status).toUpperCase()}</strong></div>
      <h3>${s(v.public_name || v.full_name)}</h3>
      <p><strong>${s(v.institution || '')}</strong> · ${s(v.discipline || '')}</p>
      <p>Contact email: <a href="mailto:${encodeURIComponent(v.email || '')}">${s(v.email)}</a></p>
      ${v.discovery_source ? `<p class="small">Referral source: ${s(v.discovery_source)}</p>` : ''}
      ${extraDetails(v)}
      ${tab === 'research_requests' ? `
        <label class="admin-verified">
          <input type="checkbox" data-identity-for="${s(v.id)}" ${v.identity_checked ? 'checked' : ''}/>
          <span>I have independently verified this researcher’s academic identity and institutional affiliation.</span>
        </label>
      ` : ''}
      <label class="small" for="status-${s(v.id)}">Decision status</label>
      <select id="status-${s(v.id)}">
        <option value="pending" ${v.status === 'pending' ? 'selected' : ''}>Pending Review</option>
        <option value="approved" ${v.status === 'approved' ? 'selected' : ''}>Approved</option>
        <option value="contacted" ${v.status === 'contacted' ? 'selected' : ''}>Contacted / In Progress</option>
        <option value="rejected" ${v.status === 'rejected' ? 'selected' : ''}>Rejected</option>
      </select>
      <button type="button" class="btn btn-dark" data-save="${s(v.id)}">Save review decision ↗</button>
      <button type="button" class="admin-delete" data-delete="${s(v.id)}">Delete permanently</button>
    </article>
  `).join('') || '<p>No records match your filter criteria.</p>';

  document.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => save(b.dataset.save)));
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => removeRecord(b.dataset.delete)));
}

async function removeRecord(id) {
  if (!window.confirm('Permanently delete this application? This action cannot be reversed.')) return;
  try {
    const r = await fetch('/api/admin', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: tab, id })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Deletion failed');
    all[tab] = all[tab].filter(v => v.id !== id);
    byId('admin-message').textContent = 'Record deleted permanently.';
    render();
  } catch (err) {
    byId('admin-message').textContent = err.message;
  }
}

async function save(id) {
  const record = all[tab].find(v => v.id === id);
  if (!record) return;
  const status = byId('status-' + id).value;
  const payload = { collection: tab, id, status };

  if (tab === 'research_requests') {
    payload.identity_checked = !!document.querySelector(`[data-identity-for="${id}"]`)?.checked;
    if (payload.identity_checked && !record.identity_checked && !window.confirm('Confirm you have verified this researcher’s identity and institutional email. This authorizes publication on the public research board.')) return;
    if (status === 'approved' && record.public_opt_in && !payload.identity_checked && !window.confirm('Identity has not been verified yet; project will remain PRIVATE even if approved. Continue?')) return;
  }

  try {
    const r = await fetch('/api/admin', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Update failed');
    record.status = status;
    if (tab === 'research_requests') record.identity_checked = payload.identity_checked ? 1 : 0;
    byId('admin-message').textContent = `Decision saved for ${record.public_name || record.full_name || id}.`;
    render();
  } catch (err) {
    byId('admin-message').textContent = err.message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  byId('load-admin')?.addEventListener('click', load);
  byId('admin-token')?.addEventListener('keydown', e => { if (e.key === 'Enter') load(); });

  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.tab === tab)));
    render();
  }));

  if (token) {
    load();
  }
});
