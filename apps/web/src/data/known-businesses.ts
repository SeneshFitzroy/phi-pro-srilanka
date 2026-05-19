// Sri Lankan business registry — used by /public/payments to auto-fill the
// business name + address when the citizen enters their BR number, and to
// suggest the correct service type + outstanding fine.

import { KNOWN_PREMISES } from './food-premises';

export type ServiceType =
  | 'Food Premises — New Registration (Small)'
  | 'Food Premises — New Registration (Medium)'
  | 'Food Premises — New Registration (Large)'
  | 'Food Premises — Annual Renewal'
  | 'Food Premises — Re-inspection Fee'
  | 'Factory Health Certificate'
  | 'Occupational Health Inspection'
  | 'Building Plan Approval'
  | 'Trade License Health Clearance'
  | 'Certified Copy of Report'
  | 'Food Handler Medical Certificate'
  | 'Compliance Fine — Outstanding Notice'
  | 'Bakery / Pastry Shop Registration'
  | 'Hotel / Restaurant Renewal'
  | 'Dairy / Meat Shop Registration'
  | 'Supermarket / Grocery Registration'
  | 'School Canteen Inspection'
  | 'Street Vendor Permit'
  | 'Other';

export interface KnownBusiness {
  brNumber: string;
  name: string;
  address: string;
  district: string;
  ownerName: string;
  phone: string;
  suggestedService: ServiceType;
  /** Outstanding fine / fee in LKR (0 if none owed). */
  outstandingFine: number;
  /** Why the fine — surfaced to the citizen. */
  reason?: string;
}

/** Synthesised from KNOWN_PREMISES so the same demo restaurants resolve. */
export const KNOWN_BUSINESSES: KnownBusiness[] = [
  // Real demo set tied to KNOWN_PREMISES
  ...KNOWN_PREMISES.map((p, i): KnownBusiness => {
    // Mix of BR formats issued by the Registrar of Companies
    const prefix = (['PV', 'PB', 'GS', 'SP'] as const)[i % 4];
    const num = String(10000 + i * 137).padStart(5, '0');
    const baseFee =
      p.type === 'Hotel' ? 25000
      : p.type === 'Restaurant' ? 12000
      : p.type === 'Bakery' ? 8000
      : p.type === 'Grocery' ? 10000
      : 5000;
    const isOverdue = ['H801-004', 'H801-009', 'H801-011'].includes(p.registrationNo);
    return {
      brNumber: `${prefix}-${num}`,
      name: p.premisesName,
      address: p.address,
      district: p.district,
      ownerName: p.ownerName,
      phone: p.phone,
      suggestedService: p.type === 'Hotel'
        ? 'Hotel / Restaurant Renewal'
        : p.type === 'Bakery'
        ? 'Bakery / Pastry Shop Registration'
        : p.type === 'Grocery'
        ? 'Supermarket / Grocery Registration'
        : p.type === 'Restaurant'
        ? 'Food Premises — Annual Renewal'
        : 'Food Premises — Annual Renewal',
      outstandingFine: isOverdue ? baseFee + 2500 : baseFee,
      reason: isOverdue
        ? 'Annual renewal overdue + LKR 2,500 late-payment surcharge (Food Act §32).'
        : 'Standard annual renewal fee for this establishment category.',
    };
  }),
  // Hand-curated extras so demo BRs always succeed
  {
    brNumber: 'PV-99001', name: 'Demo Bakery (Test)', address: '1 Demo St, Colombo',
    district: 'Colombo', ownerName: 'Demo Owner', phone: '+94 11 000 0001',
    suggestedService: 'Bakery / Pastry Shop Registration', outstandingFine: 6000,
    reason: 'Standard annual renewal fee for bakery category.',
  },
];

export function findKnownBusiness(br: string): KnownBusiness | undefined {
  const q = br.trim().toUpperCase().replace(/\s+/g, '');
  if (!q) return undefined;
  return KNOWN_BUSINESSES.find(
    (b) => b.brNumber.replace(/[-\s]/g, '') === q.replace(/[-\s]/g, ''),
  );
}

