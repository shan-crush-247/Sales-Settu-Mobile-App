// Local "temp data" store. Everything is saved on the phone (AsyncStorage) and survives app restarts.
// syncNow() simulates the scheduled jobs: SFA -> OOP order posting and OOP/SAP status updates.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { USER, DEALERS, BEATS, PRODUCTS, SUPPLIERS, INVOICES, LEAVE_TYPES, TAX_RATE } from '../data/seed';
import { todayKey } from '../theme';

const KEY = 'dm_sfa_state_v1';
const Ctx = createContext(null);

const initialState = () => ({
  loggedIn: false,
  lastLoginDay: null,
  lastSync: null,
  user: USER,
  dealers: DEALERS,
  beats: BEATS,
  products: PRODUCTS,
  suppliers: SUPPLIERS,
  invoices: INVOICES,
  payments: [],
  orders: [],
  orderSeq: 1096953,
  cart: null,               // { dealerId, supplierId, division, lines: { [productId]: { [colour]: { [size|styleIdx]: qty } } }, remarks }
  attendance: {},           // { 'YYYY-MM-DD': { start, end, photo, lat, lng, auto } }
  visits: [],               // { id, dealerId, beatId, via, checkIn, checkOut, tasksDone: [] }
  regularizations: [],
  leaves: [],
  leaveTypes: LEAVE_TYPES,
  expenses: [],
  surveyResponses: [],
  bpRequests: [],
  returns: [],
  syncErrors: [],
  pendingOutbox: 0,
});

