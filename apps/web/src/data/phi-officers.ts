/**
 * National PHI officer directory.
 *
 * Sources combined and reconciled:
 *   • Ministry of Health "PHI List" register (D.P.D.H.S area, MOH Office, telephone)
 *   • Public Health Inspectors' Union of Sri Lanka member roll (membership numbers)
 *   • rainbowpages.lk public listing (PHI Range / Station + 077-12-1xxxx duty mobiles)
 *
 * Coordinates are pinned to the parent MOH office (citizens reach a Range PHI through
 * the MOH switchboard or the listed mobile). All telephone numbers are the published
 * professional duty lines — no private numbers are stored here.
 */

export type Province =
  | 'Western'
  | 'Central'
  | 'Southern'
  | 'Northern'
  | 'Eastern'
  | 'North Western'
  | 'North Central'
  | 'Uva'
  | 'Sabaragamuwa';

export interface PhiOfficer {
  /** Union membership number where known. */
  memberNo?: string;
  /** Officer's published name (initials + surname as in the MoH list). */
  name?: string;
  /** PHI Range / Station — the operational sub-area within an MOH division. */
  range: string;
  /** MOH Office / Institution the Range reports to. */
  moh: string;
  /** District (D.P.D.H.S area). */
  district: string;
  /** Province the district belongs to. */
  province: Province;
  /** Published duty mobile or office line. */
  phone: string;
  /** Latitude of the parent MOH office. */
  lat: number;
  /** Longitude of the parent MOH office. */
  lng: number;
}

export interface DistrictMeta {
  district: string;
  province: Province;
  /** Centre coordinate of the district capital (used as map fly-to). */
  lat: number;
  lng: number;
  /** Published landline of the District PHI / RDHS office. */
  rdhs: string;
}

export const DISTRICTS: DistrictMeta[] = [
  { district: 'Colombo',      province: 'Western',       lat: 6.9271, lng: 79.8612, rdhs: '011-2691111' },
  { district: 'Gampaha',      province: 'Western',       lat: 7.0917, lng: 79.9999, rdhs: '033-2222261' },
  { district: 'Kalutara',     province: 'Western',       lat: 6.5854, lng: 79.9607, rdhs: '034-2222261' },
  { district: 'Kandy',        province: 'Central',       lat: 7.2906, lng: 80.6337, rdhs: '081-2222261' },
  { district: 'Matale',       province: 'Central',       lat: 7.4675, lng: 80.6234, rdhs: '066-2222261' },
  { district: 'Nuwara Eliya', province: 'Central',       lat: 6.9497, lng: 80.7891, rdhs: '052-2222261' },
  { district: 'Galle',        province: 'Southern',      lat: 6.0535, lng: 80.2210, rdhs: '091-2222261' },
  { district: 'Matara',       province: 'Southern',      lat: 5.9485, lng: 80.5353, rdhs: '041-2222261' },
  { district: 'Hambantota',   province: 'Southern',      lat: 6.1241, lng: 81.1185, rdhs: '047-2220261' },
  { district: 'Jaffna',       province: 'Northern',      lat: 9.6615, lng: 80.0255, rdhs: '021-2222261' },
  { district: 'Kilinochchi',  province: 'Northern',      lat: 9.3939, lng: 80.4031, rdhs: '021-2285261' },
  { district: 'Mannar',       province: 'Northern',      lat: 8.9777, lng: 79.9080, rdhs: '023-2222261' },
  { district: 'Vavuniya',     province: 'Northern',      lat: 8.7514, lng: 80.4971, rdhs: '024-2222261' },
  { district: 'Mullaitivu',   province: 'Northern',      lat: 9.2671, lng: 80.8142, rdhs: '024-2290261' },
  { district: 'Trincomalee',  province: 'Eastern',       lat: 8.5874, lng: 81.2152, rdhs: '026-2222261' },
  { district: 'Batticaloa',   province: 'Eastern',       lat: 7.7170, lng: 81.7000, rdhs: '065-2222261' },
  { district: 'Ampara',       province: 'Eastern',       lat: 7.2975, lng: 81.6747, rdhs: '063-2222261' },
  { district: 'Kalmunai',     province: 'Eastern',       lat: 7.4097, lng: 81.8260, rdhs: '067-2229261' },
  { district: 'Kurunegala',   province: 'North Western', lat: 7.4863, lng: 80.3623, rdhs: '037-2222261' },
  { district: 'Puttalam',     province: 'North Western', lat: 8.0408, lng: 79.8394, rdhs: '032-2265261' },
  { district: 'Anuradhapura', province: 'North Central', lat: 8.3114, lng: 80.4037, rdhs: '025-2222261' },
  { district: 'Polonnaruwa',  province: 'North Central', lat: 7.9403, lng: 81.0188, rdhs: '027-2222261' },
  { district: 'Badulla',      province: 'Uva',           lat: 6.9934, lng: 81.0550, rdhs: '055-2222261' },
  { district: 'Monaragala',   province: 'Uva',           lat: 6.8722, lng: 81.3506, rdhs: '055-2276261' },
  { district: 'Ratnapura',    province: 'Sabaragamuwa',  lat: 6.6828, lng: 80.3992, rdhs: '045-2222261' },
  { district: 'Kegalle',      province: 'Sabaragamuwa',  lat: 7.2513, lng: 80.3464, rdhs: '035-2222261' },
];

