import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const base = process.env.GH_PAGES_BASE ?? (repo && !repo.endsWith(".github.io") ? `/${repo}/` : "/");
const referenceId='\0ghost-hub-reference';
const referenceFiles=['hub-catalog.json','news.json'].map(name=>fileURLToPath(new URL('./public/data/'+name,import.meta.url)));

export default defineConfig({
  plugins: [{
    name:'ghost-hub-reference',
    resolveId(id){if(id==='virtual:ghost-hub-reference')return referenceId;},
    load(id){
      if(id!==referenceId)return;
      return referenceFiles.map((path,index)=>{this.addWatchFile(path);const value=JSON.parse(readFileSync(path,'utf8'));return `export const ${index===0?'catalog':'news'}=JSON.parse(${JSON.stringify(JSON.stringify(value))});`;}).join('\n');
    },
    handleHotUpdate(context){if(referenceFiles.includes(context.file)){const module=context.server.moduleGraph.getModuleById(referenceId);if(module)context.server.moduleGraph.invalidateModule(module);context.server.ws.send({type:'full-reload'});return [];}}
  },react(), {
    name: 'ghost-hub-offline-cache',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle).filter(name => !name.endsWith('.map')).sort();
      const version = createHash('sha256').update(files.join('\n')).digest('hex').slice(0,12);
      this.emitFile({type:'asset',fileName:'offline-assets.json',source:JSON.stringify(files)});
      this.emitFile({type:'asset',fileName:'sw.js',source:readFileSync(new URL('./public/sw.js',import.meta.url),'utf8').replace('__GHOST_HUB_BUILD__',version)});
    }
  }],
  base,
  server: { host: "127.0.0.1", port: 5173, proxy: { "/api": "http://127.0.0.1:4387" } },
  build: { target: "es2022" }
});
