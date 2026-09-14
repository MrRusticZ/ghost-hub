import {test} from 'node:test';
import assert from 'node:assert/strict';
import {HOUSE_PLANS,containsPoint,convertPoint,markerFrame,sourceFrame} from '../src/hub/atlasPlans';

test('house plans have unique selectable rooms and all label anchors sit inside their rooms',()=>{
  let floors=0;
  for(const [map,plans] of Object.entries(HOUSE_PLANS))for(const [name,plan] of Object.entries(plans)){
    floors++;
    assert.equal(new Set(plan.rooms.map(r=>r.id)).size,plan.rooms.length,`${map} ${name} room IDs`);
    for(const room of plan.rooms){
      assert.ok(containsPoint(room.label,room.points),`${map} ${name}: ${room.id} label is outside its room`);
      for(const [x,y] of room.points)assert.ok(x>=plan.bounds[0]&&x<=plan.bounds[0]+plan.bounds[2]&&y>=plan.bounds[1]&&y<=plan.bounds[1]+plan.bounds[3],`${map} ${name}: clipped ${room.id}`);
    }
  }
  assert.equal(floors,10);
});

test('a source-space Tanglewood observation stays on the same point in either presentation',()=>{
  const canonical=sourceFrame([3,31,54,54],1305,891),frame=HOUSE_PLANS.tanglewood['Ground floor'].bounds;
  const original:[number,number]=[(413.5-39.15)/704.7*100,(413.5-276.21)/481.14*100];
  const projected=convertPoint(original,canonical,frame);
  assert.ok(Math.abs(projected[0]-(413.5-226)/403*100)<1e-9);
  assert.ok(Math.abs(projected[1]-(413.5-273)/479*100)<1e-9);
  const restored=convertPoint(projected,frame,canonical);
  assert.ok(Math.abs(restored[0]-original[0])<1e-9);
  assert.ok(Math.abs(restored[1]-original[1])<1e-9);
});

test('old observations outside a tighter schematic frame stay visible without changing stored coordinates',()=>{
  const canonical=sourceFrame([3,31,54,54],1305,891),markers=[{x:1,y:2},{x:98,y:97}];
  const before=JSON.stringify(markers),frame=markerFrame(HOUSE_PLANS.tanglewood['Ground floor'].bounds,canonical,markers);
  for(const marker of markers){const p=convertPoint([marker.x,marker.y],canonical,frame);assert.ok(p.every(v=>v>0&&v<100));}
  assert.equal(JSON.stringify(markers),before);
});