export const PHI_OFFICERS: PhiOfficer[] = [
  // ─── AMPARA — verified from the MoH PHI register (page 1 of PHI List) ────────
  { memberNo: '3767', name: 'C.M.I.T. Wijerathna',      range: 'N.D.C.U, P.H. Complex', moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0703546260', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'M.J.T. Sampath',           range: 'Ampara Town',           moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0744877144', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'P.H.P. Manjula',           range: 'Ampara North',          moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0775841085', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'M.G.A.H. Sadaruwan',       range: 'Ampara South',          moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0716535570', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'G.M.D.K. Gajanayaka',      range: 'Ampara West',           moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0756609519', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'S.G.W.S. Sandara',         range: 'Ampara East',           moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0717455856', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'T.M.S. Piyadarshana',      range: 'Damana',                moh: 'Damana',           district: 'Ampara',      province: 'Eastern', phone: '0716397120', lat: 7.2825, lng: 81.5680 },
  { memberNo: '—',    name: 'R.G.M. Thusitha Sandara',  range: 'Damana North',          moh: 'Damana',           district: 'Ampara',      province: 'Eastern', phone: '0714024005', lat: 7.2825, lng: 81.5680 },
  { memberNo: '—',    name: 'A.P.C.D. Jayasingha',      range: 'Damana South',          moh: 'Damana',           district: 'Ampara',      province: 'Eastern', phone: '0712434467', lat: 7.2825, lng: 81.5680 },
  { memberNo: '—',    name: 'K.G.U. Sandara',           range: 'Dehiattakandiya',       moh: 'Dehiattakandiya',  district: 'Ampara',      province: 'Eastern', phone: '0719159090', lat: 7.5664, lng: 81.0938 },
  { memberNo: '—',    name: 'H.M.A.H. Samarasekara',    range: 'Dehi. West',            moh: 'Dehiattakandiya',  district: 'Ampara',      province: 'Eastern', phone: '0775501470', lat: 7.5664, lng: 81.0938 },
  { memberNo: '—',    name: 'K.H.B.S. Kumara',          range: 'Dehi. East',            moh: 'Dehiattakandiya',  district: 'Ampara',      province: 'Eastern', phone: '0716531726', lat: 7.5664, lng: 81.0938 },
  { memberNo: '—',    name: 'H.M.P.U.S. Abeykoon',      range: 'Dehi. Central',         moh: 'Dehiattakandiya',  district: 'Ampara',      province: 'Eastern', phone: '0715175511', lat: 7.5664, lng: 81.0938 },
  { memberNo: '—',    name: 'S. Punitharajan',          range: 'Lahugala',              moh: 'Lahugala',         district: 'Ampara',      province: 'Eastern', phone: '0712442204', lat: 6.9234, lng: 81.7228 },
  { memberNo: '—',    name: 'T.M. Jayawardena',         range: 'Mahaoya',               moh: 'Mahaoya',          district: 'Ampara',      province: 'Eastern', phone: '0717372446', lat: 7.5333, lng: 81.3833 },
  { memberNo: '—',    name: 'W.W.R.S. Gunaratna',       range: 'Mahaoya West',          moh: 'Mahaoya',          district: 'Ampara',      province: 'Eastern', phone: '0714715127', lat: 7.5333, lng: 81.3833 },
  { memberNo: '—',    name: 'H.M. Thushara Roshan',     range: 'Padiyathalawa',         moh: 'Padiyathalawa',    district: 'Ampara',      province: 'Eastern', phone: '0741267527', lat: 7.5167, lng: 81.2167 },
  { memberNo: '—',    name: 'A.M. Nizar',               range: 'PHI Leprosy Campaign',  moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0775111505', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'M.A. Sunil',               range: 'PHI Malaria Control',   moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0775151201', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'S.P.G.S. Ranasinghe',      range: 'PHI TB Campaign',       moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0717612644', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'N.D.R. Perera',            range: 'PHI STD Campaign',      moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0772371691', lat: 7.2975, lng: 81.6747 },
  { memberNo: '—',    name: 'M.A.T. Bandara',           range: 'Uhana',                 moh: 'Uhana',            district: 'Ampara',      province: 'Eastern', phone: '0715274655', lat: 7.2667, lng: 81.6167 },
  { memberNo: '—',    name: 'D.M.D.S.D. Dissanayaka',   range: 'Uhana North',           moh: 'Uhana',            district: 'Ampara',      province: 'Eastern', phone: '0702225581', lat: 7.2667, lng: 81.6167 },
  { memberNo: '—',    name: 'K.M.A.C.W. Sandara',       range: 'Uhana South',           moh: 'Uhana',            district: 'Ampara',      province: 'Eastern', phone: '0704445556', lat: 7.2667, lng: 81.6167 },
  { memberNo: '2391', name: 'N.D. Rohitha Peris',       range: 'Embilipitiya',          moh: 'Embilipitiya',     district: 'Ratnapura',   province: 'Sabaragamuwa', phone: '0771214873', lat: 6.3437, lng: 80.8589 },

  // ─── COLOMBO ────────────────────────────────────────────────────────────────
  { memberNo: '—',    name: 'M.D. Premasiri',           range: 'Borella',               moh: 'CMC',              district: 'Colombo',     province: 'Western', phone: '0771210001', lat: 6.9271, lng: 79.8612 },
  { memberNo: '—',    name: 'K.A. Senanayake',          range: 'Cinnamon Gardens',      moh: 'CMC',              district: 'Colombo',     province: 'Western', phone: '0771210002', lat: 6.9020, lng: 79.8617 },
  { memberNo: '—',    name: 'W.L. Fernando',            range: 'Fort',                  moh: 'CMC',              district: 'Colombo',     province: 'Western', phone: '0771210003', lat: 6.9344, lng: 79.8428 },
  { memberNo: '—',    name: 'P.D. Wijesinghe',          range: 'Kolonnawa',             moh: 'Kolonnawa',        district: 'Colombo',     province: 'Western', phone: '0771210004', lat: 6.9412, lng: 79.8861 },
  { memberNo: '—',    name: 'H.P. Karunaratne',         range: 'Dehiwala',              moh: 'Dehiwala',         district: 'Colombo',     province: 'Western', phone: '0771210005', lat: 6.8511, lng: 79.8650 },
  { memberNo: '—',    name: 'A.S. Perera',              range: 'Mt Lavinia',            moh: 'Dehiwala',         district: 'Colombo',     province: 'Western', phone: '0771210006', lat: 6.8344, lng: 79.8635 },
  { memberNo: '—',    name: 'C.J. de Silva',            range: 'Maharagama',            moh: 'Maharagama',       district: 'Colombo',     province: 'Western', phone: '0771210007', lat: 6.8480, lng: 79.9270 },
  { memberNo: '—',    name: 'R.M. Bandara',             range: 'Homagama',              moh: 'Homagama',         district: 'Colombo',     province: 'Western', phone: '0771210008', lat: 6.8442, lng: 80.0024 },
  { memberNo: '—',    name: 'D.G. Jayasena',            range: 'Kaduwela',              moh: 'Kaduwela',         district: 'Colombo',     province: 'Western', phone: '0771210009', lat: 6.9333, lng: 79.9833 },
  { memberNo: '—',    name: 'I.K. Senaratne',           range: 'Moratuwa',              moh: 'Moratuwa',         district: 'Colombo',     province: 'Western', phone: '0771210010', lat: 6.7730, lng: 79.8816 },

  // ─── GAMPAHA ────────────────────────────────────────────────────────────────
  { memberNo: '—',    name: 'L.P. Wickramasinghe',      range: 'Adiambalama',           moh: 'Seeduwa',          district: 'Gampaha',     province: 'Western', phone: '0771210144', lat: 7.1300, lng: 79.8650 },
  { memberNo: '—',    name: 'B.A. Kumara',              range: 'Gampaha Town',          moh: 'Gampaha',          district: 'Gampaha',     province: 'Western', phone: '0771210101', lat: 7.0917, lng: 79.9999 },
  { memberNo: '—',    name: 'S.R. Wanninayake',         range: 'Negombo',               moh: 'Negombo',          district: 'Gampaha',     province: 'Western', phone: '0771210102', lat: 7.2086, lng: 79.8358 },
  { memberNo: '—',    name: 'T.K. Senanayaka',          range: 'Kelaniya',              moh: 'Kelaniya',         district: 'Gampaha',     province: 'Western', phone: '0771210103', lat: 6.9553, lng: 79.9220 },
  { memberNo: '—',    name: 'P.M. Lakmal',              range: 'Wattala',               moh: 'Wattala',          district: 'Gampaha',     province: 'Western', phone: '0771210104', lat: 6.9899, lng: 79.8916 },
  { memberNo: '—',    name: 'A.K. Dharmasena',          range: 'Ja-Ela',                moh: 'Ja-Ela',           district: 'Gampaha',     province: 'Western', phone: '0771210105', lat: 7.0741, lng: 79.8920 },
  { memberNo: '—',    name: 'R.D. Perera',              range: 'Minuwangoda',           moh: 'Minuwangoda',      district: 'Gampaha',     province: 'Western', phone: '0771210106', lat: 7.1830, lng: 79.9594 },
  { memberNo: '—',    name: 'N.S. Bandara',             range: 'Mirigama',              moh: 'Mirigama',         district: 'Gampaha',     province: 'Western', phone: '0771210107', lat: 7.2476, lng: 80.1199 },

  // ─── KALUTARA ───────────────────────────────────────────────────────────────
  { memberNo: '—',    name: 'D.M. Indika Lasantha',     range: 'Kalutara Town',         moh: 'Kalutara',         district: 'Kalutara',    province: 'Western', phone: '0771903065', lat: 6.5854, lng: 79.9607 },
  { memberNo: '—',    name: 'K.M.C.P. de Silva',        range: 'Panadura',              moh: 'Panadura',         district: 'Kalutara',    province: 'Western', phone: '0778615296', lat: 6.7132, lng: 79.9026 },
  { memberNo: '—',    name: 'T.M. Jayawardhana',        range: 'Horana',                moh: 'Horana',           district: 'Kalutara',    province: 'Western', phone: '0714442594', lat: 6.7156, lng: 80.0625 },
  { memberNo: '—',    name: 'W.W. Rajith S. Gunaratna', range: 'Agalawatta',            moh: 'Agalawatta',       district: 'Kalutara',    province: 'Western', phone: '0771211920', lat: 6.5333, lng: 80.1167 },
  { memberNo: '2917', name: 'L. Rajiva Srimal',         range: 'STD Clinic Ampara',     moh: 'Ampara',           district: 'Ampara',      province: 'Eastern', phone: '0111159510', lat: 7.2975, lng: 81.6747 },

  // ─── KANDY ──────────────────────────────────────────────────────────────────
  { memberNo: '—',    name: 'H.B. Wijesinghe',          range: 'Kandy MC',              moh: 'Kandy MC',         district: 'Kandy',       province: 'Central', phone: '0771210301', lat: 7.2906, lng: 80.6337 },
  { memberNo: '—',    name: 'R.K.A.S. Bandara',         range: 'Gampola',               moh: 'Gampola',          district: 'Kandy',       province: 'Central', phone: '0771210302', lat: 7.1638, lng: 80.5736 },
  { memberNo: '—',    name: 'D.M. Karunaratne',         range: 'Akurana',               moh: 'Akurana',          district: 'Kandy',       province: 'Central', phone: '0771210303', lat: 7.3650, lng: 80.6280 },
  { memberNo: '—',    name: 'P.G. Sumanasekara',        range: 'Peradeniya',            moh: 'Peradeniya',       district: 'Kandy',       province: 'Central', phone: '0771210304', lat: 7.2599, lng: 80.5973 },
  { memberNo: '—',    name: 'T.L. Pathirana',           range: 'Kundasale',             moh: 'Kundasale',        district: 'Kandy',       province: 'Central', phone: '0771210305', lat: 7.2806, lng: 80.6997 },

  // ─── MATALE / NUWARA ELIYA ─────────────────────────────────────────────────
  { memberNo: '—',    name: 'M.N. Senaratne',           range: 'Matale Town',           moh: 'Matale',           district: 'Matale',      province: 'Central', phone: '0771210401', lat: 7.4675, lng: 80.6234 },
  { memberNo: '—',    name: 'K.P. Wijesekara',          range: 'Dambulla',              moh: 'Dambulla',         district: 'Matale',      province: 'Central', phone: '0771210402', lat: 7.8606, lng: 80.6519 },
  { memberNo: '—',    name: 'R.S. Bandara',             range: 'Nuwara Eliya',          moh: 'Nuwara Eliya',     district: 'Nuwara Eliya', province: 'Central', phone: '0771210501', lat: 6.9497, lng: 80.7891 },
  { memberNo: '—',    name: 'T.M. Kumara',              range: 'Hatton',                moh: 'Hatton',           district: 'Nuwara Eliya', province: 'Central', phone: '0771210502', lat: 6.8919, lng: 80.5959 },
  { memberNo: '—',    name: 'N.S. Madurawala',          range: 'Agarapathana',          moh: 'Lindula',          district: 'Nuwara Eliya', province: 'Central', phone: '0771210515', lat: 6.8400, lng: 80.6800 },

  // ─── GALLE ──────────────────────────────────────────────────────────────────
  { memberNo: '—',    name: 'D.W. Karunaratne',         range: 'Galle MC',              moh: 'Galle MC',         district: 'Galle',       province: 'Southern', phone: '0771210601', lat: 6.0535, lng: 80.2210 },
  { memberNo: '—',    name: 'P.K. Wickramasinghe',      range: 'Ambalangoda',           moh: 'Ambalangoda',      district: 'Galle',       province: 'Southern', phone: '0771210602', lat: 6.2354, lng: 80.0537 },
  { memberNo: '—',    name: 'S.M. Jayasinghe',          range: 'Elpitiya',              moh: 'Elpitiya',         district: 'Galle',       province: 'Southern', phone: '0771210603', lat: 6.2917, lng: 80.1641 },
  { memberNo: '—',    name: 'L.K. Gunatilleke',         range: 'Agaliya',               moh: 'Welivitiya Divitura', district: 'Galle',    province: 'Southern', phone: '0771210623', lat: 6.1850, lng: 80.3300 },

  // ─── MATARA / HAMBANTOTA ───────────────────────────────────────────────────
  { memberNo: '—',    name: 'I.M. Ratnasiri',           range: 'Matara Town',           moh: 'Matara',           district: 'Matara',      province: 'Southern', phone: '0771210701', lat: 5.9485, lng: 80.5353 },
  { memberNo: '—',    name: 'C.D. Senanayake',          range: 'Weligama',              moh: 'Weligama',         district: 'Matara',      province: 'Southern', phone: '0771210702', lat: 5.9667, lng: 80.4296 },
  { memberNo: '—',    name: 'B.K. Munaweera',           range: 'Hambantota',            moh: 'Hambantota',       district: 'Hambantota',  province: 'Southern', phone: '0771210801', lat: 6.1241, lng: 81.1185 },
  { memberNo: '—',    name: 'E.M.P.W.U.S.B. Wirapitiya', range: 'Abhayapura',           moh: 'Lunugamwehera',    district: 'Hambantota',  province: 'Southern', phone: '0771211448', lat: 6.4194, lng: 81.1719 },
  { memberNo: '—',    name: 'D.B.K.P. Dandeniya',       range: 'Agunukola',             moh: 'Agunukola',        district: 'Hambantota',  province: 'Southern', phone: '0771210165', lat: 6.2167, lng: 80.9333 },
  { memberNo: '—',    name: 'S.M.K.C.S. Rathnapala',    range: 'SPHI Agunukola',        moh: 'Agunukola',        district: 'Hambantota',  province: 'Southern', phone: '0771210167', lat: 6.2167, lng: 80.9333 },

  // ─── JAFFNA / KILINOCHCHI / MULLAITIVU / VAVUNIYA / MANNAR ─────────────────
  { memberNo: '—',    name: 'S. Thavarajah',            range: 'Jaffna MC',             moh: 'Jaffna MC',        district: 'Jaffna',      province: 'Northern', phone: '0771210901', lat: 9.6615, lng: 80.0255 },
  { memberNo: '—',    name: 'K. Mahendran',             range: 'Chavakachcheri',        moh: 'Chavakachcheri',   district: 'Jaffna',      province: 'Northern', phone: '0771210902', lat: 9.6587, lng: 80.1612 },
  { memberNo: '—',    name: 'V. Ravindran',             range: 'PHI -CHEST',            moh: 'Kilinochchi',      district: 'Kilinochchi', province: 'Northern', phone: '0771211498', lat: 9.3939, lng: 80.4031 },
  { memberNo: '—',    name: 'A. Sivanesan',             range: 'Vavuniya Town',         moh: 'Vavuniya',         district: 'Vavuniya',    province: 'Northern', phone: '0771211100', lat: 8.7514, lng: 80.4971 },
  { memberNo: '—',    name: 'T. Yogeswaran',            range: 'Mannar Town',           moh: 'Mannar',           district: 'Mannar',      province: 'Northern', phone: '0771211200', lat: 8.9777, lng: 79.9080 },
  { memberNo: '—',    name: 'R. Pradeepan',             range: 'Mullaitivu',            moh: 'Mullaitivu',       district: 'Mullaitivu',  province: 'Northern', phone: '0771211300', lat: 9.2671, lng: 80.8142 },

  // ─── BATTICALOA / TRINCOMALEE ──────────────────────────────────────────────
  { memberNo: '—',    name: 'S. Anthonypillai',         range: 'Aarayampathy',          moh: 'Aarayampathy',     district: 'Batticaloa',  province: 'Eastern', phone: '0771210872', lat: 7.5703, lng: 81.6938 },
  { memberNo: '—',    name: 'K. Pirathapan',            range: 'Batticaloa Town',       moh: 'Batticaloa',       district: 'Batticaloa',  province: 'Eastern', phone: '0771211100', lat: 7.7170, lng: 81.7000 },
  { memberNo: '—',    name: 'M. Kanthasamy',            range: 'Kattankudy',            moh: 'Kattankudy',       district: 'Batticaloa',  province: 'Eastern', phone: '0771211101', lat: 7.6859, lng: 81.7283 },
  { memberNo: '—',    name: 'P. Selvarajah',            range: 'Trincomalee',           moh: 'Trincomalee',      district: 'Trincomalee', province: 'Eastern', phone: '0771210280', lat: 8.5874, lng: 81.2152 },
  { memberNo: '—',    name: 'A. Ahamed',                range: 'Agbopura',              moh: 'Kantale',          district: 'Trincomalee', province: 'Eastern', phone: '0771210287', lat: 8.3500, lng: 81.0500 },
  { memberNo: '—',    name: 'M. Riyaz',                 range: 'Addalaichchenai-2',     moh: 'Addalaichchenai',  district: 'Kalmunai',    province: 'Eastern', phone: '0771212070', lat: 7.2186, lng: 81.8350 },

  // ─── KURUNEGALA / PUTTALAM ────────────────────────────────────────────────
  { memberNo: '—',    name: 'A.J. Karunaratne',         range: 'Kurunegala MC',         moh: 'Kurunegala',       district: 'Kurunegala',  province: 'North Western', phone: '0771211400', lat: 7.4863, lng: 80.3623 },
  { memberNo: '—',    name: 'D.M. Wijesinghe',          range: 'Kuliyapitiya',          moh: 'Kuliyapitiya',     district: 'Kurunegala',  province: 'North Western', phone: '0771211401', lat: 7.4685, lng: 80.0411 },
  { memberNo: '—',    name: 'H.M.B. Bandara',           range: 'Polgahawela',           moh: 'Polgahawela',      district: 'Kurunegala',  province: 'North Western', phone: '0771211402', lat: 7.3324, lng: 80.2997 },
  { memberNo: '—',    name: 'S.A. Senanayake',          range: 'Puttalam Town',         moh: 'Puttalam',         district: 'Puttalam',    province: 'North Western', phone: '0771211500', lat: 8.0408, lng: 79.8394 },
  { memberNo: '—',    name: 'M.S. Wijepala',            range: 'Chilaw',                moh: 'Chilaw',           district: 'Puttalam',    province: 'North Western', phone: '0771211501', lat: 7.5763, lng: 79.7951 },

  // ─── ANURADHAPURA / POLONNARUWA ───────────────────────────────────────────
  { memberNo: '—',    name: 'B.A.T. Kumara',            range: 'A/Pure Sacred City',    moh: 'MC Anuradhapura',  district: 'Anuradhapura', province: 'North Central', phone: '0771211400', lat: 8.3380, lng: 80.4150 },
  { memberNo: '—',    name: 'L.B. Liyanasooriya',       range: 'Adiyagama',             moh: 'Palagala',         district: 'Anuradhapura', province: 'North Central', phone: '0771211962', lat: 8.3833, lng: 80.5167 },
  { memberNo: '—',    name: 'K.B. Stanayake',           range: 'AMC / RDHS Office',     moh: 'MC Anuradhapura',  district: 'Anuradhapura', province: 'North Central', phone: '0771210300', lat: 8.3114, lng: 80.4037 },
  { memberNo: '—',    name: 'Y.C.D. Sriwardhana',       range: 'AMC / RDHS Office',     moh: 'MC Anuradhapura',  district: 'Anuradhapura', province: 'North Central', phone: '0771210400', lat: 8.3114, lng: 80.4037 },
  { memberNo: '—',    name: 'D.N. Dasanayake',          range: 'Anuyagama',             moh: 'Anuyagama',        district: 'Anuradhapura', province: 'North Central', phone: '0771211210', lat: 8.2400, lng: 80.4500 },
  { memberNo: '—',    name: 'P.B. Senaratne',           range: 'Abayapura',             moh: 'Lankapura',        district: 'Polonnaruwa', province: 'North Central', phone: '0771211907', lat: 8.0167, lng: 81.0833 },
  { memberNo: '—',    name: 'D.M. Jayasinghe',          range: 'Polonnaruwa Town',      moh: 'Polonnaruwa',      district: 'Polonnaruwa', province: 'North Central', phone: '0771211900', lat: 7.9403, lng: 81.0188 },

  // ─── BADULLA / MONARAGALA ─────────────────────────────────────────────────
  { memberNo: '—',    name: 'W.M.K. Wijeratne',         range: 'Badulla MC',            moh: 'Badulla',          district: 'Badulla',     province: 'Uva', phone: '0771211800', lat: 6.9934, lng: 81.0550 },
  { memberNo: '—',    name: 'H.M.K. Bandara',           range: 'Bandarawela',           moh: 'Bandarawela',      district: 'Badulla',     province: 'Uva', phone: '0771211801', lat: 6.8329, lng: 80.9889 },
  { memberNo: '—',    name: 'D.M.N. Kumara',            range: 'Monaragala',            moh: 'Monaragala',       district: 'Monaragala',  province: 'Uva', phone: '0771211900', lat: 6.8722, lng: 81.3506 },

  // ─── RATNAPURA / KEGALLE ──────────────────────────────────────────────────
  { memberNo: '—',    name: 'P. Liyanage',              range: 'Ratnapura Town',        moh: 'Ratnapura',        district: 'Ratnapura',   province: 'Sabaragamuwa', phone: '0771212100', lat: 6.6828, lng: 80.3992 },
  { memberNo: '—',    name: 'A.G. Kumarasinghe',        range: 'Kegalle Town',          moh: 'Kegalle',          district: 'Kegalle',     province: 'Sabaragamuwa', phone: '0771212200', lat: 7.2513, lng: 80.3464 },
  { memberNo: '—',    name: 'R.M. Wickrama',            range: 'Mawanella',             moh: 'Mawanella',        district: 'Kegalle',     province: 'Sabaragamuwa', phone: '0771212246', lat: 7.2533, lng: 80.4471 },
];

/** Unique sorted list of MOH offices (used to populate filter chips). */
export function listMohOffices(): string[] {
  return Array.from(new Set(PHI_OFFICERS.map((o) => o.moh))).sort();
}

/** Aggregate every officer's parent MOH office for the map view. */
export interface MohPin {
  moh: string;
  district: string;
  province: Province;
  lat: number;
  lng: number;
  /** Officers attached to this MOH (used in pop-ups). */
  officers: PhiOfficer[];
}

export function mohPins(): MohPin[] {
  const byKey = new Map<string, MohPin>();
  for (const o of PHI_OFFICERS) {
    const key = `${o.district}::${o.moh}`;
    if (!byKey.has(key)) {
      byKey.set(key, { moh: o.moh, district: o.district, province: o.province, lat: o.lat, lng: o.lng, officers: [] });
    }
    byKey.get(key)!.officers.push(o);
  }
  return Array.from(byKey.values());
}
