import {json} from '../_lib/core.js';
// Public opportunity board. Only opt-in + manually approved + individually identity-checked briefs.
export async function onRequestGet({env}){
 if(!env.DB)return json({error:'Research opportunity database is not configured.'},503);
 try{
  const {results}=await env.DB.prepare(`SELECT id,full_name,institution,discipline,required_skills,project_summary,opportunity_type,project_title,weekly_hours,duration,work_mode,location_detail,compensation_detail,eligibility,mentor_support,deadline,created_at FROM research_requests WHERE status='approved' AND public_opt_in=1 AND identity_checked=1 AND project_title<>'' AND (deadline='' OR deadline>=?) ORDER BY reviewed_at DESC LIMIT 80`).bind(new Date().toISOString().slice(0,10)).all();
  return json({opportunities:results});
 }catch(err){console.error('Opportunity directory error',err);return json({error:'Opportunity board is temporarily unavailable.'},503);}
}
