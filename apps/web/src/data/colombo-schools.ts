// Real schools in the Colombo education zones (Colombo district). Used for the
// school register and as the autofill dropdown source across School Health
// (overview, monthly summary, vaccine program, defects).

export type SchoolType = 'National' | 'Provincial' | 'Private';

export interface ColomboSchool {
  id: string;
  name: string;
  type: SchoolType;
  students: number;
  address: string;
  zone: string;
}

export const COLOMBO_SCHOOLS: ColomboSchool[] = [
  { id: 'SCH-001', name: 'Royal College',                    type: 'National',   students: 8500, address: 'Rajakeeya Mawatha, Colombo 07', zone: 'Colombo' },
  { id: 'SCH-002', name: 'Ananda College',                   type: 'National',   students: 6000, address: 'Maradana, Colombo 10',          zone: 'Colombo' },
  { id: 'SCH-003', name: 'Nalanda College',                  type: 'National',   students: 5500, address: 'Colombo 10',                    zone: 'Colombo' },
  { id: 'SCH-004', name: 'D. S. Senanayake College',         type: 'National',   students: 4000, address: 'Gregory\'s Rd, Colombo 08',     zone: 'Colombo' },
  { id: 'SCH-005', name: 'Isipathana College',               type: 'National',   students: 4200, address: 'Havelock Town, Colombo 05',     zone: 'Colombo' },
  { id: 'SCH-006', name: 'Thurstan College',                 type: 'National',   students: 3500, address: 'Thurstan Rd, Colombo 07',       zone: 'Colombo' },
  { id: 'SCH-007', name: 'Visakha Vidyalaya',                type: 'National',   students: 3900, address: 'Vajira Rd, Colombo 05',         zone: 'Colombo' },
  { id: 'SCH-008', name: 'Devi Balika Vidyalaya',            type: 'National',   students: 3600, address: 'Castle St, Colombo 08',         zone: 'Colombo' },
  { id: 'SCH-009', name: 'Sirimavo Bandaranaike Vidyalaya',  type: 'National',   students: 3400, address: 'Colombo 07',                    zone: 'Colombo' },
  { id: 'SCH-010', name: 'Mahanama College',                 type: 'National',   students: 3800, address: 'Colombo 03',                    zone: 'Colombo South' },
  { id: 'SCH-011', name: "St. Joseph's College",             type: 'National',   students: 5000, address: 'Darley Rd, Colombo 10',         zone: 'Colombo' },
  { id: 'SCH-012', name: "St. Peter's College",              type: 'National',   students: 4500, address: 'Galle Rd, Colombo 04',          zone: 'Colombo South' },
  { id: 'SCH-013', name: 'Wesley College',                   type: 'Private',    students: 2800, address: 'Karlsruhe Gardens, Colombo 09', zone: 'Colombo' },
  { id: 'SCH-014', name: 'Musaeus College',                  type: 'Private',    students: 3000, address: 'Rosmead Pl, Colombo 07',        zone: 'Colombo' },
  { id: 'SCH-015', name: 'Ananda Balika Vidyalaya',          type: 'Provincial', students: 2200, address: 'Kotte Rd, Colombo 08',          zone: 'Colombo' },
  { id: 'SCH-016', name: 'Asoka Vidyalaya',                  type: 'Provincial', students: 1800, address: 'Colombo 10',                    zone: 'Colombo' },
  { id: 'SCH-017', name: 'Gothami Balika Vidyalaya',         type: 'Provincial', students: 2000, address: 'Borella, Colombo 08',           zone: 'Colombo' },
  { id: 'SCH-018', name: "Prince of Wales' College",         type: 'National',   students: 4000, address: 'Moratuwa',                      zone: 'Colombo South' },
];

export const SCHOOL_NAMES = COLOMBO_SCHOOLS.map((s) => s.name);