/** Default fee suggestion per service type — used when no BR match. */
export const SERVICE_DEFAULT_FEE: Record<ServiceType, number> = {
  'Food Premises — New Registration (Small)': 5000,
  'Food Premises — New Registration (Medium)': 10000,
  'Food Premises — New Registration (Large)': 25000,
  'Food Premises — Annual Renewal': 8000,
  'Food Premises — Re-inspection Fee': 2000,
  'Factory Health Certificate': 10000,
  'Occupational Health Inspection': 5000,
  'Building Plan Approval': 3000,
  'Trade License Health Clearance': 2000,
  'Certified Copy of Report': 500,
  'Food Handler Medical Certificate': 1000,
  'Compliance Fine — Outstanding Notice': 5000,
  'Bakery / Pastry Shop Registration': 6500,
  'Hotel / Restaurant Renewal': 25000,
  'Dairy / Meat Shop Registration': 7500,
  'Supermarket / Grocery Registration': 12000,
  'School Canteen Inspection': 3500,
  'Street Vendor Permit': 1500,
  Other: 0,
};

/** Establishment categories used by the Fee Estimator dropdown. Covers every
 *  premises type the H801 register issues a permit for — not just food. */
export const ESTABLISHMENT_FEE_RANGE: Record<string, string> = {
  // Food / hospitality
  'Small Restaurant / Cafe (< 10 seats)':                  'LKR 5,000 – 7,000',
  'Medium Restaurant (10–50 seats)':                       'LKR 10,000 – 12,000',
  'Large Restaurant / Hotel (> 50 seats)':                 'LKR 25,000 – 30,000',
  'Star-class Hotel / Resort':                             'LKR 35,000 – 75,000',
  'Bakery / Pastry Shop':                                  'LKR 5,000 – 8,000',
  'Tea Shop / Kiosk':                                      'LKR 2,000 – 3,500',
  'Food Court Stall':                                      'LKR 4,000 – 6,000',
  'Street Vendor (mobile)':                                'LKR 1,500 – 2,500',
  'Catering Service':                                      'LKR 8,000 – 15,000',
  'Ice Cream / Juice Bar':                                 'LKR 4,000 – 6,500',
  // Retail
  'Supermarket / Hypermarket':                             'LKR 15,000 – 30,000',
  'Grocery Store':                                         'LKR 5,000 – 8,500',
  'Meat / Fish Shop':                                      'LKR 6,000 – 9,500',
  'Dairy Outlet':                                          'LKR 4,500 – 7,000',
  'Sweets / Confectionery Shop':                           'LKR 4,000 – 6,500',
  'Vegetable / Fruit Market Stall':                        'LKR 2,500 – 4,000',
  // Industry / workplace
  'Food Factory / Processing Plant':                       'LKR 25,000 – 60,000',
  'Beverage Factory':                                      'LKR 30,000 – 70,000',
  'General Factory / Workplace':                           'LKR 10,000 – 15,000',
  'Garment / Textile Workplace':                           'LKR 12,000 – 20,000',
  // Institutional
  'School Canteen':                                        'LKR 3,000 – 5,000',
  'Hospital / Clinic Canteen':                             'LKR 5,000 – 8,000',
  'University / Institute Canteen':                        'LKR 4,000 – 7,500',
  'Hostel / Boarding House':                               'LKR 3,500 – 6,000',
  'Childcare / Daycare Centre':                            'LKR 4,000 – 7,000',
  'Old-age Home':                                          'LKR 3,000 – 5,500',
  // Trade / building
  'Building Plan Approval (Health Component)':             'LKR 3,000 – 5,000',
  'Trade Business / Boutique':                             'LKR 2,000 – 3,500',
  'Petrol / Service Station':                              'LKR 7,500 – 12,000',
  'Salon / Spa / Barber':                                  'LKR 2,500 – 4,000',
  // Catch-all
  'Other / Unsure':                                        'Contact MOH office for assessment',
};
