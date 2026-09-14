export type Point = readonly [number, number];
export type Frame = readonly [number, number, number, number];
export type PlanRoom = {id:string; name:string; points:readonly Point[]; label:Point; lines:string[]; compact?:boolean};
export type PlanFloor = {bounds:Frame; rooms:PlanRoom[]; openings:readonly Frame[]; stairs:readonly Frame[]; entries:readonly Frame[]; partitions:readonly Frame[]};
const room=(id:string,name:string,points:Point[],label:Point,compact=false):PlanRoom=>({id,name,points,label,lines:name.split('|'),compact});
const box=(id:string,name:string,x:number,y:number,w:number,h:number,compact=false)=>room(id,name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]],[x+w/2,y+h/2],compact);
const floor=(bounds:Frame,rooms:PlanRoom[],openings:Frame[]=[],stairs:Frame[]=[],entries:Frame[]=[],partitions:Frame[]=[]):PlanFloor=>({bounds,rooms,openings,stairs,entries,partitions});

// Architectural schematics redrawn against the credited Fantismal sheets, in their
// original pixel coordinate system. No furniture, hiding spots or spawn positions
// are inferred. Original colour references remain the authority for those details.
export const HOUSE_PLANS:Record<string,Record<string,PlanFloor>>={
  tanglewood:{
    'Ground floor':floor([226,273,403,479],[
      box('ensuite','Ensuite',252,297,69,75,true),
      room('master','Master|bedroom',[[252,372],[321,372],[321,320],[364,320],[364,484],[252,484]],[305,423]),
      box('living','Living|room',364,343,99,141),
      room('dining','Dining|room',[[502,343],[603,343],[603,484],[463,484],[463,445],[502,445]],[554,416]),
      box('nancy',"Nancy’s|room",252,484,73,100),
      box('bathroom','Main|bathroom',252,584,73,69,true),
      box('hobby','Hobby|room',252,653,114,73),
      room('foyer','Foyer',[[325,484],[437,484],[437,553],[428,553],[428,653],[366,653],[366,526],[325,526]],[391,572]),
      box('utility','Utility',437,484,67,69,true),
      box('kitchen','Kitchen',504,484,99,69),
      box('garage','Garage',428,553,175,173),
    ],[[289,369,28,6],[350,479,14,9],[411,479,26,10],[457,454,12,27],[324,491,7,28],[317,611,13,26],[331,647,27,9],[416,628,16,25],[435,536,30,8],[472,549,28,8],[501,481,30,8],[501,438,26,10],[583,438,20,10]],[[464,346,36,98]],[[372,652,42,4]]),
    Basement:floor([767,287,184,251],[box('basement','Basement',788,307,142,211)],[],[[790,344,35,102]],[]),
  },
  willow:{
    'Ground floor':floor([484,352,496,592],[
      room('master','Master|bedroom',[[629,379],[695,379],[695,388],[720,388],[720,547],[604,547],[604,418],[629,418]],[665,453]),
      box('studio','Studio',840,387,115,156),
      room('hall','Hallway',[[720,476],[840,476],[840,546],[810,546],[810,644],[687,644],[687,622],[595,622],[595,568],[604,568],[604,547],[720,547]],[766,570]),
      box('bathroom','Bathroom',810,546,51,98,true),
      box('kitchen','Kitchen',687,644,174,134),
      room('living','Living|room',[[687,778],[853,778],[853,813],[861,813],[861,917],[671,917],[671,803],[687,803]],[770,849]),
      {...box('gym','Gym',510,685,177,232),label:[598,756]},
    ],[[701,473,23,11],[834,488,12,28],[797,573,15,35],[751,639,35,11],[720,771,32,12],[836,771,21,12],[671,773,22,29]],[[625,569,97,51]],[[727,916,43,4]],[[560,807,44,0]]),
    Basement:floor([134,490,272,321],[
      room('living','Basement|living room',[[158,514],[208,514],[208,565],[280,565],[280,622],[259,622],[259,787],[158,787]],[211,706]),
      room('utility','Basement|utility',[[208,514],[382,514],[382,622],[320,622],[320,565],[208,565]],[299,544]),
      room('bar','Basement|bar',[[280,565],[320,565],[320,622],[382,622],[382,787],[259,787],[259,622],[280,622]],[320,710]),
    ],[[199,520,13,32],[277,565,16,56],[258,644,7,33]],[[215,568,64,53]],[]),
  },
  edgefield:{
    'Ground floor':floor([187,883,424,384],[
      box('utility','Utility',212,907,73,77,true),
      box('toilet','Toilet',285,945,79,39,true),
      box('kitchen','Kitchen',212,984,152,107),
      box('living','Living|room',212,1091,152,153),
      room('hall','Hallway',[[364,907],[435,907],[435,1059],[396,1059],[396,1149],[435,1149],[435,1208],[364,1208]],[390,1024]),
      box('dining','Dining|room',435,907,77,187),
      box('garage','Garage',435,1094,152,150),
    ],[[244,978,48,12],[351,974,22,13],[351,1036,20,32],[351,1156,20,38],[414,978,24,13],[428,1144,12,38],[301,1224,45,7]],[[397,1061,37,42],[397,1111,37,39]],[[370,1208,40,4]]),
    'First floor':floor([202,338,409,386],[
      room('purple','Purple|bedroom',[[225,362],[300,362],[300,399],[367,399],[367,437],[331,437],[331,476],[225,476]],[264,418]),
      box('bathroom','Bathroom',367,362,77,75,true),
      box('orange','Orange|bedroom',444,362,78,114),
      box('green','Green|bedroom',225,476,106,113),
      box('blue-small','Small blue|bedroom',444,476,78,113),
      room('blue-large','Large blue|bedroom',[[225,589],[331,589],[331,625],[372,625],[372,701],[225,701]],[279,647]),
      room('master','Master|bedroom',[[522,548],[592,548],[592,701],[444,701],[444,589],[522,589]],[519,646]),
      room('hall','Upstairs|hallway',[[331,437],[444,437],[444,513],[406,513],[406,587],[444,587],[444,660],[372,660],[372,625],[331,625]],[368,483]),
    ],[[301,433,29,10],[368,431,31,12],[438,467,12,25],[321,516,14,28],[437,504,12,29],[326,600,10,24],[439,625,15,24]],[[406,515,36,71]],[]),
    Basement:floor([801,1033,255,253],[
      room('basement','Basement',[[821,1054],[992,1054],[992,1082],[1034,1082],[1034,1267],[821,1267]],[925,1232]),
    ],[],[[995,1089,36,121]],[],[[992,1082,0,109],[822,1191,70,0],[913,1191,79,0]]),
  },
  ridgeview:{
    'Ground floor':floor([69,801,601,530],[
      room('garage','Garage',[[94,828],[243,828],[243,1079],[167,1079],[167,1119],[94,1119]],[169,961]),
      box('toilet','Toilet',167,1079,76,40,true),
      room('hall','Hallway',[[94,1119],[243,1119],[243,1157],[181,1157],[181,1232],[94,1232]],[142,1169]),
      box('utility','Utility',181,1157,62,75,true),
      room('dining','Dining|room',[[243,1083],[300,1083],[300,1120],[345,1120],[345,1232],[243,1232]],[295,1176]),
      box('living','Living|room',238,1232,109,71,true),
      room('foyer','Foyer',[[346,1083],[417,1083],[417,1232],[346,1232],[346,1120]],[381,1182]),
      room('kitchen','Kitchen',[[417,1083],[532,1083],[532,1157],[574,1157],[574,1232],[417,1232]],[479,1150]),
      room('master','Master|bedroom',[[532,1043],[646,1043],[646,1307],[532,1307],[532,1232],[574,1232],[574,1157],[532,1157]],[590,1095]),
    ],[[195,1114,32,12],[172,1225,60,12],[236,1117,12,39],[287,1226,42,12],[341,1191,11,25],[413,1195,11,22],[562,1153,34,11]],[[301,1087,35,33],[350,1087,33,33]],[[368,1232,42,4]]),
    'First floor':floor([51,264,458,374],[
      box('bathroom','Bathroom',74,320,78,114,true),
      room('hall','Upstairs|hallway',[[152,289],[192,289],[192,470],[302,470],[302,507],[409,507],[409,546],[299,546],[299,562],[264,562],[264,546],[152,546]],[228,506]),
      box('boys',"Boy’s|bedroom",192,289,78,146),
      box('toilet','Upstairs|toilet',409,468,76,78,true),
      box('girls',"Girl’s|bedroom",152,546,112,66,true),
      box('teen',"Teen boy’s|bedroom",299,546,110,66,true),
    ],[[142,388,16,26],[186,372,12,24],[405,506,12,23],[193,540,32,12],[326,540,29,12]],[[302,471,81,36]],[]),
    Basement:floor([724,927,291,366],[room('basement','Basement',[[748,951],[993,951],[993,1271],[748,1271]],[890,1200])],[],[[751,1087,140,36]],[]),
  },
};

export function roomName(room:PlanRoom){return room.name.replaceAll('|',' ');}
export function sourceFrame(crop:Frame,width:number,height:number):Frame{return [crop[0]*width/100,crop[1]*height/100,crop[2]*width/100,crop[3]*height/100];}
export function convertPoint(point:Point,from:Frame,to:Frame):Point{return [(from[0]+point[0]*from[2]/100-to[0])/to[2]*100,(from[1]+point[1]*from[3]/100-to[1])/to[3]*100];}
export function containsPoint(point:Point,polygon:readonly Point[]) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i],b=polygon[j];
    if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function markerFrame(bounds:Frame,canonical:Frame,markers:readonly {x:number;y:number}[]):Frame {
  let [left,top,width,height]=bounds,right=left+width,bottom=top+height;
  for(const marker of markers){const x=canonical[0]+marker.x*canonical[2]/100,y=canonical[1]+marker.y*canonical[3]/100;left=Math.min(left,x-12);right=Math.max(right,x+12);top=Math.min(top,y-12);bottom=Math.max(bottom,y+12);}
  return [left,top,right-left,bottom-top];
}
