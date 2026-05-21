// Factories registered in the Colombo district occupational-health register.
// Shared by the Occupational overview, the H1204 safety inspection (dropdown
// autofill) and Google-Maps links. Names/areas are real Colombo industrial
// zones; figures are illustrative.

export type FactoryScale = 'SMALL' | 'MEDIUM' | 'LARGE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ColomboFactory {
  id: string;
  name: string;
  type: string;
  scale: FactoryScale;
  workers: number;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  risk: RiskLevel;
  lastInspection: string;
}

const scaleOf = (w: number): FactoryScale => (w >= 250 ? 'LARGE' : w >= 50 ? 'MEDIUM' : 'SMALL');

const f = (id: string, name: string, type: string, workers: number, address: string, phone: string, lat: number, lng: number, risk: RiskLevel, lastInspection: string): ColomboFactory =>
  ({ id, name, type, scale: scaleOf(workers), workers, address, phone, lat, lng, risk, lastInspection });

export const COLOMBO_FACTORIES: ColomboFactory[] = [
  f('FAC-001', 'Lanka Textile Mills',      'Textile',         450, 'Galle Rd, Ratmalana',          '+94 11 263 5000', 6.8200, 79.8860, 'HIGH',   '2026-04-10'),
  f('FAC-002', 'Ceylon Rubber Works',      'Rubber',          120, 'New Galle Rd, Moratuwa',       '+94 11 264 5200', 6.7740, 79.8820, 'MEDIUM', '2026-04-02'),
  f('FAC-003', 'Perera Mechanics',         'Workshop',         15, 'Hill St, Dehiwala',            '+94 11 271 3400', 6.8510, 79.8650, 'LOW',    '2026-03-22'),
  f('FAC-004', 'Colombo Chemicals Ltd',    'Chemical',        320, 'Biyagama Rd, Kelaniya',        '+94 11 291 5500', 6.9560, 79.9220, 'HIGH',   '2026-03-30'),
  f('FAC-005', 'Sunrise Bakery Factory',   'Food Processing',  85, 'High Level Rd, Nugegoda',      '+94 11 281 4555', 6.8721, 79.8895, 'MEDIUM', '2026-04-08'),
  f('FAC-006', 'MAS Active (Linea Aqua)',  'Apparel',         600, 'Borupana Rd, Ratmalana',       '+94 11 263 7100', 6.8170, 79.8830, 'HIGH',   '2026-04-15'),
  f('FAC-007', 'Brandix Casualwear',       'Apparel',         700, 'Templers Rd, Mount Lavinia',   '+94 11 262 8000', 6.8290, 79.8650, 'HIGH',   '2026-04-18'),
  f('FAC-008', 'Ceylon Biscuits (Munchee)','Food Processing', 400, 'Makumbura, Pannipitiya',       '+94 11 275 0200', 6.8440, 79.9540, 'MEDIUM', '2026-03-26'),
  f('FAC-009', 'CIC Paints',               'Chemical',         90, 'Dutugemunu St, Kohuwala',      '+94 11 282 1100', 6.8650, 79.8830, 'HIGH',   '2026-04-04'),
  f('FAC-010', 'Damro Furniture',          'Furniture',       250, 'Moratuwa Industrial Estate',   '+94 11 264 9300', 6.7720, 79.8900, 'MEDIUM', '2026-03-19'),
  f('FAC-011', 'Singer Industries',        'Electronics',     180, 'Borupana Rd, Ratmalana',       '+94 11 263 6600', 6.8185, 79.8845, 'MEDIUM', '2026-04-06'),
  f('FAC-012', 'Prima Flour Mill',         'Food Processing', 210, 'Bloemendhal Rd, Colombo 15',   '+94 11 252 3000', 6.9620, 79.8680, 'MEDIUM', '2026-03-12'),
];

export const FACTORY_NAMES = COLOMBO_FACTORIES.map((x) => x.name);
export const mapsHref = (x: { name: string; address: string; lat?: number; lng?: number }) =>
  x.lat && x.lng
    ? `https://www.google.com/maps/search/?api=1&query=${x.lat},${x.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${x.name}, ${x.address}, Sri Lanka`)}`;
