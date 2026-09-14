import { readFile,mkdir,writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createHubServer,passwordHash } from './app.mjs';

const runtime=resolve(process.env.DATA_DIR??'runtime');await mkdir(runtime,{recursive:true});
const production=process.env.NODE_ENV==='production';let secret=process.env.SESSION_SECRET,adminHash=process.env.ADMIN_PASSWORD_HASH;
if(!production&&(!secret||!adminHash)){
 const path=resolve(runtime,'local-secrets.json');let local;
 try{local=JSON.parse(await readFile(path,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;const password=randomBytes(20).toString('base64url');local={secret:randomBytes(32).toString('hex'),adminHash:passwordHash(password)};await writeFile(path,JSON.stringify(local),{mode:0o600,flag:'wx'});await writeFile(resolve(runtime,'owner-password.txt'),password,{mode:0o600,flag:'wx'});}
 secret||=local.secret;adminHash||=local.adminHash;
}
const catalog=JSON.parse(await readFile(new URL('../public/data/hub-catalog.json',import.meta.url),'utf8'));
const hub=createHubServer({dbPath:resolve(runtime,'ghost-hub.sqlite'),secret,adminHash,production,catalog,allowedOrigins:(process.env.ALLOWED_ORIGINS??'http://127.0.0.1:5173,http://localhost:5173').split(',').map(v=>v.trim()).filter(Boolean),aiKey:process.env.OPENAI_API_KEY,aiModel:process.env.OPENAI_MODEL,moderationKey:process.env.MODERATION_API_KEY??process.env.OPENAI_API_KEY,dailyAiLimit:Number(process.env.DAILY_AI_REQUEST_LIMIT??50),trustProxy:process.env.TRUST_PROXY==='true'});
const port=Number(process.env.PORT??4387);const host=process.env.HOST??'127.0.0.1';
hub.server.on('error',error=>{console.error(`Community service could not start: ${error.code??error.message}. Choose a free PORT and matching Vite proxy.`);process.exitCode=1;});
hub.server.listen(port,host,()=>console.log(`Ghost Hub community service listening on http://${host}:${port}. ${production?'Production screening required.':'Local development mode. Owner credentials are in runtime/owner-password.txt.'}`));
process.once('SIGINT',()=>void hub.close().then(()=>process.exit(0)));process.once('SIGTERM',()=>void hub.close().then(()=>process.exit(0)));
