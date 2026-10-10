// SalesSetu theme: indigo / violet brand with teal, amber and coral accents.
// ("green" is kept as the key name for the primary colour so all screens pick it up.)
export const C = {
  green: '#5B4CF0',        // primary (indigo-violet)
  greenMid: '#8B7CF6',
  greenLight: '#EEEBFF',
  yellow: '#FFB547',       // Day Start / highlight (amber)
  teal: '#12B5A0',
  pink: '#EC4899',
  bg: '#F4F5FB',
  card: '#FFFFFF',
  ink: '#1B1E3D',
  muted: '#6E7191',
  line: '#E4E6F0',
  red: '#F0506E',
  orange: '#FF8A3D',
  blue: '#3A86FF',
  stock: { available: '#22C55E', low: '#FACC15', excess: '#3A86FF', out: '#F0506E' },
};

// Gradients (LinearGradient colors)
export const G = {
  brand: ['#4338CA', '#6D28D9', '#9333EA'],
  header: ['#4F46E5', '#7C3AED'],
  amber: ['#FFC857', '#FF8A3D'],
  teal: ['#14C9A8', '#0EA5E9'],
  coral: ['#FF7A7A', '#F0506E'],
  violet: ['#A78BFA', '#7C3AED'],
  sun: ['#FDE68A', '#FDBA74'],
};

const shadow = { shadowColor: '#3B2FC9', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 };

export const S = {
  card: { backgroundColor: C.card, borderRadius: 18, padding: 16, marginHorizontal: 14, marginTop: 12, ...shadow },
  shadow,
  h1: { fontSize: 18, fontWeight: '800', color: C.ink },
  h2: { fontSize: 15, fontWeight: '700', color: C.ink },
  label: { fontSize: 12, color: C.muted },
  value: { fontSize: 14, color: C.ink, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1.2, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: C.ink, backgroundColor: '#FAFAFE' },
};

export const money = (n) => '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (d) => {
  const x = new Date(d);
  return x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const fmtDateTime = (d) => {
  const x = new Date(d);
  return x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + x.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
export const pad2 = (n) => String(n).padStart(2, '0');
export const dur = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor((s % 3600) / 60)) + ':' + pad2(s % 60); };
export const todayKey = (d = new Date()) => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
