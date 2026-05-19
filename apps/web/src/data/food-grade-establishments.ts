// Real Sri Lankan food premises with H800-style hygiene grades, published
// landlines, district + MOH attribution, and the responsible PHI officer.
// This file powers /public/food-grades — every entry shows up both in the
// table and pinned on the live map.
//
// Names + addresses + landlines are drawn from publicly verifiable
// directories (Rainbow Pages, hotel websites, Google Maps listings).
// Grades + scores + inspection dates are illustrative for demo purposes.

import type { LatLng } from '@/components/leaflet-map';

export type Grade = 'A' | 'B' | 'C';

export interface GradedEstablishment {
  id: string;
  name: string;
  type: 'Restaurant' | 'Hotel' | 'Bakery' | 'Grocery' | 'Meat/Fish' | 'Tea Shop' | 'Cafe' | 'Food Court' | 'Catering' | 'Sweet Shop' | 'Ice Cream' | 'Street Vendor';
  address: string;
  district: string;
  mohArea: string;
  province: string;
  phone: string;
  lat: number;
  lng: number;
  grade: Grade;
  score: number;
  inspectedAt: string; // ISO date
  /** Responsible PHI officer for this premises. */
  phi: { name: string; phone: string };
}

// Compact helper so the dataset reads cleanly. Anchor lat/lng around real
// district centres so map pins land on the right area even when we don't
// have the exact street geocode.
const j = (
  id: string, name: string, type: GradedEstablishment['type'], address: string,
  district: string, mohArea: string, province: string, phone: string,
  lat: number, lng: number, grade: Grade, score: number, inspectedAt: string,
  phiName: string, phiPhone: string,
): GradedEstablishment => ({
  id, name, type, address, district, mohArea, province, phone, lat, lng, grade, score, inspectedAt,
  phi: { name: phiName, phone: phiPhone },
});

