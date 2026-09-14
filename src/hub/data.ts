import { catalog as bundledCatalog,news as bundledNews } from 'virtual:ghost-hub-reference';
import { z } from 'zod';
import { CatalogSchema,NewsSchema,type Catalog,type News } from './model';
import { writeValue } from './storage';
export const localCatalog=CatalogSchema.parse(bundledCatalog);
export const localNews=NewsSchema.parse(bundledNews);
export const ManifestSchema=z.object({schemaVersion:z.literal(2),version:z.string(),files:z.object({catalog:z.string().regex(/^[a-zA-Z0-9_.-]+\.json$/),news:z.string().regex(/^[a-zA-Z0-9_.-]+\.json$/)})});
async function json(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(8000),cache:'no-cache'});if(!r.ok)throw Error(`Data request returned ${r.status}`);return r.json();}
export async function loadContent(remoteBase=''):Promise<{catalog:Catalog;news:News;source:string;issues:string[]}>{
  const issues:string[]=[];
  const base=(import.meta.env.BASE_URL||'/')+'data/';
  for(const location of [...(remoteBase?[remoteBase]:[]),base]){
    try{
      if(location===remoteBase){const url=new URL(location);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Use an HTTPS data folder without credentials, query parameters or a fragment.');}
      const root=location.replace(/\/?$/,'/');
      const manifest=ManifestSchema.parse(await json(root+'manifest.json'));
      const [rawCatalog,rawNews]=await Promise.all([json(root+manifest.files.catalog),json(root+manifest.files.news)]);
      const catalog=CatalogSchema.parse(rawCatalog),news=NewsSchema.parse(rawNews);
      if(catalog.version!==manifest.version)throw Error('Manifest and catalog versions do not match.');
      writeValue('last-version',{version:catalog.version,loadedAt:new Date().toISOString()});
      return {catalog,news,source:location===remoteBase?'Remote reference':'Bundled reference',issues};
    }catch(err){issues.push(`${location===remoteBase?'Remote':'Local'} update unavailable. ${err instanceof Error?err.message:'Invalid content'}`);}
  }
  return {catalog:localCatalog,news:localNews,source:'Embedded fallback',issues:[...issues,'Using the reference packaged with Ghost Hub.']};
}
