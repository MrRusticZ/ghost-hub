import { z } from 'zod';
import { SessionSchema,type Session } from './model';

export const SharedCaseSchema=z.object({format:z.literal('ghost-hub-case-v1'),contentVersion:z.string().min(1).max(80),createdAt:z.string().datetime(),session:SessionSchema});
export type SharedCase=z.infer<typeof SharedCaseSchema>;
export function encodeCase(session:Session,contentVersion:string,includeNotes=false):string {
 const payload=SharedCaseSchema.parse({format:'ghost-hub-case-v1',contentVersion,createdAt:new Date().toISOString(),session:{...session,notes:includeNotes?session.notes:''}});
 const bytes=new TextEncoder().encode(JSON.stringify(payload));
 if(bytes.length>11000)throw new Error('This case is too large for a reliable link. Exclude the notes or export it from the journal.');
 return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeCase(value:string):SharedCase {
 if(!value||value.length>15000||!/^[A-Za-z0-9_-]+$/.test(value))throw new Error('This case link is invalid or too large.');
 try {
  const raw=atob(value.replaceAll('-','+').replaceAll('_','/'));
  return SharedCaseSchema.parse(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)))));
 } catch {throw new Error('This case link is damaged or uses an unsupported format. Your current case has not changed.');}
}
