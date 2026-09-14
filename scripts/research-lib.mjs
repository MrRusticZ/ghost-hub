import { createHash } from 'node:crypto';
import { z } from 'zod';
export const ALLOWED_HOSTS=new Set(['api.steampowered.com','store.steampowered.com','steamcommunity.com','www.kineticgames.co.uk','kineticgames.co.uk']);
export const normalizeText=text=>text.replace(/\s+/g,' ').trim();
export function plainText(html){return normalizeText(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\[(?:\/?(?:img|url|h\d|hr|p|b|i|u|list|olist|\*|previewyoutube|table|tr|td))[^\]]*\]/gi,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' '));}
export function validateSourceUrl(value){const u=new URL(value);if(u.protocol!=='https:'||!ALLOWED_HOSTS.has(u.hostname)||u.username||u.password||u.port)throw Error('Source URL is outside the approved public hosts.');return u;}
export function canonicalSteamUrl(value){const u=new URL(value);if(u.protocol==='https:'&&u.hostname==='steamstore-a.akamaihd.net'&&!u.username&&!u.password&&!u.port&&/^\/news\/externalpost\/steam_community_announcements\/\d+\/?$/.test(u.pathname)){u.hostname='store.steampowered.com';u.search='';u.hash='';}return validateSourceUrl(u.href).href;}
export async function fetchSource(value,{fetchImpl=fetch,maxBytes=1500000}={}){
 let url=validateSourceUrl(value);
 for(let hops=0;hops<4;hops++){
  const r=await fetchImpl(url,{redirect:'manual',headers:{'User-Agent':'GhostHubResearch/1.0 (source-linked Phasmophobia fan reports)'},signal:AbortSignal.timeout(15000)});
  if(r.status>=300&&r.status<400){url=validateSourceUrl(new URL(r.headers.get('location'),url).href);continue;}
  if(!r.ok)throw Error(`Source returned ${r.status}: ${url.hostname}`);
  const chunks=[];let bytes=0;for await(const chunk of r.body){bytes+=chunk.length;if(bytes>maxBytes)throw Error('Source exceeds the research size limit.');chunks.push(chunk);}
  return Buffer.concat(chunks).toString('utf8');
 }
 throw Error('Too many source redirects.');
}
export const DraftSchema=z.object({title:z.string().min(8).max(150),summary:z.string().min(20).max(450),version:z.string().max(40),claims:z.array(z.object({text:z.string().min(10).max(550),sourceIds:z.array(z.string()).min(1).max(6),supportingQuotes:z.array(z.object({sourceId:z.string(),quote:z.string().min(10).max(240)})).min(1).max(6)})).min(1).max(5),playerImpact:z.string().min(20).max(700),uncertainties:z.array(z.string().max(400)).max(4)}).strict();
export const DRAFT_JSON_SCHEMA={type:'object',additionalProperties:false,properties:{title:{type:'string'},summary:{type:'string'},version:{type:'string'},claims:{type:'array',items:{type:'object',additionalProperties:false,properties:{text:{type:'string'},sourceIds:{type:'array',items:{type:'string'}},supportingQuotes:{type:'array',items:{type:'object',additionalProperties:false,properties:{sourceId:{type:'string'},quote:{type:'string'}},required:['sourceId','quote']}}},required:['text','sourceIds','supportingQuotes']}},playerImpact:{type:'string'},uncertainties:{type:'array',items:{type:'string'}}},required:['title','summary','version','claims','playerImpact','uncertainties']};
export function checkDraft(raw,sources){
 const draft=DraftSchema.parse(raw);const byId=new Map(sources.map(s=>[s.id,s]));const used=new Set();
 for(const claim of draft.claims){
  for(const id of claim.sourceIds){if(!byId.has(id))throw Error('Report cites an unknown source.');used.add(id);if(!claim.supportingQuotes.some(q=>q.sourceId===id))throw Error('Claim lacks an evidence excerpt for a citation.');}
  for(const q of claim.supportingQuotes){if(!claim.sourceIds.includes(q.sourceId))throw Error('Excerpt does not belong to the claim citations.');const source=byId.get(q.sourceId);if(!source||!normalizeText(source.text).toLowerCase().includes(normalizeText(q.quote).toLowerCase()))throw Error('Evidence excerpt was not found in the fetched source.');}
 }
 const platforms=new Set([...used].map(id=>byId.get(id).platform));
 if(!platforms.has('Steam')||!platforms.has('Kinetic'))throw Error('Cross-platform coverage is insufficient.');
 const words=(draft.title+' '+draft.summary+' '+draft.claims.map(c=>c.text).join(' ')+' '+draft.playerImpact+' '+draft.uncertainties.join(' ')).split(/\s+/).length;
 if(words>180)throw Error('Report is too long for the source-summary budget.');
 return draft;
}
const stop=new Set(['phasmophobia','update','the','and','for','with','from','this','that','notes','patch','games','kinetic','welcome','back','hunters']);
export function storyTokens(title){return new Set(title.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!stop.has(w)));}
export function sameStory(a,b){const v=a.title.match(/\b0\.\d+\.\d+(?:\.\d+)?\b/)?.[0];if(v&&b.text.includes(v))return true;const left=storyTokens(a.title),right=storyTokens(b.title);const overlap=[...left].filter(t=>right.has(t)).length;return overlap>=2&&overlap/Math.max(1,Math.min(left.size,right.size))>=.5;}
export const sourceDigest=sources=>createHash('sha256').update(sources.map(s=>s.id+':'+s.text).sort().join('\n')).digest('hex');
