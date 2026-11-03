import {json,requireAdmin,parseInput} from '../_lib/core.js';
function deny(){return json({error:'Access denied'},401);}
const collections=['candidates','research_requests','project_interests'];
export async function onRequestGet({request,env}){
 if(!requireAdmin(request,env))return deny();if(!env.DB)return json({error:'Database unavailable'},503);
 try{const [a,b,c]=await Promise.all([
  env.DB.prepare('SELECT * FROM candidates ORDER BY created_at DESC LIMIT 250').all(),
  env.DB.prepare('SELECT * FROM research_requests ORDER BY created_at DESC LIMIT 250').all(),
  env.DB.prepare(`SELECT i.*, r.project_title, r.institution AS lab_institution FROM project_interests i LEFT JOIN research_requests r ON r.id=i.project_id ORDER BY i.created_at DESC LIMIT 250`).all()
 ]);return json({candidates:a.results,research_requests:b.results,project_interests:c.results});}
 catch(err){console.error('Admin list error',err);return json({error:'Unable to load applications'},503);}
}
export async function onRequestPatch({request,env}){
 if(!requireAdmin(request,env))return deny();if(!env.DB)return json({error:'Database unavailable'},503);
 try{const b=await parseInput(request);if(!collections.includes(b.collection)||!['pending','approved','rejected','contacted'].includes(b.status)||typeof b.id!=='string'||!/^[0-9a-f-]{36}$/.test(b.id))return json({error:'Invalid moderation request'},400);
  if(b.collection==='research_requests'&&typeof b.identity_checked!=='undefined'&&typeof b.identity_checked!=='boolean')return json({error:'Invalid identity-check field'},400);
  const now=new Date().toISOString();const hasCheck=b.collection==='research_requests'&&typeof b.identity_checked==='boolean';
  const sql=hasCheck?`UPDATE research_requests SET status=?,identity_checked=?,reviewed_at=? WHERE id=?`:`UPDATE ${b.collection} SET status=?,reviewed_at=? WHERE id=?`;
  const params=hasCheck?[b.status,b.identity_checked?1:0,now,b.id]:[b.status,now,b.id];
  const result=await env.DB.prepare(sql).bind(...params).run();if(!result.meta?.changes)return json({error:'Record not found'},404);return json({ok:true});
 }catch(err){console.error('Admin update error',err);return json({error:'Update failed'},500);}
}
export async function onRequestDelete({request,env}){
 if(!requireAdmin(request,env))return deny();if(!env.DB)return json({error:'Database unavailable'},503);
 try{const b=await parseInput(request);if(!collections.includes(b.collection)||typeof b.id!=='string'||!/^[0-9a-f-]{36}$/.test(b.id))return json({error:'Invalid deletion request'},400);
  // Child interests are explicitly deleted with a research request, independent of FK configuration.
  if(b.collection==='research_requests')await env.DB.prepare('DELETE FROM project_interests WHERE project_id=?').bind(b.id).run();
  const result=await env.DB.prepare(`DELETE FROM ${b.collection} WHERE id=?`).bind(b.id).run();if(!result.meta?.changes)return json({error:'Record not found'},404);return json({ok:true});
 }catch(err){console.error('Delete error',err);return json({error:'Deletion failed'},500);}
}
