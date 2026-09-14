import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
const workflow=(name:string)=>parse(readFileSync(new URL(`../.github/workflows/${name}.yml`,import.meta.url),'utf8'));
test('all GitHub workflows parse as YAML with explicit jobs and triggers',()=>{for(const name of ['ci','deploy','research']){const data=workflow(name);assert.equal(typeof data.name,'string');assert.ok(data.on);assert.ok(Object.keys(data.jobs).length);}});
test('deployment gates publication on build and browser checks; research remains opt-in',()=>{const deploy=workflow('deploy');const steps=deploy.jobs.deploy.steps as {run?:string;uses?:string}[];const build=steps.findIndex(s=>s.run==='npm run check');const browser=steps.findIndex(s=>s.run?.includes('npm run test:browser'));const publish=steps.findIndex(s=>s.uses?.startsWith('actions/deploy-pages@'));assert.ok(build>=0&&browser>build&&publish>browser);assert.ok(deploy.on.workflow_run.workflows.includes('Research Phasmophobia updates'));assert.equal(workflow('research').jobs.research.if,"vars.RESEARCH_ENABLED == 'true'");});
