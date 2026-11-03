import {json,submission,checkText,trim,emailValid,urlValid} from '../_lib/core.js';
export async function onRequestPost(context){return submission(context,async b=>{
 const projectId=trim(b.project_id,60);
 if(!/^[0-9a-f-]{36}$/.test(projectId))return json({error:'Choose a published research opportunity.'},400);
 const project=await context.env.DB.prepare(`SELECT id FROM research_requests WHERE id=? AND status='approved' AND public_opt_in=1 AND identity_checked=1 AND (deadline='' OR deadline>=?)`).bind(projectId,new Date().toISOString().slice(0,10)).first();
 if(!project)return json({error:'This opportunity is not accepting public expressions of interest.'},404);
 const name=checkText(b.full_name,2,100,'Full name');const email=trim(b.email,190).toLowerCase();if(!emailValid(email))return json({error:'Invalid email address.'},400);
 const institution=checkText(b.institution,2,140,'Institution');const level=checkText(b.academic_level,3,60,'Academic level');const skills=checkText(b.skills,3,260,'Relevant skills');const motivation=checkText(b.motivation,50,1600,'Research interest');const evidence=trim(b.evidence_url,300);if(!urlValid(evidence))return json({error:'Invalid evidence URL.'},400);
 const id=crypto.randomUUID();await context.env.DB.prepare(`INSERT INTO project_interests (id,project_id,full_name,email,institution,academic_level,skills,motivation,evidence_url,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,'pending',?)`).bind(id,projectId,name,email,institution,level,skills,motivation,evidence,new Date().toISOString()).run();
 return json({ok:true,message:'Expression of interest received for review. No introduction has been made.',reference:id},201);
 });}
