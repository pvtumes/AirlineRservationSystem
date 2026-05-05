import { AIRLINES } from '../data/flights.js';

const FLIGHT_API_BASE = '/flight-api';

/* helpers unchanged */
function toMinutes(t){ if(!t) return 0; const[a,b]=t.split(':').map(Number); return a*60+b; }
function nowMinutes(){const d=new Date();return d.getHours()*60+d.getMinutes();}
function seedRand(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
export const getGateForFlight=id=>`${['A','B','C','D','E'][seedRand(id)%5]}${seedRand(id)%24+1}`;
export const getTerminalForFlight=id=>`T${seedRand(id)%3+1}`;

function isDelayed(id){return seedRand(id)%4===1;}
function getDelayMinutes(id){return((seedRand(id)%6)+1)*10;}

export function computeStatus(flight){
  const dep=toMinutes(flight.departureTime);
  const arr=dep+(flight.durationMin??0);
  const now=nowMinutes();
  const delayed=isDelayed(flight.id);
  const d=delayed?getDelayMinutes(flight.id):0;
  const effDep=dep+d, effArr=arr+d;
  const u=effDep-now, s=now-effDep;

  let k,l,c,desc;
  if(u>180){k='scheduled';l=delayed?'Delayed':'Scheduled';c=delayed?'amber':'blue';desc=delayed?`Delayed by ${d} min`:'Scheduled';}
  else if(u>60){k=delayed?'delayed':'on-time';l=delayed?'Delayed':'On Time';c=delayed?'amber':'emerald';desc='On time';}
  else if(u>15){k='boarding-soon';l='Boarding Soon';c='violet';desc='Boarding soon';}
  else if(u>=-15){k='boarding';l='Boarding';c='indigo';desc='Boarding now';}
  else if(now<effArr){k='departed';l='Departed';c='slate';desc='In air';}
  else{k='landed';l='Landed';c='emerald';desc='Arrived';}

  return { statusKey:k,label:l,color:c,description:desc,
    gate:getGateForFlight(flight.id),
    terminal:getTerminalForFlight(flight.id),
  };
}

async function fetchFlightById(id){
  const res=await fetch(`${FLIGHT_API_BASE}/getflight`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({flight_id:id})
  });
  const data=await res.json();
  if(!data.success||!data.flight?.length) throw new Error(`Flight "${id}" not found`);
  const f=data.flight[0];
  return {
    id:f.flight_id,
    flightNo:f.flight_id,
    airlineCode:f.airline_code,
    airline:AIRLINES[f.airline_code],
    from:f.source,
    to:f.destination,
    departureTime:f.departure_time.slice(0,5),
    arrivalTime:f.arrival_time.slice(0,5),
    durationMin:f.duration_minutes,
    stops:0
  };
}

export async function getFlightStatusById(id){
  const flight=await fetchFlightById(id);
  return { flight, status:computeStatus(flight) };
}

export async function getFlightStatusByNo(no){
  return getFlightStatusById(no.split(' ').pop().padStart(4,'F'));
}

export async function getAllFlightStatuses(){
  throw new Error('Listing disabled for API-backed mode');
}