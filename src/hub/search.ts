export type SearchRecord={title:string;description:string;type:string;path:string;aliases?:string[]};
const normalize=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const stop=new Set(['a','an','the','is','it','its','of','to','in','and','with','for','my','our','was','has','have']);
export function searchRecords(records:SearchRecord[],query:string,type='All'):SearchRecord[]{
 const normalized=normalize(query);const words=[...new Set(normalized.split(' ').filter(w=>w&&!stop.has(w)))];if(!words.length)return [];
 return records.filter(r=>type==='All'||r.type===type).map(record=>{const title=normalize(record.title),aliases=normalize((record.aliases??[]).join(' ')),body=normalize(record.description);let score=0;for(const word of words){if(title.split(' ').includes(word))score+=9;else if(title.includes(word))score+=6;else if(aliases.includes(word))score+=5;else if(body.includes(word))score+=2;else return {record,score:0};}if(title===normalized)score+=30;if(title.includes(normalized))score+=12;return {record,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.record.title.localeCompare(b.record.title)).map(x=>x.record);
}
