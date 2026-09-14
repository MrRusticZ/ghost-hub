const urls=['http://127.0.0.1:5173/','http://127.0.0.1:4387/api/status',process.env.PRODUCTION_PREVIEW_URL??'http://127.0.0.1:4173/ghost-hub/'];
await Promise.all(urls.map(async url=>{for(let i=0;i<30;i++){try{const response=await fetch(url,{signal:AbortSignal.timeout(1000)});if(response.ok)return;}catch{}await new Promise(resolve=>setTimeout(resolve,300));}throw Error('Preview did not become available: '+url);}));
console.log('Frontend, community service and production preview are available.');