export function AppProvider({ children }) {
  const [state, setState] = useState(null);
  const ref = useRef(null);
  ref.current = state;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setState(raw ? { ...initialState(), ...JSON.parse(raw) } : initialState());
      } catch { setState(initialState()); }
    })();
  }, []);

  useEffect(() => { if (state) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {}); }, [state]);

  const update = useCallback((fn) => setState((s) => ({ ...s, ...fn(s) })), []);

  // ---------- helpers ----------
  const dealer = useCallback((id) => ref.current?.dealers.find((d) => d.id === id), []);
  const product = useCallback((id) => ref.current?.products.find((p) => p.id === id), []);

  const lineAmount = (p, colourMap) => {
    let qty = 0, amt = 0;
    Object.values(colourMap || {}).forEach((sizes) => Object.entries(sizes).forEach(([k, q]) => {
      const [size, si] = k.split('|'); const row = p.sizes.find((r) => String(r.size) === size);
      if (row && q > 0) { qty += q; amt += q * row.fr[Number(si)]; }
    }));
    return { qty, amt };
  };
  const cartTotals = useCallback((cart) => {
    if (!cart) return { items: 0, qty: 0, subtotal: 0, tax: 0, total: 0 };
    let qty = 0, subtotal = 0, items = 0;
    Object.entries(cart.lines).forEach(([pid, cm]) => { const p = ref.current.products.find((x) => x.id === pid); if (!p) return; const r = lineAmount(p, cm); if (r.qty) { items++; qty += r.qty; subtotal += r.amt; } });
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return { items, qty, subtotal, tax, total: subtotal + tax };
  }, []);

  const outstandingFor = useCallback((dealerId) => (ref.current?.invoices || []).filter((i) => i.dealer === dealerId).map((i) => {
    const paid = i.paid + (ref.current.payments || []).filter((p) => p.invoice === i.no).reduce((a, b) => a + b.amount, 0);
    return { ...i, paidTotal: paid, due: Math.round((i.amount - paid) * 100) / 100, days: Math.floor((Date.now() - new Date(i.date)) / 86400000) };
  }), []);

  // ---------- actions ----------
  const actions = useMemo(() => ({
    login: () => update(() => ({ loggedIn: true })),
    logout: () => update(() => ({ loggedIn: false })),
    markDailySync: () => update(() => ({ lastLoginDay: todayKey(), lastSync: new Date().toISOString() })),

    dayStart: ({ photo, lat, lng }) => update((s) => ({ attendance: { ...s.attendance, [todayKey()]: { start: new Date().toISOString(), photo, lat, lng } } })),
    dayEnd: () => update((s) => { const k = todayKey(); return { attendance: { ...s.attendance, [k]: { ...s.attendance[k], end: new Date().toISOString() } } }; }),

    checkIn: (dealerId, beatId, via) => {
      const id = 'V' + Date.now();
      update((s) => ({ visits: [...s.visits, { id, dealerId, beatId, via, checkIn: new Date().toISOString(), checkOut: null, tasksDone: [] }] }));
      return id;
    },
    taskDone: (visitId, key) => update((s) => ({ visits: s.visits.map((v) => v.id === visitId && !v.tasksDone.includes(key) ? { ...v, tasksDone: [...v.tasksDone, key] } : v) })),
    checkOut: (visitId) => update((s) => ({ visits: s.visits.map((v) => v.id === visitId ? { ...v, checkOut: new Date().toISOString() } : v) })),
    endTrip: (beatId) => update((s) => ({ visits: s.visits.map((v) => v.beatId === beatId && !v.checkOut && (todayKey(new Date(v.checkIn)) === todayKey()) ? { ...v, checkOut: new Date().toISOString() } : v), endedBeats: { ...(s.endedBeats || {}), [beatId + todayKey()]: true } })),

    startCart: (dealerId, supplierId) => update((s) => (s.cart && s.cart.dealerId === dealerId ? { cart: { ...s.cart, supplierId } } : { cart: { dealerId, supplierId, division: null, lines: {}, remarks: {} } })),
    setQty: (pid, colour, size, si, qty) => update((s) => {
      const p = s.products.find((x) => x.id === pid);
      const cart = s.cart; if (!cart) return {};
      if (cart.division && cart.division !== p.division && Object.keys(cart.lines).length) return {}; // one division per order
      const lines = { ...cart.lines, [pid]: { ...(cart.lines[pid] || {}), [colour]: { ...((cart.lines[pid] || {})[colour] || {}), [size + '|' + si]: Math.max(0, qty) } } };
      return { cart: { ...cart, division: p.division, lines } };
    }),
    setRemark: (pid, text) => update((s) => ({ cart: { ...s.cart, remarks: { ...s.cart.remarks, [pid]: text } } })),
    removeLine: (pid) => update((s) => { const lines = { ...s.cart.lines }; delete lines[pid]; return { cart: { ...s.cart, lines, division: Object.keys(lines).length ? s.cart.division : null } }; }),
    clearCart: () => update(() => ({ cart: null })),

    placeOrder: async (delivery) => {
      const s = ref.current; const totals = cartTotals(s.cart);
      let online = true;
      try { const n = await Network.getNetworkStateAsync(); online = !!(n.isConnected && n.isInternetReachable !== false); } catch { online = true; }
      const no = 'SO26' + String(s.orderSeq + 1);
      const lines = [];
      Object.entries(s.cart.lines).forEach(([pid, cm]) => { const p = s.products.find((x) => x.id === pid); Object.entries(cm).forEach(([colour, sizes]) => Object.entries(sizes).forEach(([k, q]) => { if (q > 0) { const [size, si] = k.split('|'); const row = p.sizes.find((r) => String(r.size) === size); lines.push({ pid, name: p.name, style: p.styles[Number(si)], size, colour, qty: q, rate: row.fr[Number(si)], amount: q * row.fr[Number(si)] }); } })); });
      const order = { no, dealerId: s.cart.dealerId, supplierId: s.cart.supplierId, division: s.cart.division, lines, remarks: s.cart.remarks, ...totals, ...delivery,
        orderedAt: new Date().toISOString(), status: 'Draft', synced: online, oopNo: null, tracking: [] };
      update((st) => ({ orders: [order, ...st.orders], orderSeq: st.orderSeq + 1, cart: null, pendingOutbox: online ? st.pendingOutbox : st.pendingOutbox + 1 }));
      return { online, no };
    },

    // Simulated scheduled sync: Draft -> Order Placed (5-min job) -> Order Confirmed (OOP) -> Approved -> Invoiced -> Dispatched
    syncNow: async () => {
      let online = true;
      try { const n = await Network.getNetworkStateAsync(); online = !!(n.isConnected && n.isInternetReachable !== false); } catch { online = true; }
      if (!online) { update((s) => ({ syncErrors: [{ at: new Date().toISOString(), msg: 'No network - sync skipped. Pending entries stay on the phone.' }, ...s.syncErrors].slice(0, 20) })); return false; }
      const flow = ['Draft', 'Order Placed', 'Order Confirmed', 'Approved', 'Invoiced', 'Dispatched'];
      const msg = { 'Order Placed': 'Order placed in SFA and posted to OOP', 'Order Confirmed': 'Order confirmed by Customer Care in OOP', Approved: 'Order approved and sent to SAP', Invoiced: 'Invoice created in SAP', Dispatched: 'Goods dispatched (LR entered)' };
      update((s) => ({
        lastSync: new Date().toISOString(), pendingOutbox: 0,
        orders: s.orders.map((o) => {
          if (o.status === 'Cancelled') return o;
          const i = flow.indexOf(o.status); if (i < 0 || i >= flow.length - 1) return { ...o, synced: true };
          const next = flow[i + 1]; const now = new Date().toISOString();
          const oopNo = o.oopNo || (next === 'Order Confirmed' ? o.division + '/' + String(32774 + s.orders.indexOf(o)).padStart(7, '0') + '/2627' : null);
          return { ...o, synced: true, status: next, oopNo, tracking: [...o.tracking, { status: next, at: now, msg: msg[next] + (next === 'Order Confirmed' ? ' (' + oopNo + ')' : '') }] };
        }),
      }));
      return true;
    },

    pay: (dealerId, invoice, amount, mode, ref2) => update((s) => ({ payments: [{ id: 'PY' + Date.now(), dealerId, invoice, amount: Number(amount), mode, ref: ref2, at: new Date().toISOString() }, ...s.payments] })),
    initiateReturn: (dealerId, invoice, reason) => update((s) => ({ returns: [{ id: 'RT' + Date.now(), dealerId, invoice, reason, at: new Date().toISOString(), status: 'Submitted - processed in SAP' }, ...s.returns] })),
    regularize: (r) => update((s) => ({ regularizations: [{ id: 'RG' + Date.now(), ...r, status: 'Submitted', at: new Date().toISOString() }, ...s.regularizations] })),
    applyLeave: (l) => update((s) => ({ leaves: [{ id: 'LV' + Date.now(), ...l, status: 'Submitted', at: new Date().toISOString() }, ...s.leaves] })),
    addExpense: (e) => update((s) => ({ expenses: [{ id: 'EX' + Date.now(), ...e, at: new Date().toISOString() }, ...s.expenses] })),
    submitSurvey: (r) => update((s) => ({ surveyResponses: [{ id: 'SR' + Date.now(), ...r, at: new Date().toISOString() }, ...s.surveyResponses] })),
    requestBP: (b) => update((s) => ({ bpRequests: [{ id: 'BR' + Date.now(), ...b, status: 'Sent to OOP Back Office', at: new Date().toISOString() }, ...s.bpRequests] })),
    resetData: async () => { await AsyncStorage.removeItem(KEY); setState({ ...initialState(), loggedIn: true, lastLoginDay: todayKey(), lastSync: new Date().toISOString() }); },
  }), [update, cartTotals]);

  // Auto "5-minute job": posts Draft orders when online
  useEffect(() => {
    const t = setInterval(() => {
      const s = ref.current; if (s && s.loggedIn && s.orders.some((o) => o.status === 'Draft')) {
        Network.getNetworkStateAsync().then((n) => { if (n.isConnected) setState((st) => ({ ...st, orders: st.orders.map((o) => o.status === 'Draft' ? { ...o, synced: true, status: 'Order Placed', tracking: [...o.tracking, { status: 'Order Placed', at: new Date().toISOString(), msg: 'Order placed in SFA and posted to OOP' }] } : o) })); }).catch(() => {});
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (!state) return null;
  return <Ctx.Provider value={{ state, ...actions, dealer, product, cartTotals, outstandingFor, lineAmount }}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
