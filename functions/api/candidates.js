import {json} from '../_lib/core.js';
export async function onRequestGet({env}){
  if(!env.DB)return json({error:'Directory database is not configured.'},503);
  try{
    const {results}=await env.DB.prepare(`SELECT id,public_name,institution,academic_level,discipline,research_area,skills,bio,evidence_url,availability_hours,timezone_region,collaboration_mode,research_goal FROM candidates WHERE status='approved' AND public_opt_in=1 ORDER BY reviewed_at DESC LIMIT 60`).all();
    const candidates=results.map(p=>({
      id:p.id,
      public_name:p.public_name,
      institution:p.institution,
      academic_level:p.academic_level,
      discipline:p.discipline,
      research_area:p.research_area,
      skills:(p.skills||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,8),
      bio:p.bio||'',
      evidence_url:p.evidence_url||'',
      availability_hours:p.availability_hours||'',
      timezone_region:p.timezone_region||'',
      collaboration_mode:p.collaboration_mode||'',
      research_goal:p.research_goal||''
    }));
    return json({candidates});
  }catch(err){
    console.error('Directory error:',err);
    return json({error:'Directory is temporarily unavailable.'},503);
  }
}