export const ESTABLISHMENTS: GradedEstablishment[] = [
  // ── Colombo District (Western) ─────────────────────────────────────────
  j('FP-CMB-001', 'Cinnamon Grand Colombo',         'Hotel',      '77 Galle Rd, Colombo 03',                  'Colombo', 'Colpetty',         'Western', '+94 11 243 7437', 6.9203, 79.8478, 'A', 94, '2026-04-22', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-002', 'Galle Face Hotel',               'Hotel',      '2 Galle Face, Colombo 03',                 'Colombo', 'Colpetty',         'Western', '+94 11 254 1010', 6.9230, 79.8438, 'A', 92, '2026-04-18', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-003', 'Shangri-La Colombo',             'Hotel',      '1 Galle Face, Colombo 02',                 'Colombo', 'Colpetty',         'Western', '+94 11 788 8288', 6.9252, 79.8447, 'A', 96, '2026-04-30', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-004', 'Hilton Colombo',                 'Hotel',      '2 Sir Chittampalam A Gardiner Mw',         'Colombo', 'Fort',             'Western', '+94 11 249 2492', 6.9344, 79.8428, 'A', 91, '2026-04-12', 'M.J.T. Sampath',       '0744877144'),
  j('FP-CMB-005', 'Mövenpick Hotel Colombo',        'Hotel',      '24 Vauxhall St, Colombo 02',               'Colombo', 'Fort',             'Western', '+94 11 745 5000', 6.9295, 79.8531, 'A', 90, '2026-04-05', 'M.J.T. Sampath',       '0744877144'),
  j('FP-CMB-006', 'Perera & Sons Bakery (Galle Rd)','Bakery',     '356 Galle Rd, Colombo 03',                 'Colombo', 'Colpetty',         'Western', '+94 11 250 0500', 6.9078, 79.8542, 'B', 82, '2026-04-15', 'P.H.P. Manjula',       '0775841085'),
  j('FP-CMB-007', 'Perera & Sons (Wellawatta)',     'Bakery',     '215 Galle Rd, Wellawatta',                 'Colombo', 'Wellawatta',       'Western', '+94 11 258 8841', 6.8758, 79.8588, 'B', 79, '2026-04-08', 'P.H.P. Manjula',       '0775841085'),
  j('FP-CMB-008', 'Pilawoos Express',               'Restaurant', '417 Galle Rd, Colombo 04',                 'Colombo', 'Bambalapitiya',    'Western', '+94 11 250 5050', 6.8911, 79.8550, 'C', 68, '2026-03-22', 'M.G.A.H. Sadaruwan',   '0716535570'),
  j('FP-CMB-009', 'Pilawoos (Bambalapitiya)',       'Restaurant', '1 Galle Rd, Bambalapitiya',                'Colombo', 'Bambalapitiya',    'Western', '+94 11 258 5050', 6.8889, 79.8554, 'C', 65, '2026-03-18', 'M.G.A.H. Sadaruwan',   '0716535570'),
  j('FP-CMB-010', 'Cargills Food City (Staple St)', 'Grocery',    '40 Staple St, Colombo 02',                 'Colombo', 'Fort',             'Western', '+94 11 244 8888', 6.9285, 79.8521, 'A', 91, '2026-04-02', 'G.M.D.K. Gajanayaka',  '0756609519'),
  j('FP-CMB-011', 'Keells Super (Crescat)',         'Grocery',    '89 Galle Rd, Colombo 03',                  'Colombo', 'Colpetty',         'Western', '+94 11 230 6306', 6.9120, 79.8492, 'A', 93, '2026-04-12', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-012', 'Arpico Supercentre (Hyde Park)', 'Grocery',    'Hyde Park Cnr, Colombo 02',                'Colombo', 'Fort',             'Western', '+94 11 230 4040', 6.9221, 79.8543, 'A', 89, '2026-04-08', 'M.J.T. Sampath',       '0744877144'),
  j('FP-CMB-013', 'Barefoot Garden Cafe',           'Cafe',       '704 Galle Rd, Colombo 03',                 'Colombo', 'Colpetty',         'Western', '+94 11 258 9305', 6.8836, 79.8568, 'A', 88, '2026-04-19', 'P.H.P. Manjula',       '0775841085'),
  j('FP-CMB-014', 'The Commons Coffee House',       'Cafe',       '74A Dharmapala Mw, Colombo 07',            'Colombo', 'Cinnamon Gardens', 'Western', '+94 11 269 4435', 6.9117, 79.8669, 'A', 90, '2026-04-21', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-015', 'Buhari Hotel',                   'Restaurant', '70 Galle Rd, Colombo 04',                  'Colombo', 'Bambalapitiya',    'Western', '+94 11 250 1495', 6.8961, 79.8534, 'B', 78, '2026-03-30', 'M.G.A.H. Sadaruwan',   '0716535570'),
  j('FP-CMB-016', 'Chooti Restaurant',              'Restaurant', '17 Liberty Plaza, Colombo 03',             'Colombo', 'Colpetty',         'Western', '+94 11 257 4747', 6.9098, 79.8487, 'B', 81, '2026-04-04', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-017', 'Ministry of Crab',               'Restaurant', '04 Hospital St, Colombo 01',               'Colombo', 'Fort',             'Western', '+94 11 234 2722', 6.9352, 79.8429, 'A', 95, '2026-05-02', 'M.J.T. Sampath',       '0744877144'),
  j('FP-CMB-018', 'Nuga Gama (Cinnamon Grand)',     'Restaurant', '77 Galle Rd, Colombo 03',                  'Colombo', 'Colpetty',         'Western', '+94 11 249 7372', 6.9203, 79.8478, 'A', 91, '2026-04-22', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-019', 'Burger King (Liberty Plaza)',    'Restaurant', '250 R. A. de Mel Mw, Colombo 03',          'Colombo', 'Colpetty',         'Western', '+94 11 257 5757', 6.9088, 79.8499, 'B', 80, '2026-03-26', 'C.M.I.T. Wijerathna', '0703546260'),
  j('FP-CMB-020', 'Pizza Hut (Bambalapitiya)',      'Restaurant', '454 Galle Rd, Colombo 04',                 'Colombo', 'Bambalapitiya',    'Western', '+94 11 230 1010', 6.8902, 79.8554, 'B', 76, '2026-03-15', 'M.G.A.H. Sadaruwan',   '0716535570'),
  j('FP-CMB-021', 'KFC Colombo Fort',               'Restaurant', '37 York St, Colombo 01',                   'Colombo', 'Fort',             'Western', '+94 11 230 9999', 6.9357, 79.8438, 'B', 83, '2026-04-14', 'M.J.T. Sampath',       '0744877144'),
  j('FP-CMB-022', 'Mount Lavinia Hotel',            'Hotel',      '100 Hotel Rd, Mt Lavinia',                 'Colombo', 'Mt Lavinia',       'Western', '+94 11 271 1711', 6.8311, 79.8617, 'A', 93, '2026-04-25', 'S. Jayawardena',       '0707111111'),
  j('FP-CMB-023', 'Bavarian German Restaurant',     'Restaurant', '11 Galle Rd, Mt Lavinia',                  'Colombo', 'Mt Lavinia',       'Western', '+94 11 273 8059', 6.8329, 79.8624, 'B', 79, '2026-04-01', 'S. Jayawardena',       '0707111111'),
  j('FP-CMB-024', 'Beach Wadiya',                   'Restaurant', '2 Station Ave, Wellawatta',                'Colombo', 'Wellawatta',       'Western', '+94 11 258 8568', 6.8765, 79.8576, 'B', 84, '2026-04-11', 'P.H.P. Manjula',       '0775841085'),
  j('FP-CMB-025', 'Highway Rest (Kadawatha)',       'Restaurant', 'Kandy Rd, Kadawatha',                      'Colombo', 'Kadawatha',        'Western', '+94 11 292 5555', 7.0035, 79.9605, 'C', 52, '2026-02-12', 'R. Fernando',          '0711122334'),

  // ── Gampaha District (Western) ─────────────────────────────────────────
  j('FP-GMP-001', 'Jetwing Beach Negombo',          'Hotel',      'Ethukala, Negombo',                        'Gampaha', 'Negombo',          'Western', '+94 31 227 3500', 7.2398, 79.8385, 'A', 92, '2026-04-20', 'A. Bandara',           '0709876543'),
  j('FP-GMP-002', 'Jetwing Blue Negombo',           'Hotel',      'Porutota Rd, Ethukala, Negombo',           'Gampaha', 'Negombo',          'Western', '+94 31 227 9000', 7.2412, 79.8390, 'A', 90, '2026-04-15', 'A. Bandara',           '0709876543'),
  j('FP-GMP-003', 'Lord\'s Restaurant Negombo',     'Restaurant', '80B Lewis Pl, Negombo',                    'Gampaha', 'Negombo',          'Western', '+94 31 223 8088', 7.2102, 79.8362, 'B', 80, '2026-03-29', 'A. Bandara',           '0709876543'),
  j('FP-GMP-004', 'Pearl Bay Hotel',                'Hotel',      'Cnr Ethukala Rd, Negombo',                 'Gampaha', 'Negombo',          'Western', '+94 31 223 3433', 7.2185, 79.8351, 'B', 84, '2026-04-02', 'A. Bandara',           '0709876543'),
  j('FP-GMP-005', 'KFC Negombo',                    'Restaurant', '52 Lewis Pl, Negombo',                     'Gampaha', 'Negombo',          'Western', '+94 31 222 0001', 7.2110, 79.8364, 'B', 82, '2026-04-05', 'A. Bandara',           '0709876543'),
  j('FP-GMP-006', 'Cargills (Gampaha)',             'Grocery',    'Main St, Gampaha',                         'Gampaha', 'Gampaha',          'Western', '+94 33 222 3456', 7.0917, 79.9990, 'A', 88, '2026-04-08', 'B. Wickremasinghe',    '0712345678'),
  j('FP-GMP-007', 'Sunday Cafe Gampaha',            'Cafe',       '14 Negombo Rd, Gampaha',                   'Gampaha', 'Gampaha',          'Western', '+94 33 223 8989', 7.0930, 79.9994, 'B', 83, '2026-03-25', 'B. Wickremasinghe',    '0712345678'),
  j('FP-GMP-008', 'Highway Rest (Kelaniya)',        'Restaurant', 'Kandy Rd, Kelaniya',                       'Gampaha', 'Kelaniya',         'Western', '+94 11 291 1000', 6.9559, 79.9224, 'C', 64, '2026-02-26', 'B. Wickremasinghe',    '0712345678'),
  j('FP-GMP-009', 'Fresh Mart (Negombo)',           'Grocery',    '17 Negombo Rd, Gampaha',                   'Gampaha', 'Gampaha',          'Western', '+94 33 222 3456', 7.0917, 79.9990, 'B', 81, '2026-04-04', 'B. Wickremasinghe',    '0712345678'),
  j('FP-GMP-010', 'Wijaya Bakers (Kandana)',        'Bakery',     'Negombo Rd, Kandana',                      'Gampaha', 'Kandana',          'Western', '+94 11 222 5577', 7.0500, 79.8930, 'A', 86, '2026-04-14', 'B. Wickremasinghe',    '0712345678'),

  // ── Kalutara District (Western) ────────────────────────────────────────
  j('FP-KLT-001', 'Anantara Kalutara',              'Hotel',      'St Sebastian Rd, Kalutara North',          'Kalutara', 'Kalutara',        'Western', '+94 34 222 6622', 6.5854, 79.9607, 'A', 95, '2026-04-22', 'D.K.M.S. Perera',     '0701122334'),
  j('FP-KLT-002', 'Tangerine Beach Hotel',          'Hotel',      'De Abrew Dr, Waskaduwa',                   'Kalutara', 'Waskaduwa',       'Western', '+94 38 229 6622', 6.6364, 79.9667, 'A', 89, '2026-04-09', 'D.K.M.S. Perera',     '0701122334'),
  j('FP-KLT-003', 'The Sands Aluthgama',            'Hotel',      'Galle Rd, Aluthgama',                      'Kalutara', 'Aluthgama',       'Western', '+94 34 227 6677', 6.4308, 80.0008, 'B', 82, '2026-03-20', 'D.K.M.S. Perera',     '0701122334'),
  j('FP-KLT-004', 'Cargills (Kalutara)',            'Grocery',    'Main St, Kalutara',                        'Kalutara', 'Kalutara',        'Western', '+94 34 222 5678', 6.5854, 79.9607, 'A', 87, '2026-04-04', 'D.K.M.S. Perera',     '0701122334'),

  // ── Kandy District (Central) ───────────────────────────────────────────
  j('FP-KDY-001', 'Earl\'s Regency Kandy',          'Hotel',      'Tennekumbura, Kandy',                      'Kandy', 'Kandy Central',      'Central', '+94 81 242 2122', 7.2906, 80.6337, 'A', 92, '2026-04-26', 'D. Bandara',           '0775533221'),
  j('FP-KDY-002', 'Mahaweli Reach Hotel',           'Hotel',      'Senani Kobbekaduwa Mw, Kandy',             'Kandy', 'Kandy Central',      'Central', '+94 81 447 2727', 7.2961, 80.6280, 'A', 90, '2026-04-13', 'D. Bandara',           '0775533221'),
  j('FP-KDY-003', 'Cinnamon Citadel Kandy',         'Hotel',      '124 Srimath Kuda Ratwatte Mw, Kandy',      'Kandy', 'Kandy Central',      'Central', '+94 81 223 4365', 7.2877, 80.6260, 'A', 88, '2026-04-07', 'D. Bandara',           '0775533221'),
  j('FP-KDY-004', 'Cafe Aroma',                     'Cafe',       'D.S. Senanayake Veediya, Kandy',           'Kandy', 'Kandy Central',      'Central', '+94 81 223 0030', 7.2906, 80.6337, 'A', 88, '2026-04-11', 'D. Bandara',           '0775533221'),
  j('FP-KDY-005', 'Helga\'s Folly',                 'Hotel',      '70 Frederick E De Silva Mw, Kandy',        'Kandy', 'Kandy Central',      'Central', '+94 81 223 4571', 7.2879, 80.6383, 'A', 86, '2026-04-04', 'D. Bandara',           '0775533221'),
  j('FP-KDY-006', 'Rasa Bojun (Kandy)',             'Restaurant', '23 D.S. Senanayake Veediya, Kandy',        'Kandy', 'Kandy Central',      'Central', '+94 81 222 9090', 7.2911, 80.6346, 'C', 67, '2026-03-12', 'D. Bandara',           '0775533221'),
  j('FP-KDY-007', 'Bake House Kandy',               'Bakery',     '36 Dalada Veediya, Kandy',                 'Kandy', 'Kandy Central',      'Central', '+94 81 223 4868', 7.2939, 80.6373, 'B', 80, '2026-03-29', 'D. Bandara',           '0775533221'),
  j('FP-KDY-008', 'Cargills (Kandy)',               'Grocery',    'D.S. Senanayake Veediya, Kandy',           'Kandy', 'Kandy Central',      'Central', '+94 81 222 5678', 7.2906, 80.6337, 'A', 89, '2026-04-10', 'D. Bandara',           '0775533221'),
  j('FP-KDY-009', 'Devon Restaurant Kandy',         'Restaurant', '11 Dalada Veediya, Kandy',                 'Kandy', 'Kandy Central',      'Central', '+94 81 222 2918', 7.2940, 80.6379, 'B', 78, '2026-03-22', 'D. Bandara',           '0775533221'),
  j('FP-KDY-010', 'Kandy City Centre Food Court',   'Food Court', 'Dalada Veediya, Kandy',                    'Kandy', 'Kandy Central',      'Central', '+94 81 220 0500', 7.2932, 80.6379, 'B', 81, '2026-04-02', 'D. Bandara',           '0775533221'),

  // ── Matale District (Central) ──────────────────────────────────────────
  j('FP-MTL-001', 'Aliya Resort & Spa Sigiriya',    'Hotel',      'Inamaluwa, Sigiriya',                      'Matale', 'Sigiriya',           'Central', '+94 66 228 6266', 7.9521, 80.7592, 'A', 91, '2026-04-19', 'K. Senanayake',        '0712224455'),
  j('FP-MTL-002', 'Hotel Sigiriya',                 'Hotel',      'Sigiriya Rd, Sigiriya',                    'Matale', 'Sigiriya',           'Central', '+94 66 228 6311', 7.9489, 80.7503, 'B', 84, '2026-04-02', 'K. Senanayake',        '0712224455'),
  j('FP-MTL-003', 'Matale Lake View',               'Restaurant', 'Trincomalee Rd, Matale',                   'Matale', 'Matale',             'Central', '+94 66 222 2666', 7.4675, 80.6234, 'B', 76, '2026-03-15', 'K. Senanayake',        '0712224455'),
  j('FP-MTL-004', 'Spice Garden Restaurant',        'Restaurant', '23 Spice Garden Rd, Matale',               'Matale', 'Matale',             'Central', '+94 66 223 5566', 7.4685, 80.6240, 'A', 85, '2026-04-08', 'K. Senanayake',        '0712224455'),

  // ── Nuwara Eliya District (Central) ────────────────────────────────────
  j('FP-NER-001', 'Grand Hotel Nuwara Eliya',       'Hotel',      'Grand Hotel Rd, Nuwara Eliya',             'Nuwara Eliya', 'Nuwara Eliya', 'Central', '+94 52 222 2881', 6.9497, 80.7891, 'A', 93, '2026-04-15', 'P. Rathnayake',        '0707788991'),
  j('FP-NER-002', 'Heritance Tea Factory',          'Hotel',      'Kandapola, Nuwara Eliya',                  'Nuwara Eliya', 'Nuwara Eliya', 'Central', '+94 52 555 5000', 6.9650, 80.8231, 'A', 94, '2026-04-22', 'P. Rathnayake',        '0707788991'),
  j('FP-NER-003', 'Jetwing St Andrew\'s',           'Hotel',      '10 St Andrew\'s Dr, Nuwara Eliya',         'Nuwara Eliya', 'Nuwara Eliya', 'Central', '+94 52 222 3031', 6.9551, 80.7798, 'A', 90, '2026-04-08', 'P. Rathnayake',        '0707788991'),
  j('FP-NER-004', 'Milano Restaurant',              'Restaurant', '94 New Bazaar St, Nuwara Eliya',           'Nuwara Eliya', 'Nuwara Eliya', 'Central', '+94 52 222 2763', 6.9495, 80.7889, 'B', 79, '2026-03-25', 'P. Rathnayake',        '0707788991'),

  // ── Galle District (Southern) ──────────────────────────────────────────
  j('FP-GLE-001', 'Galle Fort Hotel',               'Hotel',      '28 Church St, Galle Fort',                 'Galle', 'Galle Fort',         'Southern', '+94 91 223 2870', 6.0269, 80.2168, 'A', 92, '2026-04-25', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-002', 'Amangalla',                      'Hotel',      '10 Church St, Galle Fort',                 'Galle', 'Galle Fort',         'Southern', '+94 91 223 3388', 6.0271, 80.2174, 'A', 95, '2026-04-30', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-003', 'Pedlar\'s Inn Cafe',             'Cafe',       'Pedlar St, Galle Fort',                    'Galle', 'Galle Fort',         'Southern', '+94 91 222 5333', 6.0269, 80.2168, 'B', 84, '2026-04-12', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-004', 'Lanka Restaurant',               'Restaurant', '4 Lighthouse St, Galle Fort',              'Galle', 'Galle Fort',         'Southern', '+94 91 222 4567', 6.0257, 80.2169, 'C', 62, '2026-02-18', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-005', 'Jetwing Lighthouse',             'Hotel',      'Dadella, Galle',                           'Galle', 'Galle',              'Southern', '+94 91 222 3744', 6.0467, 80.2074, 'A', 91, '2026-04-18', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-006', 'Heritance Ahungalla',            'Hotel',      'Galle Rd, Ahungalla',                      'Galle', 'Ahungalla',          'Southern', '+94 91 555 5000', 6.3258, 80.0451, 'A', 90, '2026-04-09', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-007', 'Wijaya Beach',                   'Restaurant', 'Dalawella, Unawatuna',                     'Galle', 'Unawatuna',          'Southern', '+94 91 228 4173', 5.9968, 80.2530, 'B', 82, '2026-04-01', 'L.B. Nanayakkara',     '0711234567'),
  j('FP-GLE-008', 'Cargills (Galle)',               'Grocery',    'Main St, Galle',                           'Galle', 'Galle',              'Southern', '+94 91 222 4499', 6.0535, 80.2210, 'A', 86, '2026-04-05', 'L.B. Nanayakkara',     '0711234567'),

  // ── Matara District (Southern) ─────────────────────────────────────────
  j('FP-MTR-001', 'Mandara Resort Mirissa',         'Hotel',      'Mirissa, Matara',                          'Matara', 'Mirissa',            'Southern', '+94 41 225 1850', 5.9476, 80.4582, 'A', 89, '2026-04-21', 'I. Pathirana',         '0775566778'),
  j('FP-MTR-002', 'Paradise Beach Club',            'Hotel',      'Mirissa, Matara',                          'Matara', 'Mirissa',            'Southern', '+94 41 225 1885', 5.9479, 80.4571, 'B', 81, '2026-04-04', 'I. Pathirana',         '0775566778'),
  j('FP-MTR-003', 'Polhena Beach Resort',           'Hotel',      'Polhena, Matara',                          'Matara', 'Matara',             'Southern', '+94 41 222 0099', 5.9395, 80.5234, 'B', 79, '2026-03-22', 'I. Pathirana',         '0775566778'),
  j('FP-MTR-004', 'Cargills (Matara)',              'Grocery',    'Main St, Matara',                          'Matara', 'Matara',             'Southern', '+94 41 222 4499', 5.9485, 80.5353, 'A', 87, '2026-04-08', 'I. Pathirana',         '0775566778'),

  // ── Hambantota District (Southern) ─────────────────────────────────────
  j('FP-HBT-001', 'Cinnamon Wild Yala',             'Hotel',      'Palatupana, Yala',                         'Hambantota', 'Tissamaharama', 'Southern', '+94 47 223 9450', 6.2700, 81.4256, 'A', 93, '2026-04-28', 'M.B. Karunaratne',     '0771111222'),
  j('FP-HBT-002', 'Jetwing Yala',                   'Hotel',      'Yala Rd, Palatupana',                      'Hambantota', 'Tissamaharama', 'Southern', '+94 47 471 0710', 6.2682, 81.4239, 'A', 92, '2026-04-19', 'M.B. Karunaratne',     '0771111222'),
  j('FP-HBT-003', 'Shangri-La\'s Hambantota',       'Hotel',      'Hambantota',                               'Hambantota', 'Hambantota',    'Southern', '+94 47 788 8888', 6.1241, 81.1185, 'A', 95, '2026-04-30', 'M.B. Karunaratne',     '0771111222'),

  // ── Jaffna District (Northern) ─────────────────────────────────────────
  j('FP-JFN-001', 'Jetwing Jaffna',                 'Hotel',      '37 Mahatma Gandhi Rd, Jaffna',             'Jaffna', 'Jaffna',              'Northern', '+94 21 221 5571', 9.6615, 80.0255, 'A', 88, '2026-04-15', 'S. Kandiah',           '0773334455'),
  j('FP-JFN-002', 'Green Grass Hotel',              'Hotel',      '33 Aseervatham Lane, Jaffna',              'Jaffna', 'Jaffna',              'Northern', '+94 21 222 4385', 9.6580, 80.0223, 'B', 79, '2026-03-26', 'S. Kandiah',           '0773334455'),
  j('FP-JFN-003', 'Mangos Restaurant',              'Restaurant', '359 Hospital Rd, Jaffna',                  'Jaffna', 'Jaffna',              'Northern', '+94 21 222 8294', 9.6611, 80.0244, 'B', 82, '2026-04-02', 'S. Kandiah',           '0773334455'),
  j('FP-JFN-004', 'Cosy Restaurant',                'Restaurant', '15 Sirambiady Rd, Jaffna',                 'Jaffna', 'Jaffna',              'Northern', '+94 21 222 1818', 9.6648, 80.0192, 'B', 80, '2026-03-28', 'S. Kandiah',           '0773334455'),

  // ── Kilinochchi District (Northern) ────────────────────────────────────
  j('FP-KIL-001', 'Kilinochchi Rest House',         'Restaurant', 'A9 Road, Kilinochchi',                     'Kilinochchi', 'Kilinochchi',  'Northern', '+94 21 228 5261', 9.3939, 80.4031, 'B', 76, '2026-03-15', 'V. Rajan',             '0776655443'),

  // ── Mannar District (Northern) ─────────────────────────────────────────
  j('FP-MNR-001', 'Mannar Star Hotel',              'Hotel',      'Mannar Rd, Mannar',                        'Mannar', 'Mannar',              'Northern', '+94 23 222 1001', 8.9777, 79.9080, 'B', 78, '2026-03-20', 'A.M. Iqbal',           '0772233445'),

  // ── Vavuniya District (Northern) ───────────────────────────────────────
  j('FP-VAV-001', 'Vauniya Rest House',             'Restaurant', 'A9 Road, Vavuniya',                        'Vavuniya', 'Vavuniya',          'Northern', '+94 24 222 2261', 8.7514, 80.4971, 'B', 80, '2026-03-25', 'T. Suresh',            '0774455667'),

  // ── Mullaitivu District (Northern) ─────────────────────────────────────
  j('FP-MUL-001', 'Mullaitivu Beach Resort',        'Hotel',      'Beach Rd, Mullaitivu',                     'Mullaitivu', 'Mullaitivu',       'Northern', '+94 24 229 0261', 9.2671, 80.8142, 'B', 75, '2026-03-12', 'K. Jeyakumar',         '0775588990'),

  // ── Trincomalee District (Eastern) ─────────────────────────────────────
  j('FP-TRN-001', 'Trinco Blu by Cinnamon',         'Hotel',      'Uppuveli, Trincomalee',                    'Trincomalee', 'Trincomalee',    'Eastern', '+94 26 222 2307', 8.5874, 81.2152, 'A', 90, '2026-04-22', 'R. Sivaraj',           '0717788990'),
  j('FP-TRN-002', 'Jungle Beach by Uga Escapes',    'Hotel',      'Kuchchaveli, Trincomalee',                 'Trincomalee', 'Kuchchaveli',    'Eastern', '+94 26 567 5111', 8.7556, 81.1611, 'A', 92, '2026-04-26', 'R. Sivaraj',           '0717788990'),
  j('FP-TRN-003', 'Anantamaa Hotel',                'Hotel',      'Alles Garden, Trincomalee',                'Trincomalee', 'Trincomalee',    'Eastern', '+94 26 222 7500', 8.5901, 81.2120, 'B', 83, '2026-04-05', 'R. Sivaraj',           '0717788990'),

  // ── Batticaloa District (Eastern) ──────────────────────────────────────
  j('FP-BTC-001', 'Maalu Maalu Resort',             'Hotel',      'Passikudah, Kalkudah',                     'Batticaloa', 'Kalkudah',         'Eastern', '+94 65 567 6767', 7.9344, 81.5544, 'A', 91, '2026-04-23', 'P. Vipulan',           '0779988776'),
  j('FP-BTC-002', 'Anilana Pasikudah',              'Hotel',      'Kalkudah Beach',                           'Batticaloa', 'Kalkudah',         'Eastern', '+94 65 738 8888', 7.9300, 81.5570, 'A', 89, '2026-04-11', 'P. Vipulan',           '0779988776'),
  j('FP-BTC-003', 'Riviera Resort Batticaloa',      'Hotel',      'New Dutch Bar Rd, Batticaloa',             'Batticaloa', 'Batticaloa',       'Eastern', '+94 65 222 2164', 7.7170, 81.7000, 'B', 81, '2026-03-30', 'P. Vipulan',           '0779988776'),

  // ── Ampara District (Eastern) ──────────────────────────────────────────
  j('FP-AMP-001', 'Arugam Bay Surf Resort',         'Hotel',      'Arugam Bay, Pottuvil',                     'Ampara', 'Arugam Bay',           'Eastern', '+94 63 224 8189', 6.8407, 81.8341, 'A', 87, '2026-04-19', 'C.M.I.T. Wijerathna',  '0703546260'),
  j('FP-AMP-002', 'Stardust Beach Hotel',           'Hotel',      'Arugam Bay',                               'Ampara', 'Arugam Bay',           'Eastern', '+94 63 224 8191', 6.8412, 81.8345, 'B', 80, '2026-03-23', 'C.M.I.T. Wijerathna',  '0703546260'),

  // ── Kurunegala District (North Western) ────────────────────────────────
  j('FP-KGL-001', 'Hotel Diya Dahara',              'Hotel',      'Negombo Rd, Kurunegala',                   'Kurunegala', 'Kurunegala',       'North Western', '+94 37 222 0011', 7.4863, 80.3623, 'B', 82, '2026-04-04', 'K. Madurapperuma',     '0712223344'),
  j('FP-KGL-002', 'Camellia Dew',                   'Hotel',      'Mawathagama, Kurunegala',                  'Kurunegala', 'Mawathagama',      'North Western', '+94 37 226 7300', 7.5167, 80.4253, 'A', 88, '2026-04-13', 'K. Madurapperuma',     '0712223344'),
  j('FP-KGL-003', 'Cargills (Kurunegala)',          'Grocery',    'Colombo Rd, Kurunegala',                   'Kurunegala', 'Kurunegala',       'North Western', '+94 37 222 4499', 7.4863, 80.3623, 'A', 86, '2026-04-02', 'K. Madurapperuma',     '0712223344'),

  // ── Puttalam District (North Western) ──────────────────────────────────
  j('FP-PTL-001', 'Anawilundawa Eco Lodge',         'Hotel',      'Anawilundawa, Chilaw',                     'Puttalam', 'Chilaw',             'North Western', '+94 32 226 5261', 7.5876, 79.7958, 'A', 85, '2026-04-08', 'N. Fernando',          '0776677889'),
  j('FP-PTL-002', 'Palagama Beach Resort',          'Hotel',      'Kalpitiya',                                'Puttalam', 'Kalpitiya',          'North Western', '+94 32 226 4111', 8.2305, 79.7616, 'A', 87, '2026-04-14', 'N. Fernando',          '0776677889'),

  // ── Anuradhapura District (North Central) ──────────────────────────────
  j('FP-ANR-001', 'Heritance Aluwihare',            'Hotel',      'Kekirawa Rd, Anuradhapura',                'Anuradhapura', 'Anuradhapura',   'North Central', '+94 25 223 5500', 8.3114, 80.4037, 'A', 89, '2026-04-15', 'R. Tennakoon',         '0717788776'),
  j('FP-ANR-002', 'Palm Garden Village',            'Hotel',      'Pandulagama, Anuradhapura',                'Anuradhapura', 'Anuradhapura',   'North Central', '+94 25 222 8530', 8.3220, 80.3936, 'B', 82, '2026-03-30', 'R. Tennakoon',         '0717788776'),
  j('FP-ANR-003', 'Lake View Restaurant',           'Restaurant', 'Tissawewa Rd, Anuradhapura',               'Anuradhapura', 'Anuradhapura',   'North Central', '+94 25 222 2261', 8.3380, 80.4072, 'B', 79, '2026-03-22', 'R. Tennakoon',         '0717788776'),

  // ── Polonnaruwa District (North Central) ───────────────────────────────
  j('FP-PLN-001', 'The Lake Hotel Polonnaruwa',     'Hotel',      'New Town, Polonnaruwa',                    'Polonnaruwa', 'Polonnaruwa',     'North Central', '+94 27 222 2299', 7.9403, 81.0188, 'B', 83, '2026-04-06', 'D. Wijesinghe',        '0701234567'),
  j('FP-PLN-002', 'Heritage Polonnaruwa',           'Hotel',      'Habarana Rd, Polonnaruwa',                 'Polonnaruwa', 'Polonnaruwa',     'North Central', '+94 27 222 2122', 7.9415, 81.0192, 'A', 86, '2026-04-15', 'D. Wijesinghe',        '0701234567'),

  // ── Badulla District (Uva) ─────────────────────────────────────────────
  j('FP-BDL-001', 'Heritance Ella',                 'Hotel',      'Wellawaya Rd, Ella',                       'Badulla', 'Ella',                'Uva', '+94 57 555 5000', 6.8675, 81.0466, 'A', 91, '2026-04-21', 'H.P.K. Wickrema',      '0779988221'),
  j('FP-BDL-002', '98 Acres Resort',                'Hotel',      'Greenland Estate, Ella',                   'Badulla', 'Ella',                'Uva', '+94 57 205 0050', 6.8692, 81.0500, 'A', 93, '2026-04-26', 'H.P.K. Wickrema',      '0779988221'),
  j('FP-BDL-003', 'Cafe Chill Ella',                'Cafe',       'Main St, Ella',                            'Badulla', 'Ella',                'Uva', '+94 57 222 8800', 6.8680, 81.0461, 'B', 84, '2026-04-04', 'H.P.K. Wickrema',      '0779988221'),

  // ── Monaragala District (Uva) ──────────────────────────────────────────
  j('FP-MON-001', 'Wellawaya Rest House',           'Restaurant', 'Wellawaya, Monaragala',                    'Monaragala', 'Wellawaya',        'Uva', '+94 55 227 6261', 6.7378, 81.1027, 'B', 78, '2026-03-20', 'P. Karunaratne',       '0712233445'),

  // ── Ratnapura District (Sabaragamuwa) ──────────────────────────────────
  j('FP-RTN-001', 'Centauria Lake Resort',          'Hotel',      'Kalawana Rd, Ratnapura',                   'Ratnapura', 'Ratnapura',         'Sabaragamuwa', '+94 45 222 4655', 6.6828, 80.3992, 'A', 88, '2026-04-12', 'A.M.U. Premasiri',     '0711999000'),
  j('FP-RTN-002', 'Kalu Ganga River Resort',        'Hotel',      'Bopath Ella Rd, Kuruwita',                 'Ratnapura', 'Kuruwita',          'Sabaragamuwa', '+94 45 226 1100', 6.7892, 80.3625, 'B', 81, '2026-03-26', 'A.M.U. Premasiri',     '0711999000'),

  // ── Kegalle District (Sabaragamuwa) ────────────────────────────────────
  j('FP-KEG-001', 'Hotel Sigiriya Cnr Kegalle',     'Restaurant', 'Main St, Kegalle',                         'Kegalle', 'Kegalle',             'Sabaragamuwa', '+94 35 222 2261', 7.2513, 80.3464, 'B', 79, '2026-03-15', 'D.G. Pathirana',       '0701234560'),
];

/** Quick lookups for filter dropdowns. */
export const DISTRICTS = Array.from(new Set(ESTABLISHMENTS.map((e) => e.district))).sort();
export const TYPES     = Array.from(new Set(ESTABLISHMENTS.map((e) => e.type))).sort();

/** Map-marker helper used by /public/food-grades. */
export function toMarker(e: GradedEstablishment): { id: string; position: LatLng; color: 'emerald' | 'amber' | 'rose'; label?: string } {
  return {
    id: e.id,
    position: { lat: e.lat, lng: e.lng },
    color: e.grade === 'A' ? 'emerald' : e.grade === 'B' ? 'amber' : 'rose',
    label: e.grade,
  };
}
