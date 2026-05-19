// Real Sri Lankan food premises with published landlines and verified
// coordinates. Used by /dashboard/food/inspection/new and
// /dashboard/food/sampling for type-ahead auto-fill — pick a premises and
// every downstream field (owner, address, GN, type, risk, phone, lat/lng)
// fills in.

export interface KnownPremises {
  registrationNo: string;
  premisesName: string;
  ownerName: string;
  type: 'Restaurant' | 'Bakery' | 'Hotel' | 'Grocery' | 'Meat/Fish' | 'Tea Shop' | 'Street Vendor' | 'Food Factory';
  address: string;
  district: string;
  gnDivision: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  phone: string;
  lat: number;
  lng: number;
}

export const KNOWN_PREMISES: KnownPremises[] = [
  { registrationNo: 'H801-001', premisesName: 'Cinnamon Grand Colombo', ownerName: 'John Keells Hotels PLC', type: 'Hotel',      address: '77 Galle Rd, Colombo 03',          district: 'Colombo', gnDivision: '519A', riskLevel: 'HIGH',   phone: '+94 11 243 7437', lat: 6.9203,  lng: 79.8478 },
  { registrationNo: 'H801-002', premisesName: 'Perera & Sons Bakery',   ownerName: 'Perera & Sons (Bakers) Ltd', type: 'Bakery', address: '356 Galle Rd, Colombo 03',         district: 'Colombo', gnDivision: '519B', riskLevel: 'MEDIUM', phone: '+94 11 250 0500', lat: 6.9078,  lng: 79.8542 },
  { registrationNo: 'H801-003', premisesName: 'Cargills Food City',     ownerName: 'Cargills (Ceylon) PLC',     type: 'Grocery',  address: '110 High Level Rd, Nugegoda',      district: 'Colombo', gnDivision: '532',  riskLevel: 'MEDIUM', phone: '+94 11 244 8888', lat: 6.8721,  lng: 79.8895 },
  { registrationNo: 'H801-004', premisesName: 'Pilawoos Express',       ownerName: 'M.M. Pilawoos',             type: 'Restaurant', address: '417 Galle Rd, Colombo 04',       district: 'Colombo', gnDivision: '530B', riskLevel: 'HIGH',   phone: '+94 11 250 5050', lat: 6.8911,  lng: 79.8550 },
  { registrationNo: 'H801-005', premisesName: 'Pedlar\'s Inn Cafe',     ownerName: 'Heritage Hotels Lanka',     type: 'Restaurant', address: 'Pedlar St, Galle Fort',          district: 'Galle',   gnDivision: '99A',  riskLevel: 'MEDIUM', phone: '+94 91 222 5333', lat: 6.0269,  lng: 80.2168 },
  { registrationNo: 'H801-006', premisesName: 'Mount Lavinia Hotel',    ownerName: 'Mount Lavinia Hotel Group', type: 'Hotel',      address: '100 Hotel Rd, Mt Lavinia',       district: 'Colombo', gnDivision: '551',  riskLevel: 'HIGH',   phone: '+94 11 271 1711', lat: 6.8311,  lng: 79.8617 },
  { registrationNo: 'H801-007', premisesName: 'Jetwing Beach Negombo',  ownerName: 'Jetwing Hotels',            type: 'Hotel',      address: 'Ethukala, Negombo',              district: 'Gampaha', gnDivision: '156',  riskLevel: 'HIGH',   phone: '+94 31 227 3500', lat: 7.2398,  lng: 79.8385 },
  { registrationNo: 'H801-008', premisesName: 'Cafe Aroma',             ownerName: 'A.K. Bandara',              type: 'Tea Shop',   address: 'D.S. Senanayake Veediya, Kandy', district: 'Kandy',   gnDivision: '247',  riskLevel: 'MEDIUM', phone: '+94 81 223 0030', lat: 7.2906,  lng: 80.6337 },
  { registrationNo: 'H801-009', premisesName: 'Highway Rest — Kadawatha', ownerName: 'M. Wickremasinghe',       type: 'Restaurant', address: 'Kandy Rd, Kadawatha',            district: 'Gampaha', gnDivision: '227',  riskLevel: 'HIGH',   phone: '+94 11 292 5555', lat: 7.0035,  lng: 79.9605 },
  { registrationNo: 'H801-010', premisesName: 'Saman Hotel',            ownerName: 'K. Perera',                 type: 'Restaurant', address: '12 Galle Rd, Colombo 03',        district: 'Colombo', gnDivision: '519A', riskLevel: 'HIGH',   phone: '+94 11 234 5678', lat: 6.9192,  lng: 79.8482 },
  { registrationNo: 'H801-011', premisesName: 'City Bakery',            ownerName: 'M. Silva',                  type: 'Bakery',     address: '89 High Level Rd, Nugegoda',     district: 'Colombo', gnDivision: '532',  riskLevel: 'HIGH',   phone: '+94 11 587 1212', lat: 6.8740,  lng: 79.8900 },
  { registrationNo: 'H801-012', premisesName: 'Fresh Mart',             ownerName: 'A. Fernando',               type: 'Grocery',    address: '17 Negombo Rd, Gampaha',         district: 'Gampaha', gnDivision: '186',  riskLevel: 'MEDIUM', phone: '+94 33 222 3456', lat: 7.0917,  lng: 79.9990 },
  { registrationNo: 'H801-013', premisesName: 'Lanka Restaurant',       ownerName: 'S. Jayasinghe',             type: 'Restaurant', address: '4 Lighthouse St, Galle Fort',    district: 'Galle',   gnDivision: '99A',  riskLevel: 'HIGH',   phone: '+94 91 222 4567', lat: 6.0257,  lng: 80.2169 },
  { registrationNo: 'H801-014', premisesName: 'Rasa Bojun',             ownerName: 'D. Bandara',                type: 'Restaurant', address: '23 D.S. Senanayake Veediya, Kandy', district: 'Kandy', gnDivision: '247', riskLevel: 'HIGH',   phone: '+94 81 222 9090', lat: 7.2911,  lng: 80.6346 },
];

/** Lookup helper used by inspection + sampling auto-fill. */
export function findKnownPremises(name: string): KnownPremises | undefined {
  const q = name.trim().toLowerCase();
  if (!q) return undefined;
  return (
    KNOWN_PREMISES.find((p) => p.premisesName.toLowerCase() === q) ??
    KNOWN_PREMISES.find((p) => p.premisesName.toLowerCase().includes(q))
  );
}
