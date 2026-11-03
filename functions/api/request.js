import {json,submission,checkText,trim,emailValid,disciplines} from '../_lib/core.js';
const types=['Paid research role','Funded research position','Academic credit / internship','Unpaid / volunteer collaboration','Arrangement not yet decided'];
const modes=['Remote','On-site','Hybrid','Flexible'];
const sources=['OpenSTEM website','Discord community','Researcher or lab','Student referral','Social media','Search engine','Other',''];
export async function onRequestPost(context){return submission(context,async b=>{
 const name=checkText(b.full_name,2,100,'Full name');const email=trim(b.email,190).toLowerCase();if(!emailValid(email))return json({error:'Invalid email address.'},400);
 const institution=checkText(b.institution,2,140,'Institution');const discipline=trim(b.discipline,40);if(!disciplines.includes(discipline))return json({error:'Choose a valid discipline.'},400);
 const type=trim(b.opportunity_type,50);if(!types.includes(type))return json({error:'Choose a valid opportunity type.'},400);
 const skills=checkText(b.required_skills,2,260,'Required skills');const summary=checkText(b.project_summary,40,1600,'Project summary');
 const title=checkText(b.project_title,6,120,'Project title');const hours=trim(b.weekly_hours,40);if(hours.length<2)return json({error:'Specify the expected time commitment.'},400);
 const duration=trim(b.duration,70);if(duration.length<2)return json({error:'Specify an approximate project duration.'},400);
 const workMode=trim(b.work_mode,30);if(!modes.includes(workMode))return json({error:'Choose a valid project work mode.'},400);
 const location=trim(b.location_detail,140);const compensation=trim(b.compensation_detail,180);const eligibility=trim(b.eligibility,320);const mentor=checkText(b.mentor_support,20,700,'Mentorship plan');
 const deadline=trim(b.deadline,10);if(deadline&&(!/^\d{4}-\d{2}-\d{2}$/.test(deadline)||Number.isNaN(Date.parse(deadline))||new Date(deadline).toISOString().slice(0,10)!==deadline||deadline<new Date().toISOString().slice(0,10)))return json({error:'Choose a valid current or future deadline.'},400);
 const source=trim(b.discovery_source,40);if(!sources.includes(source))return json({error:'Invalid discovery source.'},400);
 const id=crypto.randomUUID();let candidateId=trim(b.candidate_id,60)||null;if(candidateId&&!/^[0-9a-f-]{36}$/.test(candidateId))candidateId=null;
 await context.env.DB.prepare(`INSERT INTO research_requests (id,full_name,email,institution,discipline,required_skills,project_summary,opportunity_type,candidate_id,project_title,weekly_hours,duration,work_mode,location_detail,compensation_detail,eligibility,mentor_support,deadline,discovery_source,public_opt_in,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`).bind(id,name,email,institution,discipline,skills,summary,type,candidateId,title,hours,duration,workMode,location,compensation,eligibility,mentor,deadline,source,b.public_opt_in===true?1:0,new Date().toISOString()).run();
 return json({ok:true,message:'Research brief received for review.',reference:id},201);
 });}
