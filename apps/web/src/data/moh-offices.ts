// Subset of MOH offices surfaced on the public payments page so citizens
// who want to pay in cash know the nearest counter (and can open the
// location in Google Maps with one tap). Full national directory lives in
// /public/find-phi.

export interface MohOffice {
  name: string;
  addr: string;
  phone: string;
  district: string;
  lat: number;
  lng: number;
}

export const MOH_OFFICES: MohOffice[] = [
  { name: 'MOH Office — Colombo Central', addr: '555 Elvitigala Mawatha, Colombo 05',  phone: '011-2691111', district: 'Colombo',     lat: 6.8951, lng: 79.8716 },
  { name: 'MOH Office — Kaduwela',        addr: '21 MOH Lane, Kaduwela',              phone: '011-2538111', district: 'Colombo',     lat: 6.9333, lng: 79.9833 },
  { name: 'MOH Office — Dehiwala',        addr: '78 Galle Rd, Dehiwala',              phone: '011-2738294', district: 'Colombo',     lat: 6.8511, lng: 79.8650 },
  { name: 'MOH Office — Nugegoda',        addr: 'High Level Rd, Nugegoda',            phone: '011-2814555', district: 'Colombo',     lat: 6.8721, lng: 79.8895 },
  { name: 'MOH Office — Kandy',           addr: 'Dalada Veediya, Kandy',              phone: '081-2222271', district: 'Kandy',       lat: 7.2906, lng: 80.6337 },
  { name: 'MOH Office — Galle',           addr: 'Cripps Rd, Galle',                   phone: '091-2234555', district: 'Galle',       lat: 6.0535, lng: 80.2210 },
  { name: 'MOH Office — Negombo',         addr: 'Main St, Negombo',                   phone: '031-2222271', district: 'Gampaha',     lat: 7.2083, lng: 79.8358 },
  { name: 'MOH Office — Jaffna',          addr: 'Hospital Rd, Jaffna',                phone: '021-2222261', district: 'Jaffna',      lat: 9.6615, lng: 80.0255 },
];
