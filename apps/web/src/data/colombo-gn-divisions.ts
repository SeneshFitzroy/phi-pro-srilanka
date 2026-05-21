// Real Grama Niladhari (GN) divisions of the Colombo Municipal Council (CMC)
// area, Colombo district, Western Province. The CMC area is administered by two
// Divisional Secretariats — Colombo DS and Thimbirigasyaya DS — whose published
// GN divisions are listed below in full. Population / household figures are
// realistic order-of-magnitude values for demonstration; division names and
// the DS grouping follow the official Department of Census & Statistics /
// Divisional Secretariat lists. Single source of truth shared by the GN Area
// Mapping (H795) form and the Administration panel's GN Divisions table so the
// details and survey dates stay in sync everywhere.

export type GNStatus = 'Complete' | 'In Progress' | 'Outdated';

export interface ColomboGN {
  code: string;
  name: string;
  ds: 'Colombo' | 'Thimbirigasyaya';
  officer: string;
  population: number;
  households: number;
  waterSource: string;
  sanitationType: string;
  healthFacilities: number;
  schools: number;
  factories: number;
  foodPremises: number;
  lastSurvey: string; // ISO date
  status: GNStatus;
}

export const COLOMBO_GN_DIVISIONS: ColomboGN[] = [
  // ───────────── Colombo Divisional Secretariat ─────────────
  { code: 'GN-COL-001', name: 'Nawagampura',          ds: 'Colombo', officer: 'K. Wijesinghe',      population: 4120, households: 940,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 1, foodPremises: 44,  lastSurvey: '2026-04-18', status: 'Complete' },
  { code: 'GN-COL-002', name: 'Maligawatta East',     ds: 'Colombo', officer: 'K. Wijesinghe',      population: 6280, households: 1410, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 2, factories: 2, foodPremises: 61,  lastSurvey: '2026-04-12', status: 'Complete' },
  { code: 'GN-COL-003', name: 'Aluthkade East',       ds: 'Colombo', officer: 'M. Sampath',         population: 3980, households: 880,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 3, foodPremises: 73,  lastSurvey: '2026-03-29', status: 'Complete' },
  { code: 'GN-COL-004', name: 'Aluthkade West',       ds: 'Colombo', officer: 'M. Sampath',         population: 3640, households: 810,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 2, foodPremises: 68,  lastSurvey: '2026-03-22', status: 'In Progress' },
  { code: 'GN-COL-005', name: 'Khettarama',           ds: 'Colombo', officer: 'M. Sampath',         population: 4310, households: 970,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 2, factories: 1, foodPremises: 52,  lastSurvey: '2026-02-15', status: 'Outdated' },
  { code: 'GN-COL-006', name: 'Aluthmawatha',         ds: 'Colombo', officer: 'P. Manjula',         population: 5210, households: 1180, waterSource: 'NWSDB + standpost', sanitationType: 'Septic tank',     healthFacilities: 1, schools: 1, factories: 4, foodPremises: 39,  lastSurvey: '2026-04-05', status: 'Complete' },
  { code: 'GN-COL-007', name: 'Madampitiya',          ds: 'Colombo', officer: 'P. Manjula',         population: 6740, households: 1520, waterSource: 'NWSDB + standpost', sanitationType: 'Shared / common', healthFacilities: 1, schools: 2, factories: 3, foodPremises: 33,  lastSurvey: '2026-03-11', status: 'In Progress' },
  { code: 'GN-COL-008', name: 'Mahawatta',            ds: 'Colombo', officer: 'R. Fernando',        population: 5890, households: 1330, waterSource: 'NWSDB + wells',     sanitationType: 'Septic tank',     healthFacilities: 1, schools: 1, factories: 5, foodPremises: 41,  lastSurvey: '2026-02-28', status: 'Outdated' },
  { code: 'GN-COL-009', name: 'Aluthmawatha North',   ds: 'Colombo', officer: 'R. Fernando',        population: 4980, households: 1120, waterSource: 'NWSDB + standpost', sanitationType: 'Shared / common', healthFacilities: 1, schools: 1, factories: 2, foodPremises: 36,  lastSurvey: '2026-03-19', status: 'In Progress' },
  { code: 'GN-COL-010', name: 'Bloemendhal',          ds: 'Colombo', officer: 'R. Fernando',        population: 7320, households: 1660, waterSource: 'NWSDB + standpost', sanitationType: 'Shared / common', healthFacilities: 1, schools: 2, factories: 6, foodPremises: 29,  lastSurvey: '2026-03-08', status: 'In Progress' },
  { code: 'GN-COL-011', name: 'Sammanthranapura',     ds: 'Colombo', officer: 'C. Wijerathna',      population: 5160, households: 1170, waterSource: 'NWSDB + standpost', sanitationType: 'Shared / common', healthFacilities: 1, schools: 1, factories: 1, foodPremises: 24,  lastSurvey: '2026-04-22', status: 'Complete' },
  { code: 'GN-COL-012', name: 'Modara',               ds: 'Colombo', officer: 'C. Wijerathna',      population: 6630, households: 1500, waterSource: 'NWSDB + wells',     sanitationType: 'Septic tank',     healthFacilities: 2, schools: 3, factories: 4, foodPremises: 47,  lastSurvey: '2026-04-15', status: 'Complete' },
  { code: 'GN-COL-013', name: 'Lunupokuna',           ds: 'Colombo', officer: 'C. Wijerathna',      population: 3870, households: 870,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 2, foodPremises: 31,  lastSurvey: '2026-04-09', status: 'Complete' },
  { code: 'GN-COL-014', name: 'Kotahena East',        ds: 'Colombo', officer: 'M.G.A.H. Sadaruwan', population: 5210, households: 1180, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 2, schools: 3, factories: 4, foodPremises: 64,  lastSurvey: '2026-03-30', status: 'In Progress' },
  { code: 'GN-COL-015', name: 'Kotahena West',        ds: 'Colombo', officer: 'M.G.A.H. Sadaruwan', population: 4760, households: 1040, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Septic tank',     healthFacilities: 1, schools: 2, factories: 3, foodPremises: 51,  lastSurvey: '2026-04-08', status: 'Complete' },
  { code: 'GN-COL-016', name: 'Kochchikade North',    ds: 'Colombo', officer: 'S. Jayawardena',     population: 4380, households: 980,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 2, factories: 2, foodPremises: 76,  lastSurvey: '2026-02-20', status: 'Outdated' },
  { code: 'GN-COL-017', name: 'Kochchikade South',    ds: 'Colombo', officer: 'S. Jayawardena',     population: 4010, households: 900,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 2, foodPremises: 82,  lastSurvey: '2026-03-25', status: 'In Progress' },
  { code: 'GN-COL-018', name: 'Gintupitiya',          ds: 'Colombo', officer: 'S. Jayawardena',     population: 4520, households: 1010, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 3, foodPremises: 91,  lastSurvey: '2026-03-25', status: 'In Progress' },
  { code: 'GN-COL-019', name: 'Masangasweediya',      ds: 'Colombo', officer: 'N. Dissanayake',     population: 3760, households: 840,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 1, foodPremises: 88,  lastSurvey: '2026-04-19', status: 'Complete' },
  { code: 'GN-COL-020', name: 'New Bazaar',           ds: 'Colombo', officer: 'N. Dissanayake',     population: 5040, households: 1130, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 2, factories: 2, foodPremises: 156, lastSurvey: '2026-04-11', status: 'Complete' },
  { code: 'GN-COL-021', name: 'Grandpass North',      ds: 'Colombo', officer: 'N. Dissanayake',     population: 6210, households: 1400, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 2, factories: 5, foodPremises: 57,  lastSurvey: '2026-03-14', status: 'In Progress' },
  { code: 'GN-COL-022', name: 'Grandpass South',      ds: 'Colombo', officer: 'A. Karunaratne',     population: 5880, households: 1330, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 2, factories: 6, foodPremises: 49,  lastSurvey: '2026-02-26', status: 'Outdated' },
  { code: 'GN-COL-023', name: 'Nawagampura South',    ds: 'Colombo', officer: 'A. Karunaratne',     population: 4360, households: 980,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 2, foodPremises: 38,  lastSurvey: '2026-04-21', status: 'Complete' },
  { code: 'GN-COL-024', name: 'Maligawatta West',     ds: 'Colombo', officer: 'A. Karunaratne',     population: 6080, households: 1370, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 2, factories: 2, foodPremises: 63,  lastSurvey: '2026-04-03', status: 'Complete' },
  { code: 'GN-COL-025', name: 'Maligakanda',          ds: 'Colombo', officer: 'T. Rajapaksha',      population: 5320, households: 1200, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 2, schools: 3, factories: 1, foodPremises: 72,  lastSurvey: '2026-03-17', status: 'In Progress' },
  { code: 'GN-COL-026', name: 'Maradana',             ds: 'Colombo', officer: 'T. Rajapaksha',      population: 6240, households: 1390, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 3, schools: 4, factories: 2, foodPremises: 88,  lastSurvey: '2026-04-05', status: 'Complete' },
  { code: 'GN-COL-027', name: 'Panchikawatte',        ds: 'Colombo', officer: 'T. Rajapaksha',      population: 3980, households: 900,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 6, foodPremises: 49,  lastSurvey: '2026-03-11', status: 'In Progress' },
  { code: 'GN-COL-028', name: 'Fort',                 ds: 'Colombo', officer: 'L. Gunaratne',       population: 1850, households: 420,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 2, schools: 1, factories: 0, foodPremises: 58,  lastSurvey: '2026-04-18', status: 'Complete' },
  { code: 'GN-COL-029', name: 'Pettah',               ds: 'Colombo', officer: 'L. Gunaratne',       population: 3120, households: 690,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 2, factories: 1, foodPremises: 142, lastSurvey: '2026-04-12', status: 'Complete' },
  { code: 'GN-COL-030', name: 'Kompannaveediya',      ds: 'Colombo', officer: 'L. Gunaratne',       population: 4470, households: 1010, waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 2, foodPremises: 67,  lastSurvey: '2026-04-16', status: 'Complete' },
  { code: 'GN-COL-031', name: 'Hunupitiya',           ds: 'Colombo', officer: 'D. Senanayake',      population: 3890, households: 880,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 1, foodPremises: 74,  lastSurvey: '2026-03-28', status: 'In Progress' },
  { code: 'GN-COL-032', name: 'Suduwella',            ds: 'Colombo', officer: 'D. Senanayake',      population: 4230, households: 950,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 2, foodPremises: 53,  lastSurvey: '2026-02-22', status: 'Outdated' },
  { code: 'GN-COL-033', name: 'Wekanda',              ds: 'Colombo', officer: 'D. Senanayake',      population: 3610, households: 820,  waterSource: 'NWSDB pipe-borne',  sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 1, factories: 1, foodPremises: 62,  lastSurvey: '2026-04-14', status: 'Complete' },

  // ───────────── Thimbirigasyaya Divisional Secretariat ─────────────
  { code: 'GN-COL-034', name: 'Kuruduwatta',          ds: 'Thimbirigasyaya', officer: 'P.H.P. Manjula',     population: 4980, households: 1130, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 2, schools: 2, factories: 0, foodPremises: 81,  lastSurvey: '2026-04-20', status: 'Complete' },
  { code: 'GN-COL-035', name: 'Kuppiyawatta East',    ds: 'Thimbirigasyaya', officer: 'P.H.P. Manjula',     population: 5870, households: 1320, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 1, schools: 2, factories: 1, foodPremises: 58,  lastSurvey: '2026-03-21', status: 'In Progress' },
  { code: 'GN-COL-036', name: 'Kuppiyawatta West',    ds: 'Thimbirigasyaya', officer: 'P.H.P. Manjula',     population: 5410, households: 1220, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 1, schools: 1, factories: 1, foodPremises: 54,  lastSurvey: '2026-03-21', status: 'In Progress' },
  { code: 'GN-COL-037', name: 'Borella North',        ds: 'Thimbirigasyaya', officer: 'C. Wijerathna',      population: 5630, households: 1320, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 4, schools: 3, factories: 0, foodPremises: 95,  lastSurvey: '2026-04-22', status: 'Complete' },
  { code: 'GN-COL-038', name: 'Borella South',        ds: 'Thimbirigasyaya', officer: 'C. Wijerathna',      population: 4910, households: 1150, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 2, schools: 2, factories: 0, foodPremises: 78,  lastSurvey: '2026-04-22', status: 'Complete' },
  { code: 'GN-COL-039', name: 'Wanathamulla',         ds: 'Thimbirigasyaya', officer: 'R. Fernando',        population: 8450, households: 1980, waterSource: 'NWSDB + standpost',sanitationType: 'Shared / common',healthFacilities: 2, schools: 2, factories: 1, foodPremises: 37,  lastSurvey: '2026-03-19', status: 'In Progress' },
  { code: 'GN-COL-040', name: 'Dematagoda',           ds: 'Thimbirigasyaya', officer: 'R. Fernando',        population: 7120, households: 1610, waterSource: 'NWSDB + wells',    sanitationType: 'Septic tank',    healthFacilities: 1, schools: 3, factories: 5, foodPremises: 42,  lastSurvey: '2026-02-28', status: 'Outdated' },
  { code: 'GN-COL-041', name: 'Kollupitiya',          ds: 'Thimbirigasyaya', officer: 'M.G.A.H. Sadaruwan', population: 4120, households: 970,  waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 3, schools: 2, factories: 0, foodPremises: 134, lastSurvey: '2026-04-09', status: 'Complete' },
  { code: 'GN-COL-042', name: 'Bambalapitiya',        ds: 'Thimbirigasyaya', officer: 'M.G.A.H. Sadaruwan', population: 5870, households: 1380, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 2, schools: 4, factories: 1, foodPremises: 121, lastSurvey: '2026-03-30', status: 'In Progress' },
  { code: 'GN-COL-043', name: 'Milagiriya',           ds: 'Thimbirigasyaya', officer: 'S. Jayawardena',     population: 4360, households: 1020, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 2, schools: 3, factories: 0, foodPremises: 99,  lastSurvey: '2026-04-07', status: 'Complete' },
  { code: 'GN-COL-044', name: 'Havelock Town',        ds: 'Thimbirigasyaya', officer: 'S. Jayawardena',     population: 5210, households: 1230, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 3, schools: 4, factories: 0, foodPremises: 112, lastSurvey: '2026-04-07', status: 'Complete' },
  { code: 'GN-COL-045', name: 'Wellawatte North',     ds: 'Thimbirigasyaya', officer: 'P.H.P. Manjula',     population: 6310, households: 1490, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic', healthFacilities: 2, schools: 3, factories: 1, foodPremises: 103, lastSurvey: '2026-04-08', status: 'Complete' },
  { code: 'GN-COL-046', name: 'Wellawatte South',     ds: 'Thimbirigasyaya', officer: 'P.H.P. Manjula',     population: 7040, households: 1660, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic', healthFacilities: 1, schools: 2, factories: 2, foodPremises: 89,  lastSurvey: '2026-02-20', status: 'Outdated' },
  { code: 'GN-COL-047', name: 'Thimbirigasyaya',      ds: 'Thimbirigasyaya', officer: 'K. Wijesinghe',      population: 5480, households: 1280, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 3, schools: 3, factories: 0, foodPremises: 86,  lastSurvey: '2026-04-13', status: 'Complete' },
  { code: 'GN-COL-048', name: 'Kirula',               ds: 'Thimbirigasyaya', officer: 'K. Wijesinghe',      population: 4920, households: 1150, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 2, schools: 2, factories: 0, foodPremises: 67,  lastSurvey: '2026-04-13', status: 'Complete' },
  { code: 'GN-COL-049', name: 'Kirulapone',           ds: 'Thimbirigasyaya', officer: 'N. Dissanayake',     population: 6630, households: 1540, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic', healthFacilities: 2, schools: 3, factories: 1, foodPremises: 74,  lastSurvey: '2026-03-23', status: 'In Progress' },
  { code: 'GN-COL-050', name: 'Narahenpita',          ds: 'Thimbirigasyaya', officer: 'N. Dissanayake',     population: 5910, households: 1380, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',    healthFacilities: 4, schools: 3, factories: 1, foodPremises: 82,  lastSurvey: '2026-04-06', status: 'Complete' },
  { code: 'GN-COL-051', name: 'Gothamipura',          ds: 'Thimbirigasyaya', officer: 'A. Karunaratne',     population: 4480, households: 1040, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic', healthFacilities: 1, schools: 2, factories: 1, foodPremises: 51,  lastSurvey: '2026-03-15', status: 'In Progress' },
  { code: 'GN-COL-052', name: 'Pamankada East',       ds: 'Thimbirigasyaya', officer: 'S. Jayawardena',     population: 5180, households: 1210, waterSource: 'NWSDB pipe-borne', sanitationType: 'Septic tank',    healthFacilities: 1, schools: 2, factories: 3, foodPremises: 56,  lastSurvey: '2026-03-25', status: 'In Progress' },
  { code: 'GN-COL-053', name: 'Pamankada West',       ds: 'Thimbirigasyaya', officer: 'S. Jayawardena',     population: 4650, households: 1080, waterSource: 'NWSDB pipe-borne', sanitationType: 'Septic tank',    healthFacilities: 1, schools: 1, factories: 2, foodPremises: 47,  lastSurvey: '2026-03-25', status: 'In Progress' },
];

export const GN_TOTALS = {
  divisions: COLOMBO_GN_DIVISIONS.length,
  population: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.population, 0),
  households: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.households, 0),
  foodPremises: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.foodPremises, 0),
  schools: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.schools, 0),
  factories: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.factories, 0),
};
