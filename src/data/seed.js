// Sample ("temp") master data, modelled on the SFA As-Is Functionality Handbook v5.1.
// Kept on the phone (AsyncStorage) until real OOP / SAP connections are available.

const day = 24 * 3600 * 1000;
const ago = (d) => new Date(Date.now() - d * day).toISOString();

export const USER = {
  employeeId: 'SE-1001',
  name: 'ARJUN KUMAR S',
  role: 'SE',
  designation: 'Senior Sales Associate',
  phone: '9000000001',
  reportingHead: 'PRAKASH RAO M',
  attendanceRequired: true,
  targetGroup: 'Dhoti-RHL',
  divisions: ['RR', 'ACC', 'AKG'],
};

// Demo login: Employee ID + password
export const DEMO_PASSWORD = 'demo123';

export const DATA_STORES = [
  'Resources', 'Accounts', 'AccountGroups', 'Contacts', 'Addresses', 'CreditLimits', 'Items', 'SKUs', 'ItemAliases',
  'PriceListRules', 'Stock', 'Quota', 'Schemes', 'Discounts', 'Suppliers', 'DealerDistributorMap', 'VisitPlans', 'VisitRoutes',
  'Beats', 'VisitTaskTemplates', 'ChecklistTemplates', 'SaleOrders', 'OrderTracking', 'Invoices', 'Outstanding', 'VisitSoup',
  'Attendance', 'LeaveBalance', 'ExpenseTypes', 'Surveys',
];

export const ORDER_TYPES = ['Regular Order', 'Date Order', 'Fair Order', 'Proforma Orders'];
export const TRANSPORT_MODES = ['Bus', 'Courier', 'Hand', 'Lorry', 'Train'];
export const EXPENSE_TYPES = ['Travel - Bus / Train', 'Travel - Own Vehicle', 'Food', 'Lodging', 'Courier / Postage', 'Mobile / Internet', 'Others'];
export const LEAVE_TYPES = [
  { type: 'Casual', stock: 12, utilized: 3 },
  { type: 'Sick', stock: 12, utilized: 1 },
  { type: 'Earned', stock: 15, utilized: 0 },
  { type: 'Comp Off', stock: 2, utilized: 0 },
  { type: 'Informed', stock: 4, utilized: 1 },
];

// Task templates: board differs by how the dealer is opened (handbook 3.2 / 4.6 / 4.10)
export const TASKS_BEAT = [
  { key: 'order', name: 'Order Capturing', mins: 15 },
  { key: 'competitor', name: 'Competitor Survey', mins: 5 },
  { key: 'planogram', name: 'Planogram', mins: 5 },
  { key: 'signature', name: 'Digital Signature', mins: 2 },
];
export const TASKS_DIRECT = [
  { key: 'payment', name: 'Payment', mins: 7 },
  { key: 'survey', name: 'Survey', mins: 5 },
];

export const SUPPLIERS = [
  { id: 'S1', name: 'Sunrise Trade Links Pvt Ltd' },
  { id: 'S2', name: 'Kaveri Textile Mills, Tiruppur' },
  { id: 'S3', name: 'Lotus Hosiery, Haveri' },
  { id: 'S4', name: 'Ramraj Cotton (Direct)' },
];

const addr = (name, line, city, state, pin) => `${name}: ${line}, ${city}, ${state}, India, ${pin}`;

