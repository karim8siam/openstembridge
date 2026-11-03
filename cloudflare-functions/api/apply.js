import {json,submission,checkText,trim,emailValid,urlValid,disciplines} from '../_lib/core.js';
const modes=['Remote','On-site','Hybrid','Flexible','Not specified'];
const sources=['OpenSTEM website','Discord community','Researcher or lab','Student referral','Social media','Search engine','Other',''];
export async function onRequestPost(context){return submission(context,async b=>{
 const fullName=checkText(b.full_name,2,100,'Full name');const email=trim(b.email,190).toLowerCase();if(!emailValid(email))return json({error:'Invalid email address.'},400);
 const institution=checkText(b.institution,2,140,'Institution');const level=checkText(b.academic_level,3,60,'Academic level');const discipline=trim(b.discipline,40);if(!disciplines.includes(discipline))return json({error:'Choose a valid discipline.'},400);
 const area=checkText(b.research_area,3,160,'Research area');const skills=checkText(b.skills,2,250,'Technical skills');const bio=checkText(b.bio,40,1200,'Research experience');const evidence=trim(b.evidence_url,300);if(!urlValid(evidence))return json({error:'Invalid evidence URL. Use http or https.'},400);
 const hours=trim(b.availability_hours,30);if(hours&&!/^(?:[1-9]|[1-3][0-9]|40) hours\/week$/.test(hours))return json({error:'Choose a valid weekly availability.'},400);
 const mode=trim(b.collaboration_mode,30);if(mode&&!modes.includes(mode))return json({error:'Choose a valid collaboration preference.'},400);
 const zone=trim(b.timezone_region,80);const goal=trim(b.research_goal,400);if(goal.length>400)return json({error:'Research goal is too long.'},400);
 const source=trim(b.discovery_source,40);if(!sources.includes(source))return json({error:'Invalid discovery source.'},400);
 const id=crypto.randomUUID(),now=new Date().toISOString();
 await context.env.DB.prepare(`INSERT INTO candidates (id,public_name,email,institution,academic_level,discipline,research_area,skills,bio,evidence_url,availability_hours,timezone_region,collaboration_mode,research_goal,discovery_source,public_opt_in,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`).bind(id,fullName,email,institution,level,discipline,area,skills,bio,evidence,hours,zone,mode,goal,source,b.public_opt_in===true?1:0,now).run();
 return json({ok:true,message:'Application received for manual review.',reference:id},201);
 });}
