import { createServer } from 'node:http';
import { readFile,stat } from 'node:fs/promises';
import { resolve,extname,sep } from 'node:path';
const root=resolve('dist');const prefix=process.env.PREVIEW_BASE??'/';const port=Number(process.env.PREVIEW_PORT??4173);
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff'};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}const relative=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';const path=resolve(root,relative);if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}if(!(await stat(path)).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[extname(path)]??'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(path));}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Production preview: http://127.0.0.1:${port}${prefix}`));
