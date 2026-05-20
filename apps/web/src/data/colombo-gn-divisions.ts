// Real Grama Niladhari (GN) divisions of the Colombo Municipal Council area
// (Colombo district, Western Province). Division names are the published CMC
// GN divisions; population / household figures are realistic order-of-magnitude
// values for demonstration. Single source of truth shared by the GN Area
// Mapping (H795) form and the Administration panel's GN Divisions table so the
// details and survey dates stay in sync everywhere.

export type GNStatus = 'Complete' | 'In Progress' | 'Outdated';

export interface ColomboGN {
  code: string;
  name: string;
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
  { code: 'GN-COL-001', name: 'Fort',                 officer: 'K. Wijesinghe',  population: 1850,  households: 420,  waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',     healthFacilities: 2, schools: 1, factories: 0, foodPremises: 58, lastSurvey: '2026-04-18', status: 'Complete' },
  { code: 'GN-COL-002', name: 'Pettah',               officer: 'K. Wijesinghe',  population: 3120,  households: 690,  waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',     healthFacilities: 1, schools: 2, factories: 1, foodPremises: 142, lastSurvey: '2026-04-12', status: 'Complete' },
  { code: 'GN-COL-003', name: 'Kochchikade North',    officer: 'M. Sampath',     population: 4380,  households: 980,  waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 2, factories: 2, foodPremises: 76, lastSurvey: '2026-03-29', status: 'Complete' },
  { code: 'GN-COL-004', name: 'Kotahena East',        officer: 'M. Sampath',     population: 5210,  households: 1180, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic',  healthFacilities: 2, schools: 3, factories: 4, foodPremises: 64, lastSurvey: '2026-03-22', status: 'In Progress' },
  { code: 'GN-COL-005', name: 'Kotahena West',        officer: 'M. Sampath',     population: 4760,  households: 1040, waterSource: 'NWSDB pipe-borne', sanitationType: 'Septic tank',     healthFacilities: 1, schools: 2, factories: 3, foodPremises: 51, lastSurvey: '2026-02-15', status: 'Outdated' },
  { code: 'GN-COL-006', name: 'Maradana',             officer: 'P. Manjula',     population: 6240,  households: 1390, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',     healthFacilities: 3, schools: 4, factories: 2, foodPremises: 88, lastSurvey: '2026-04-05', status: 'Complete' },
  { code: 'GN-COL-007', name: 'Panchikawatte',        officer: 'P. Manjula',     population: 3980,  households: 900,  waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 1, factories: 6, foodPremises: 49, lastSurvey: '2026-03-11', status: 'In Progress' },
  { code: 'GN-COL-008', name: 'Dematagoda',           officer: 'R. Fernando',    population: 7120,  households: 1610, waterSource: 'NWSDB + wells',    sanitationType: 'Septic tank',     healthFacilities: 1, schools: 3, factories: 5, foodPremises: 42, lastSurvey: '2026-02-28', status: 'Outdated' },
  { code: 'GN-COL-009', name: 'Wanathamulla',         officer: 'R. Fernando',    population: 8450,  households: 1980, waterSource: 'NWSDB + standpost',sanitationType: 'Shared / common', healthFacilities: 2, schools: 2, factories: 1, foodPremises: 37, lastSurvey: '2026-03-19', status: 'In Progress' },
  { code: 'GN-COL-010', name: 'Borella North',        officer: 'C. Wijerathna',  population: 5630,  households: 1320, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',     healthFacilities: 4, schools: 3, factories: 0, foodPremises: 95, lastSurvey: '2026-04-22', status: 'Complete' },
  { code: 'GN-COL-011', name: 'Borella South',        officer: 'C. Wijerathna',  population: 4910,  households: 1150, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',     healthFacilities: 2, schools: 2, factories: 0, foodPremises: 78, lastSurvey: '2026-04-22', status: 'Complete' },
  { code: 'GN-COL-012', name: 'Cinnamon Gardens',     officer: 'C. Wijerathna',  population: 3240,  households: 760,  waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',     healthFacilities: 5, schools: 6, factories: 0, foodPremises: 110, lastSurvey: '2026-04-15', status: 'Complete' },
  { code: 'GN-COL-013', name: 'Kollupitiya',          officer: 'M.G.A.H. Sadaruwan', population: 4120, households: 970, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)',  healthFacilities: 3, schools: 2, factories: 0, foodPremises: 134, lastSurvey: '2026-04-09', status: 'Complete' },
  { code: 'GN-COL-014', name: 'Bambalapitiya',        officer: 'M.G.A.H. Sadaruwan', population: 5870, households: 1380, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer (CMC)', healthFacilities: 2, schools: 4, factories: 1, foodPremises: 121, lastSurvey: '2026-03-30', status: 'In Progress' },
  { code: 'GN-COL-015', name: 'Wellawatte North',     officer: 'P.H.P. Manjula', population: 6310,  households: 1490, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic',  healthFacilities: 2, schools: 3, factories: 1, foodPremises: 103, lastSurvey: '2026-04-08', status: 'Complete' },
  { code: 'GN-COL-016', name: 'Wellawatte South',     officer: 'P.H.P. Manjula', population: 7040,  households: 1660, waterSource: 'NWSDB pipe-borne', sanitationType: 'Sewer + septic',  healthFacilities: 1, schools: 2, factories: 2, foodPremises: 89, lastSurvey: '2026-02-20', status: 'Outdated' },
  { code: 'GN-COL-017', name: 'Pamankada East',       officer: 'S. Jayawardena', population: 5180,  households: 1210, waterSource: 'NWSDB pipe-borne', sanitationType: 'Septic tank',     healthFacilities: 1, schools: 2, factories: 3, foodPremises: 56, lastSurvey: '2026-03-25', status: 'In Progress' },
  { code: 'GN-COL-018', name: 'Pamankada West',       officer: 'S. Jayawardena', population: 4650,  households: 1080, waterSource: 'NWSDB pipe-borne', sanitationType: 'Septic tank',     healthFacilities: 1, schools: 1, factories: 2, foodPremises: 47, lastSurvey: '2026-03-25', status: 'In Progress' },
];

export const GN_TOTALS = {
  divisions: COLOMBO_GN_DIVISIONS.length,
  population: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.population, 0),
  households: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.households, 0),
  foodPremises: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.foodPremises, 0),
  schools: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.schools, 0),
  factories: COLOMBO_GN_DIVISIONS.reduce((s, g) => s + g.factories, 0),
};
