import standard from './assets/ghost-reference/footstep.mp3?no-inline';
import wood1 from './assets/ghost-reference/footstep_wood_2.mp3?no-inline';
import wood2 from './assets/ghost-reference/footstep_wood_3.mp3?no-inline';
import carpet1 from './assets/ghost-reference/footstep_carpet_2.mp3?no-inline';
import carpet2 from './assets/ghost-reference/footstep_carpet_3.mp3?no-inline';
import gravel1 from './assets/ghost-reference/footstep_gravel.mp3?no-inline';
import gravel2 from './assets/ghost-reference/footstep_gravel_2.mp3?no-inline';
import asphalt1 from './assets/ghost-reference/footstep_asphalt_2.mp3?no-inline';
import asphalt2 from './assets/ghost-reference/footstep_asphalt_3.mp3?no-inline';
import metal1 from './assets/ghost-reference/footstep_metal_stairs.mp3?no-inline';
import metal2 from './assets/ghost-reference/footstep_metal_stairs_2.mp3?no-inline';
import metal3 from './assets/ghost-reference/footstep_metal_stairs_3.mp3?no-inline';

// Original recordings, with source URLs and hashes in ghost-reference-media.json.
// Import as build assets so development, production preview and offline use agree.
export const FOOTSTEP_SURFACES = [
  {id:'standard',label:'Standard',samples:[standard]},
  {id:'wood',label:'Wood',samples:[wood1,wood2]},
  {id:'carpet',label:'Carpet',samples:[carpet1,carpet2]},
  {id:'gravel',label:'Gravel',samples:[gravel1,gravel2]},
  {id:'asphalt',label:'Asphalt',samples:[asphalt1,asphalt2]},
  {id:'metal',label:'Metal stairs',samples:[metal1,metal2,metal3]},
] as const;
export type FootstepSurface=typeof FOOTSTEP_SURFACES[number]['id'];
export function footstepSampleUrls(surface:FootstepSurface){
  return FOOTSTEP_SURFACES.find(item=>item.id===surface)!.samples;
}
