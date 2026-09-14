import { spawn } from 'node:child_process';
const children=[];let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children)if(child.exitCode===null)child.kill('SIGTERM');process.exitCode=code;}
function run(args){const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true});children.push(child);child.once('error',error=>{console.error(error.message);stop(1);});child.once('exit',code=>{if(!stopping)stop(code??1);});}
process.once('SIGINT',()=>stop());process.once('SIGTERM',()=>stop());
console.log('Starting Ghost Hub at http://127.0.0.1:5173/ with its local community service.');
run(['--env-file-if-exists=.env','server/index.mjs']);
run(['node_modules/vite/bin/vite.js','--host','127.0.0.1','--strictPort']);