export const DEALERS = [
  { id: 'C100001', name: 'Metro Garments', city: 'Dombivli East', state: 'Maharashtra', pin: '421201', area: 'KA27-DVG', phone: '9000000011', gst: '27AAAAA0001A1Z1', gstActive: false, transporter: 'COURIER', destination: 'THANE', suppliers: ['S1', 'S4'], premium: true,
    billing: addr('METRO GARMENTS', 'SHOP 4, STATION ROAD', 'DOMBIVLI (EAST), THANE', 'Maharashtra', '421201'),
    shipping: [addr('METRO GARMENTS', 'SHOP 4, STATION ROAD', 'DOMBIVLI (EAST), THANE', 'Maharashtra', '421201')],
    credit: [{ div: 'ACC', total: 500000, used: 120000, grade: 'A' }, { div: 'RR', total: 300000, used: 50000, grade: 'B' }] },
  { id: 'C100002', name: 'Style Corner', city: 'Thane', state: 'Maharashtra', pin: '400601', area: 'KA27-DVG', phone: '9000000012', gst: '27AAAAA0002A1Z2', gstActive: true, transporter: 'VRL LOGISTICS', destination: 'THANE', suppliers: ['S1'],
    billing: addr('STYLE CORNER', 'SHOP 9, MARKET STREET', 'THANE', 'Maharashtra', '400601'),
    shipping: [addr('STYLE CORNER', 'SHOP 9, MARKET STREET', 'THANE', 'Maharashtra', '400601')],
    credit: [{ div: 'ACC', total: 200000, used: 60000, grade: 'B' }] },
  { id: 'C100003', name: 'Sri Lakshmi Textiles', city: 'Davanagere', state: 'Karnataka', pin: '577001', area: 'KA28-DVG-BSC', phone: '9000000013', gst: '29AAAAA0003A1Z3', gstActive: true, transporter: 'SRS TRAVELS', destination: 'DAVANAGERE', suppliers: ['S2', 'S3'], premium: true,
    billing: addr('SRI LAKSHMI TEXTILES', 'MAIN BAZAAR ROAD', 'DAVANAGERE', 'Karnataka', '577001'),
    shipping: [addr('SRI LAKSHMI TEXTILES', 'MAIN BAZAAR ROAD', 'DAVANAGERE', 'Karnataka', '577001'), addr('SRI LAKSHMI TEXTILES - GODOWN', 'P J EXTENSION', 'DAVANAGERE', 'Karnataka', '577002')],
    credit: [{ div: 'RR', total: 800000, used: 310000, grade: 'A' }, { div: 'AKG', total: 100000, used: 0, grade: '--' }] },
  { id: 'C100004', name: 'Ganesh Silk Emporium', city: 'Davanagere', state: 'Karnataka', pin: '577001', area: 'KA28-DVG-BSC', phone: '9000000014', gst: '29AAAAA0004A1Z4', gstActive: true, transporter: 'SRS TRAVELS', destination: 'DAVANAGERE', suppliers: ['S2'],
    billing: addr('GANESH SILK EMPORIUM', 'GANDHI ROAD', 'DAVANAGERE', 'Karnataka', '577001'),
    shipping: [addr('GANESH SILK EMPORIUM', 'GANDHI ROAD', 'DAVANAGERE', 'Karnataka', '577001')],
    credit: [{ div: 'RR', total: 400000, used: 395000, grade: 'C' }] },
  { id: 'C100005', name: 'Kumar Fashions', city: 'Davanagere', state: 'Karnataka', pin: '577002', area: 'KA28-DVG-BSC', phone: '9000000015', gst: '', gstActive: false, transporter: 'LOCAL TRANSPORT', destination: 'DAVANAGERE', suppliers: ['S3'], dormant: true,
    billing: addr('KUMAR FASHIONS', 'NEHRU STREET', 'DAVANAGERE', 'Karnataka', '577002'),
    shipping: [addr('KUMAR FASHIONS', 'NEHRU STREET', 'DAVANAGERE', 'Karnataka', '577002')],
    credit: [{ div: 'RR', total: 150000, used: 20000, grade: 'B' }] },
  { id: 'C100006', name: 'Royal Cloth Store', city: 'Davanagere', state: 'Karnataka', pin: '577001', area: 'KA28-DVG-BSC', phone: '9000000016', gst: '29AAAAA0006A1Z6', gstActive: true, transporter: 'SRS TRAVELS', destination: 'DAVANAGERE', suppliers: ['S2', 'S3'],
    billing: addr('ROYAL CLOTH STORE', 'CLOCK TOWER ROAD', 'DAVANAGERE', 'Karnataka', '577001'),
    shipping: [addr('ROYAL CLOTH STORE', 'CLOCK TOWER ROAD', 'DAVANAGERE', 'Karnataka', '577001')],
    credit: [{ div: 'RR', total: 250000, used: 90000, grade: 'B' }] },
  { id: 'C100007', name: 'Venkatesh Traders', city: 'Ranebennur', state: 'Karnataka', pin: '581115', area: 'KA29-HAV', phone: '9000000017', gst: '', gstActive: false, transporter: 'LOCAL TRANSPORT', destination: 'HAVERI', suppliers: ['S2', 'S3'],
    billing: addr('VENKATESH TRADERS', 'RANEBENNUR', 'HAVERI', 'Karnataka', '581115'),
    shipping: [addr('VENKATESH TRADERS', 'RANEBENNUR', 'HAVERI', 'Karnataka', '581115')],
    credit: [{ div: 'AKG', total: 0, used: 0, grade: '--' }, { div: 'RR', total: 100000, used: 15000, grade: 'B' }] },
  { id: 'C100008', name: 'Navya Fashions', city: 'Harpanahalli', state: 'Karnataka', pin: '583131', area: 'KA30-BLR', phone: '9000000018', gst: '29AAAAA0008A1Z8', gstActive: true, transporter: 'VRL LOGISTICS', destination: 'HARPANAHALLI', suppliers: ['S3'],
    billing: addr('NAVYA FASHIONS', 'MAIN ROAD', 'HARPANAHALLI', 'Karnataka', '583131'),
    shipping: [addr('NAVYA FASHIONS', 'MAIN ROAD', 'HARPANAHALLI', 'Karnataka', '583131')],
    credit: [{ div: 'RR', total: 120000, used: 30000, grade: 'B' }] },
  { id: 'C100009', name: 'Shree Durga Textiles', city: 'Hirekerur', state: 'Karnataka', pin: '581111', area: 'KA29-HAV', phone: '9000000019', gst: '29AAAAA0009A1Z9', gstActive: true, transporter: 'LOCAL TRANSPORT', destination: 'HAVERI', suppliers: ['S3'],
    billing: addr('SHREE DURGA TEXTILES', 'BAZAAR STREET', 'HIREKERUR', 'Karnataka', '581111'),
    shipping: [addr('SHREE DURGA TEXTILES', 'BAZAAR STREET', 'HIREKERUR', 'Karnataka', '581111')],
    credit: [{ div: 'RR', total: 90000, used: 10000, grade: 'C' }] },
];

