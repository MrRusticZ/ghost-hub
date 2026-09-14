export async function structuredResponse({key,model,instructions,input,schema,name,maxTokens=1500,fetchImpl=fetch}) {
  if(!key||!model)throw new Error('The AI service has not been configured.');
  const response=await fetchImpl('https://api.openai.com/v1/responses',{
    method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(25000),
    body:JSON.stringify({model,store:false,instructions,input:JSON.stringify(input),max_output_tokens:maxTokens,text:{format:{type:'json_schema',name,strict:true,schema}}})
  });
  if(!response.ok)throw new Error(`AI service returned ${response.status}.`);
  const data=await response.json();
  if(data.status!=='completed')throw new Error('AI response was incomplete.');
  const text=(data.output??[]).flatMap(item=>item.content??[]).filter(item=>item.type==='output_text').map(item=>item.text).join('');
  if(!text)throw new Error('AI service returned no usable response.');
  return JSON.parse(text);
}
export async function screenMessage(text,{key,fetchImpl=fetch}={}) {
  const normalized=text.normalize('NFKC').replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g,'').toLowerCase();
  if(/https?:\/\/|www\.|discord\.gg\/|<\/?[a-z][^>]*>/i.test(text))return {status:'held',reason:'Links and markup are held for review in the text-only room.'};
  if(/(.)\1{15,}/u.test(normalized))return {status:'held',reason:'Repeated-character spam was held.'};
  if(/\b(kill yourself|doxx?|i(?: will| ll| am going to) kill you)\b/.test(normalized))return {status:'held',reason:'Potential targeted harm was held for review.'};
  if(!key)return {status:'public',reason:'Basic local screening only'};
  const r=await fetchImpl('https://api.openai.com/v1/moderations',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'omni-moderation-latest',input:text}),signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error('Message screening is unavailable. Please try again shortly.');
  const result=(await r.json()).results?.[0];if(!result)throw Error('Message screening returned no result.');
  // In-game violence and ordinary profanity are allowed; targeted abuse is not.
  const c=result.categories??{};
  return {status:c.harassment||c.hate||c['harassment/threatening']||c['hate/threatening']||c['sexual/minors']||c['self-harm/instructions']?'held':'public',reason:'Automated contextual screening'};
}