export const BEATS = [
  { id: 'B1', name: 'DAVANAGERE 1 (FN)', weekday: 'today', dealers: ['C100003', 'C100004', 'C100005', 'C100006'], mtd: 0, avgL3M: 184000 },
  { id: 'B2', name: 'HAVERI - RANEBENNUR', weekday: 'tomorrow', dealers: ['C100007', 'C100009'], mtd: 46500, avgL3M: 92000 },
  { id: 'B3', name: 'THANE - DOMBIVLI', weekday: 'later', dealers: ['C100001', 'C100002'], mtd: 12684, avgL3M: 58000 },
  { id: 'B4', name: 'HARPANAHALLI', weekday: 'later', dealers: ['C100008'], mtd: 0, avgL3M: 21000 },
];

const sz = (sizes, mrpH, frH, mrpF, frF) => sizes.map((s, i) => ({ size: s, mrp: [mrpH[i] ?? mrpH[mrpH.length - 1], mrpF ? (mrpF[i] ?? mrpF[mrpF.length - 1]) : null], fr: [frH[i] ?? frH[frH.length - 1], frF ? (frF[i] ?? frF[frF.length - 1]) : null] }));

export const PRODUCTS = [
  { id: 'P1', name: '100% Cotton', division: 'ACC', category: 'Shirt', brand: 'Ramraj', alias: 'Cotton Shirt', tags: ['new'], discount: 'TRADE DISCOUNT', qr: 'P1',
    styles: ['Half Sleeve', 'Full Sleeve'], colours: [{ code: 'W', name: 'W-White', core: true }, { code: 'C', name: 'C-Cream', core: true }, { code: 'SB', name: 'SB-Sky Blue', core: false }],
    sizes: sz([36, 38, 40, 42, 44, 46, 48, 50, 52], [995, 995, 995, 995, 995, 1145, 1145, 1320, 1320], [663, 663, 663, 663, 663, 763, 763, 878, 878], [1045, 1045, 1045, 1045, 1045, 1205, 1205, 1385, 1385], [696, 696, 696, 696, 696, 801, 801, 922, 922]),
    stock: { 36: ['available', 'low'], 38: ['available', 'low'], 40: ['available', 'available'], 42: ['available', 'available'], 44: ['available', 'available'], 46: ['out', 'low'], 48: ['available', 'available'], 50: ['available', 'out'], 52: ['available', 'available'] },
    description: '100% Cotton (chinese)', specs: '100% Cotton (chinese)' },
  { id: 'P2', name: 'Royal Gold Ni', division: 'ACC', category: 'Shirt', brand: 'Ramraj', alias: 'Royal Gold', tags: ['frequent'], discount: 'TRADE DISCOUNT', qr: 'P2',
    styles: ['Half Sleeve', 'Full Sleeve'], colours: [{ code: 'C', name: 'C-Cream', core: true }, { code: 'W', name: 'W-White', core: true }],
    sizes: sz([36, 38, 40, 42, 44], [1645], [1028], [1695], [1059]),
    stock: { 36: ['available', 'excess'], 38: ['available', 'available'], 40: ['available', 'available'], 42: ['low', 'available'], 44: ['out', 'available'] },
    description: 'Premium cotton shirt', specs: 'Regular fit' },
  { id: 'P3', name: 'Air Modal Brief', division: 'AKG', category: 'Briefs', brand: 'Ramraj Innerwear', alias: 'Modal Brief', tags: ['quick', 'frequent'], discount: '', qr: 'P3',
    styles: ['Brief'], colours: [{ code: 'NB', name: 'NB-Navy Blue', core: true }, { code: 'BK', name: 'BK-Black', core: true }, { code: 'GR', name: 'GR-Grey', core: false }],
    sizes: sz(['S', 'M', 'L', 'XL', 'XXL'], [299, 299, 299, 329, 329], [199, 199, 199, 219, 219]),
    stock: { S: ['available'], M: ['available'], L: ['low'], XL: ['available'], XXL: ['out'] }, description: 'Air modal brief', specs: 'Modal blend' },
  { id: 'P4', name: 'Kids Sukra Vest', division: 'AKG', category: 'Kids', brand: 'Ramraj Innerwear', alias: 'Kids Vest', tags: ['quick', 'new'], discount: '', qr: 'P4',
    styles: ['Vest'], colours: [{ code: 'W', name: 'W-White', core: true }],
    sizes: sz(['50', '55', '60', '65', '70'], [149], [99]),
    stock: { 50: ['available'], 55: ['available'], 60: ['available'], 65: ['low'], 70: ['available'] }, description: 'Kids cotton vest', specs: '100% cotton' },
  { id: 'P5', name: 'Bose Long Shorts', division: 'AKG', category: 'Shorts and Pants', brand: 'Ramraj Innerwear', alias: 'Long Shorts', tags: ['quick'], discount: '', qr: 'P5',
    styles: ['Shorts'], colours: [{ code: 'NB', name: 'NB-Navy Blue', core: true }, { code: 'GR', name: 'GR-Grey', core: true }],
    sizes: sz(['M', 'L', 'XL', 'XXL'], [449], [299]),
    stock: { M: ['available'], L: ['available'], XL: ['excess'], XXL: ['available'] }, description: 'Cotton long shorts', specs: 'Elastic waist' },
  { id: 'P6', name: 'Silk Dhoti 2 Mtr', division: 'RR', category: 'Dhoti', brand: 'Ramraj', alias: 'Silk Dhoti', tags: ['frequent', 'prebook'], discount: 'TRADE DISCOUNT', qr: 'P6',
    styles: ['Dhoti'], colours: [{ code: 'GD', name: 'GD-Gold Border', core: true }, { code: 'SV', name: 'SV-Silver Border', core: false }],
    sizes: sz(['2M', '4M'], [1499, 2799], [999, 1866]),
    stock: { '2M': ['available'], '4M': ['low'] }, description: 'Pure silk dhoti', specs: 'Zari border' },
  { id: 'P7', name: 'Pure Cotton Towel', division: 'RR', category: 'Towel', brand: 'Ramraj', alias: 'Towel', tags: ['new'], discount: '', qr: 'P7',
    styles: ['Towel'], colours: [{ code: 'W', name: 'W-White', core: true }, { code: 'MC', name: 'MC-Multi Colour', core: false }],
    sizes: sz(['Std', 'Large'], [349, 499], [233, 333]),
    stock: { Std: ['available'], Large: ['available'] }, description: 'Cotton bath towel', specs: '450 GSM' },
];

// Invoices / outstanding (from SAP in real life)
export const INVOICES = [
  { no: 'INV/2627/00101', dealer: 'C100003', div: 'RR', date: ago(12), amount: 78819, paid: 0 },
  { no: 'INV/2627/00102', dealer: 'C100003', div: 'RR', date: ago(41), amount: 144033, paid: 100000 },
  { no: 'INV/2627/00103', dealer: 'C100004', div: 'RR', date: ago(66), amount: 71907, paid: 0 },
  { no: 'INV/2627/00104', dealer: 'C100001', div: 'ACC', date: ago(8), amount: 34120, paid: 0 },
  { no: 'INV/2627/00105', dealer: 'C100007', div: 'RR', date: ago(95), amount: 15000, paid: 0 },
  { no: 'INV/2627/00106', dealer: 'C100006', div: 'RR', date: ago(3), amount: 58400, paid: 20000 },
  { no: 'INV/2627/00107', dealer: 'C100002', div: 'ACC', date: ago(120), amount: 6054.3, paid: 9000 },
];

export const TARGETS = { Monthly: 600000, Quarterly: 1800000, 'Half Year': 3600000, Annual: 7200000 };

export const SURVEYS = {
  outlet: [{ id: 'SV1', name: 'Competitor Survey', questions: ['Competitor brands sold', 'Fast moving competitor item', 'Competitor price range', 'Remarks'] }],
  generic: [{ id: 'SV2', name: 'Customer Feedback', complaint: true }],
};
export const COMPLAINT_TYPES = ['Shortage', 'Excess', 'Mismatch', 'Transport related', 'Quality issues', 'Packaging', 'Design change / Length issues'];

export const TAX_RATE = 0.05;
