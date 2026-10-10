import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, FlatList, Switch } from 'react-native';
import { openPicker } from '../components/DatePick';
import { useApp } from '../store/AppStore';
import { C, S, money, fmtDate, fmtDateTime } from '../theme';
import { Header, HeaderIcon, Btn, Card, KV, Field, Select, Sheet, Done, Empty, Badge, Chips, Seg, statusColor } from '../components/UI';
import { ORDER_TYPES, TRANSPORT_MODES } from '../data/seed';
import { OrderCard } from './Dealers';

const CartBar = ({ navigation }) => {
  const { state, cartTotals } = useApp();
  const t = cartTotals(state.cart);
  if (!state.cart || !t.qty) return null;
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ position: 'absolute', right: 16, bottom: 20, backgroundColor: C.green, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 12, elevation: 4 }}>
      <Text style={{ color: '#fff', fontWeight: '700' }}>{'🛒'} {t.qty} pcs - {money(t.total)}</Text>
    </TouchableOpacity>
  );
};

// ---------- Take Order: product catalogue ----------
export function CatalogScreen({ route, navigation }) {
  const { state, dealer } = useApp();
  const browse = route.params?.browse;
  const d = !browse && state.cart ? dealer(state.cart.dealerId) : null;
  const [tab, setTab] = useState('All');
  const [q, setQ] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filter, setFilter] = useState({ division: null, brand: null, category: null });
  const [sheet, setSheet] = useState(null);
  const freq = new Set(state.orders.filter((o) => d && o.dealerId === d.id).flatMap((o) => o.lines.map((l) => l.pid)));
  const list = state.products.filter((p) => {
    if (tab === 'Quick Pick' && !p.tags.includes('quick')) return false;
    if (tab === 'Frequently Ordered' && !(p.tags.includes('frequent') || freq.has(p.id))) return false;
    if (tab === 'Newly Added' && !p.tags.includes('new')) return false;
    if (tab === 'Pre-Book' && !p.tags.includes('prebook')) return false;
    if (filter.division && p.division !== filter.division) return false;
    if (filter.brand && p.brand !== filter.brand) return false;
    if (filter.category && p.category !== filter.category) return false;
    return (p.name + p.alias + p.category).toLowerCase().includes(q.toLowerCase());
  }).sort((a, b) => a.name.localeCompare(b.name));
  const uniq = (k) => [...new Set(state.products.map((p) => p[k]))];
  const groups = tab === 'Quick Pick' ? [...new Set(list.map((p) => p.division + ' - ' + p.category))] : null;
  const card = (p) => {
    const row = p.sizes[0];
    return (
      <Card key={p.id} onPress={() => navigation.navigate('ProductEntry', { id: p.id, browse })} style={{ marginTop: 8 }}>
        <View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{p.name}</Text><Text style={{ fontSize: 18 }}>{'›'}</Text></View>
        <Text style={S.label}>{p.division}  {p.category}</Text>
        <Text style={{ marginTop: 4 }}>FR: <Text style={{ color: C.green, fontWeight: '700' }}>{money(row.fr[0])}</Text>   <Text style={{ color: C.muted, textDecorationLine: 'line-through' }}>MRP: {money(row.mrp[0])}</Text></Text>
        {p.discount ? <Text style={{ marginTop: 6, color: C.green, fontSize: 12 }}>{'✔'} Discount : {p.discount}</Text> : null}
      </Card>);
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={browse ? 'Product Catalogue' : 'Take Order'} sub={d ? d.name : undefined} onBack={() => navigation.goBack()}
        right={<><HeaderIcon label="QR" onPress={() => navigation.navigate('Scan', { mode: 'product' })} /><HeaderIcon label={'⌕'} onPress={() => setShowSearch(!showSearch)} /><HeaderIcon label={'⧩'} onPress={() => setSheet('division')} /></>} />
      {showSearch ? <TextInput autoFocus placeholder="Search products" value={q} onChangeText={setQ} style={[S.input, { margin: 14, marginBottom: 0 }]} /> : null}
      <Chips items={['All', 'Quick Pick', 'Frequently Ordered', 'Newly Added', 'Pre-Book']} value={tab} onChange={setTab} />
      {(filter.division || filter.brand || filter.category) ? (
        <View style={[S.row, { marginHorizontal: 14, flexWrap: 'wrap' }]}>
          {Object.entries(filter).filter(([, v]) => v).map(([k, v]) => <Badge key={k} text={v} color={C.green} />)}
          <TouchableOpacity onPress={() => setFilter({ division: null, brand: null, category: null })}><Text style={{ color: C.red, marginLeft: 10 }}>Clear filters</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setSheet('brand')}><Text style={{ color: C.green, marginLeft: 10 }}>Brand</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setSheet('category')}><Text style={{ color: C.green, marginLeft: 10 }}>Category</Text></TouchableOpacity>
        </View>) : null}
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {list.length === 0 ? <Empty text="No Data Found" /> : groups ? groups.map((g) => (<View key={g}><Text style={{ marginHorizontal: 16, marginTop: 14, fontWeight: '700', color: C.muted }}>{g}</Text>{list.filter((p) => p.division + ' - ' + p.category === g).map(card)}</View>)) : list.map(card)}
      </ScrollView>
      {!browse ? <CartBar navigation={navigation} /> : null}
      <Sheet visible={!!sheet} title={sheet === 'division' ? 'Select Division' : sheet === 'brand' ? 'Select Brand' : 'Select Category'} options={sheet ? uniq(sheet) : []} value={sheet ? filter[sheet] : null}
        onSelect={(v) => { setFilter({ ...filter, [sheet]: v }); setSheet(sheet === 'division' ? 'brand' : null); }} onClose={() => setSheet(null)} />
    </View>
  );
}

// ---------- Product variant & quantity entry ----------
export function ProductEntryScreen({ route, navigation }) {
  const { state, product, setQty, setRemark } = useApp();
  const p = product(route.params.id);
  const browse = route.params.browse || !state.cart;
  const [scope, setScope] = useState('All Colors');
  const colours = p.colours.filter((c) => scope === 'All Colors' || (scope === 'Core' ? c.core : !c.core));
  const [colour, setColour] = useState(colours[0]?.name);
  const [images, setImages] = useState(false);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const lines = state.cart?.lines?.[p.id] || {};
  const qtyOf = (c, size, si) => (lines[c] || {})[size + '|' + si] || 0;
  const colourQty = (c) => Object.values(lines[c] || {}).reduce((a, b) => a + b, 0);
  const styleQty = (si) => Object.values(lines[colour] || {}).length ? Object.entries(lines[colour] || {}).filter(([k]) => k.endsWith('|' + si)).reduce((a, [, v]) => a + v, 0) : 0;
  const otherDivision = state.cart && state.cart.division && state.cart.division !== p.division && Object.keys(state.cart.lines).length;
  const change = (size, si, delta, stock) => {
    if (browse) { Alert.alert('Browse only', 'Open a dealer and tap the cart icon to take an order.'); return; }
    if (otherDivision) { Alert.alert('One division per order', `This cart is for ${state.cart.division}. Place it first, then start a new order for ${p.division}.`); return; }
    if (delta > 0 && stock === 'out') { Alert.alert('Out of stock', 'This size is out of stock.'); return; }
    setQty(p.id, colour, size, si, qtyOf(colour, size, si) + delta);
  };
  const stockSync = new Date(state.lastSync || Date.now());
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={browse ? 'Product' : 'Take Order'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Card>
          <Text style={S.h1}>{p.name}</Text>
          <View style={[S.row, { justifyContent: 'space-between', marginTop: 10 }]}>
            <Text style={{ color: C.muted }}>{p.division}</Text>
            <View style={S.row}><Text>Show Images </Text><Switch value={images} onValueChange={setImages} /></View>
          </View>
          {images ? <View style={{ height: 120, borderRadius: 10, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}><Text style={{ color: C.muted }}>NO IMAGE AVAILABLE (Gallery Portal sync)</Text></View> : null}
          <Seg items={['All Colors', 'Core', 'Non-Core']} value={scope} onChange={(v) => { setScope(v); const cs = p.colours.filter((c) => v === 'All Colors' || (v === 'Core' ? c.core : !c.core)); setColour(cs[0]?.name); }} style={{ marginTop: 12 }} />
          <ScrollView horizontal style={{ marginTop: 12 }}>
            {colours.map((c) => (
              <TouchableOpacity key={c.name} onPress={() => setColour(c.name)} style={{ borderWidth: 1.5, borderColor: colour === c.name ? C.green : C.line, borderRadius: 10, padding: 10, marginRight: 8, minWidth: 100 }}>
                <Text>{colour === c.name ? '◉' : '○'} {c.name}</Text><Text style={{ marginTop: 6 }}>QTY: <Text style={{ fontWeight: '700' }}>{colourQty(c.name)}</Text></Text>
              </TouchableOpacity>))}
          </ScrollView>
          <View style={[S.row, { flexWrap: 'wrap', marginTop: 12 }]}>
            {[['available', 'Available'], ['low', 'Low Stock'], ['excess', 'Excess Order'], ['out', 'Out Of Stock']].map(([k, l]) => <View key={k} style={[S.row, { marginRight: 12, marginBottom: 4 }]}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.stock[k], marginRight: 4 }} /><Text style={{ fontSize: 12 }}>{l}</Text></View>)}
          </View>
          <Text style={{ fontSize: 12, color: C.muted }}>Stock Sync At: {stockSync.toLocaleDateString('en-IN')}, {stockSync.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</Text>
        </Card>
        <Card>
          <View style={S.row}><Text style={{ width: 48, fontWeight: '700' }}>Size</Text>{p.styles.map((st, si) => <Text key={st} style={{ flex: 1, fontWeight: '700', fontSize: 13 }}>{st} ({styleQty(si)})</Text>)}<Text style={{ width: 44, fontWeight: '700', textAlign: 'center' }}>Total</Text></View>
          {p.sizes.map((row) => {
            const rowTotal = p.styles.reduce((a, _, si) => a + qtyOf(colour, row.size, si), 0);
            return (
              <View key={row.size} style={[S.row, { marginTop: 12 }]}>
                <View style={{ width: 44, height: 40, borderWidth: 1.5, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 4 }}><Text style={{ fontWeight: '700' }}>{row.size}</Text></View>
                {p.styles.map((st, si) => {
                  const stock = (p.stock[row.size] || [])[si] || 'available';
                  return (
                    <View key={st} style={{ flex: 1, marginHorizontal: 3 }}>
                      <View style={[S.row, { borderLeftWidth: 4, borderLeftColor: C.stock[stock], backgroundColor: '#F6F5FF', borderRadius: 10, justifyContent: 'space-between', paddingHorizontal: 8, height: 38 }]}>
                        <TouchableOpacity onPress={() => change(row.size, si, -1, stock)} hitSlop={8}><Text style={{ fontSize: 20, fontWeight: '700' }}>{'−'}</Text></TouchableOpacity>
                        <Text style={{ fontWeight: '700' }}>{qtyOf(colour, row.size, si) ? String(qtyOf(colour, row.size, si)).padStart(2, '0') : ''}</Text>
                        <TouchableOpacity onPress={() => change(row.size, si, 1, stock)} hitSlop={8}><Text style={{ fontSize: 20, fontWeight: '700', color: C.green }}>+</Text></TouchableOpacity>
                      </View>
                      <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>MRP {'₹'}{row.mrp[si]} <Text style={{ color: C.green, fontWeight: '700' }}>FR {'₹'}{row.fr[si]}</Text></Text>
                    </View>);
                })}
                <View style={{ width: 40, height: 38, borderWidth: 1.5, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Text>{String(rowTotal).padStart(2, '0')}</Text></View>
              </View>);
          })}
          {!browse ? (
            <TouchableOpacity onPress={() => setRemarkOpen(!remarkOpen)} style={{ alignSelf: 'flex-end', marginTop: 14 }}><Text>Add Remark {'✎'}</Text></TouchableOpacity>) : null}
          {remarkOpen ? <Field placeholder="Enter your remarks" value={state.cart?.remarks?.[p.id] || ''} onChangeText={(t) => setRemark(p.id, t)} /> : null}
          <Text style={[S.h2, { marginTop: 14 }]}>Description</Text><Text style={{ color: C.muted }}>{p.description}</Text>
          <Text style={[S.h2, { marginTop: 10 }]}>Specifications</Text><Text style={{ color: C.muted }}>{p.specs}</Text>
        </Card>
        {!browse ? <View style={[S.row, { margin: 14 }]}><Btn kind="outline" title="Back" onPress={() => navigation.goBack()} style={{ flex: 1, marginRight: 8 }} /><Btn title="Preview Order" onPress={() => navigation.navigate('Cart')} style={{ flex: 1 }} /></View> : null}
      </ScrollView>
    </View>
  );
}

// ---------- Order Summary (cart) ----------
export function CartScreen({ navigation }) {
  const { state, product, cartTotals, lineAmount, removeLine, setQty } = useApp();
  const [open, setOpen] = useState({});
  const [openColour, setOpenColour] = useState({});
  const cart = state.cart;
  const t = cartTotals(cart);
  if (!cart || !t.qty) return (<View style={{ flex: 1, backgroundColor: C.bg }}><Header title="Order Summary" onBack={() => navigation.goBack()} /><Empty text="The cart is empty" /></View>);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Order Summary" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {Object.entries(cart.lines).map(([pid, cm]) => {
          const p = product(pid); const r = lineAmount(p, cm); if (!r.qty) return null;
          const usedColours = Object.entries(cm).filter(([, sz]) => Object.values(sz).some((q) => q > 0));
          const styleTotals = p.styles.map((st, si) => [st, usedColours.reduce((a, [, sz]) => a + Object.entries(sz).filter(([k]) => k.endsWith('|' + si)).reduce((x, [, q]) => x + q, 0), 0)]).filter(([, q]) => q);
          return (
            <Card key={pid}>
              <View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h1}>{p.name}</Text><TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${p.name} from the cart?`, [{ text: 'Cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeLine(pid) }])}><Text style={{ color: C.red, fontSize: 18 }}>{'🗑'}</Text></TouchableOpacity></View>
              <Text style={{ color: C.muted, marginTop: 4 }}>QTY. <Text style={{ color: C.ink, fontWeight: '700' }}>{r.qty}</Text>   {styleTotals.map(([s, q]) => <Text key={s}>{s} <Text style={{ color: C.ink, fontWeight: '700' }}>{q}</Text>   </Text>)}</Text>
              <View style={[S.row, { marginTop: 6, flexWrap: 'wrap' }]}><Text style={{ color: C.muted }}>Colors {usedColours.length}  </Text>{usedColours.map(([c]) => <Badge key={c} text={c} color={C.ink} />)}</View>
              {open[pid] ? usedColours.map(([c, sz]) => {
                const n = Object.values(sz).reduce((a, b) => a + b, 0); const k = pid + c;
                return (
                  <View key={c} style={{ borderTopWidth: 1, borderColor: C.line, marginTop: 10, paddingTop: 10 }}>
                    <TouchableOpacity onPress={() => setOpenColour({ ...openColour, [k]: !openColour[k] })} style={[S.row, { justifyContent: 'space-between' }]}><Text>{c}:  <Text style={{ fontWeight: '700' }}>{n} items added</Text></Text><Text>{openColour[k] ? '⌄' : '›'}</Text></TouchableOpacity>
                    {openColour[k] ? Object.entries(sz).filter(([, q]) => q > 0).map(([key, q]) => { const [size, si] = key.split('|'); const row = p.sizes.find((x) => String(x.size) === size); return (
                      <View key={key} style={[S.row, { marginTop: 8 }]}>
                        <Text style={{ width: 40, fontWeight: '700' }}>{size}</Text><Text style={{ flex: 1, fontSize: 12, color: C.muted }}>{p.styles[si]}  MRP {'₹'}{row.mrp[si]}  FR {'₹'}{row.fr[si]}</Text>
                        <TouchableOpacity onPress={() => setQty(pid, c, size, si, q - 1)}><Text style={{ fontSize: 20, paddingHorizontal: 10 }}>{'−'}</Text></TouchableOpacity><Text style={{ fontWeight: '700' }}>{String(q).padStart(2, '0')}</Text>
                        <TouchableOpacity onPress={() => setQty(pid, c, size, si, q + 1)}><Text style={{ fontSize: 20, paddingHorizontal: 10, color: C.green }}>+</Text></TouchableOpacity>
                      </View>); }) : null}
                  </View>);
              }) : null}
              <TouchableOpacity onPress={() => setOpen({ ...open, [pid]: !open[pid] })} style={{ alignSelf: 'flex-end', marginTop: 10 }}><Text>{open[pid] ? 'Hide Details ⌃' : 'View Details ⌄'}</Text></TouchableOpacity>
            </Card>);
        })}
        <Card><Text style={S.h2}>Amount Summary</Text><SummaryRows t={t} /></Card>
      </ScrollView>
      <TotalBar total={t.total} label="Confirm Order" onPress={() => navigation.navigate('Delivery')} />
    </View>
  );
}

const SummaryRows = ({ t, discount = 0 }) => (<>
  {[['Total Items', t.items], ['Total Quantity', t.qty], ['Subtotal', money(t.subtotal)], ['Scheme Discount', money(0)], ['Contract Discount', money(discount)], ['Tax', money(t.tax)]].map(([k, v]) => (
    <View key={k} style={[S.row, { justifyContent: 'space-between', paddingVertical: 6, backgroundColor: k.includes('Discount') ? '#ECFDF5' : 'transparent', paddingHorizontal: 6, borderRadius: 6, marginTop: 2 }]}><Text style={{ color: k.includes('Discount') ? '#059669' : C.ink }}>{k}</Text><Text style={{ color: k.includes('Discount') ? '#059669' : C.ink, fontWeight: k.includes('Discount') ? '700' : '400' }}>{v}</Text></View>))}
  <View style={[S.row, { justifyContent: 'space-between', borderTopWidth: 1, borderColor: C.line, marginTop: 8, paddingTop: 10 }]}><Text style={S.h2}>Total</Text><Text style={S.h2}>{money(t.total)}</Text></View>
</>);

const TotalBar = ({ total, label, onPress }) => (
  <View style={{ position: 'absolute', left: 12, right: 12, bottom: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12, flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ flex: 1 }}><Text style={{ color: C.muted }}>Total Amount:</Text><Text style={{ fontSize: 20, fontWeight: '800' }}>{money(total)}</Text></View>
    <Btn title={label} onPress={onPress} />
  </View>
);

// ---------- Delivery Details ----------
export function DeliveryScreen({ navigation }) {
  const { state, dealer, cartTotals, placeOrder, startCart } = useApp();
  const cart = state.cart;
  const d = cart ? dealer(cart.dealerId) : null;
  const t = cartTotals(cart);
  const [orderType, setOrderType] = useState(null);
  const [custRef, setCustRef] = useState('');
  const [billing, setBilling] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [mode, setMode] = useState(null);
  const [dispatch, setDispatch] = useState(new Date());
  const [remarks, setRemarks] = useState('');
  const [sheet, setSheet] = useState(null);
  const [result, setResult] = useState(null);
  if (!cart && !result) return (<View style={{ flex: 1, backgroundColor: C.bg }}><Header title="Delivery Details" onBack={() => navigation.goBack()} /><Empty text="The cart is empty" /></View>);
  const supplier = cart ? state.suppliers.find((s) => s.id === cart.supplierId) : null;
  const pickDate = () => openPicker({ value: dispatch, mode: 'date', minimumDate: new Date(), onSet: setDispatch });
  const confirm = async () => {
    if (!orderType) return Alert.alert('Required', 'Select the Order Type.');
    if (!mode) return Alert.alert('Required', 'Select the Transport Mode.');
    const credit = d.credit.find((c) => c.div === cart.division);
    if (credit && credit.total > 0) {
      const used = credit.used + state.orders.filter((o) => o.dealerId === d.id && o.division === cart.division && o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0);
      if (used + t.total > credit.total) return Alert.alert('Credit limit', `Available credit for ${cart.division} is ${money(Math.max(0, credit.total - used))}. Order total ${money(t.total)} is more than the available credit.`);
    }
    const r = await placeOrder({ orderType, custRef, billing: d.billing, shipping: d.shipping[shipping], transportMode: mode, transporter: d.transporter, destination: d.destination, dispatchDate: dispatch.toISOString(), customerRemarks: remarks, orderBy: state.user.name + ' (' + state.user.employeeId + ')' });
    setResult(r);
  };
  const box = (title, required, children, right) => (<Card><View style={[S.row, { justifyContent: 'space-between', borderBottomWidth: 1, borderColor: C.line, paddingBottom: 10, marginBottom: 10 }]}><Text style={S.h2}>{title}{required ? <Text style={{ color: C.red }}> *</Text> : null}</Text>{right}</View>{children}</Card>);
  const radio = (on) => <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: C.green, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 }}>{on ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: C.green }} /> : null}</View>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Delivery Details" onBack={() => navigation.goBack()} />
      {cart ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
          {box('Supplier', false, <Text style={{ fontWeight: '700' }}>{supplier?.name}</Text>, <TouchableOpacity onPress={() => setSheet('supplier')}><Text style={{ color: C.green }}>Change Supplier</Text></TouchableOpacity>)}
          {box('Order Type', true, <Select label="Order Type" value={orderType} placeholder="Select Order Type" onPress={() => setSheet('type')} />)}
          {box('Customer Reference Number', false, <Field placeholder="Enter Customer Reference Number" value={custRef} onChangeText={setCustRef} />)}
          {box('Address', true, (<>
            <Text style={[S.h2, { marginBottom: 6 }]}>Select Billing Address</Text>
            <TouchableOpacity onPress={() => setBilling(0)} style={S.row}>{radio(billing === 0)}<Text style={{ flex: 1, color: C.muted }}>{d.billing}</Text></TouchableOpacity>
            <Text style={[S.h2, { marginVertical: 8 }]}>Select Shipping Address</Text>
            {d.shipping.map((s, i) => <TouchableOpacity key={i} onPress={() => setShipping(i)} style={[S.row, { alignItems: 'flex-start', marginBottom: 8 }]}>{radio(shipping === i)}<Text style={{ flex: 1, color: C.muted }}>Address {i + 1}: {s}</Text></TouchableOpacity>)}
            <Text>GSTIN - {d.gst || '--'}</Text><Text>GSTIN Status - <Text style={{ color: d.gstActive ? C.green : C.red }}>{d.gst ? (d.gstActive ? 'Active' : 'InActive') : '--'}</Text></Text>
          </>))}
          {box('Transportation Details', false, (<>
            <Select label="Select Transport Mode" required value={mode} placeholder="Select Transport Mode..." onPress={() => setSheet('mode')} />
            <Field label="Transporter Name" required value={d.transporter} editable={false} />
            <Field label="Destination" required value={d.destination} editable={false} />
          </>))}
          {box('Dispatch Date', true, <TouchableOpacity onPress={pickDate} style={[S.input, S.row, { justifyContent: 'space-between' }]}><Text>{dispatch.toLocaleDateString('en-GB').replace(/\//g, '-')}</Text><Text>{'📅'}</Text></TouchableOpacity>)}
          {box('Customer Remarks', false, (<><Field placeholder="Enter Customer Remarks" value={remarks} onChangeText={(v) => setRemarks(v.slice(0, 255))} multiline /><Text style={{ alignSelf: 'flex-end', color: C.muted }}>{remarks.length}/255</Text></>))}
        </ScrollView>) : null}
      {cart ? <TotalBar total={t.total} label="Confirm Order" onPress={confirm} /> : null}
      <Sheet visible={sheet === 'type'} title="Select Order Type" options={ORDER_TYPES} value={orderType} onSelect={(v) => { setOrderType(v); setSheet(null); }} onClose={() => setSheet(null)} />
      <Sheet visible={sheet === 'mode'} title="Select Transport Mode" options={TRANSPORT_MODES} value={mode} onSelect={(v) => { setMode(v); setSheet(null); }} onClose={() => setSheet(null)} />
      <Sheet visible={sheet === 'supplier'} title="Select Supplier" options={d ? state.suppliers.filter((s) => d.suppliers.includes(s.id)).map((s) => ({ label: s.name, value: s.id })) : []} value={cart?.supplierId} onSelect={(v) => { startCart(d.id, v); setSheet(null); }} onClose={() => setSheet(null)} />
      <Done visible={!!result} title={result?.online ? 'Success' : 'Order Saved'} message={result?.online ? 'The order has been placed successfully' : 'It will be sent automatically. Do not enter it again.'}
        onOk={() => { const no = result.no; setResult(null); navigation.popToTop(); navigation.navigate('OrderDetail', { no }); }} />
    </View>
  );
}

// ---------- My Orders ----------
export function MyOrdersScreen({ navigation }) {
  const { state, dealer } = useApp();
  const [period, setPeriod] = useState('All');
  const [status, setStatus] = useState('All');
  const [sheet, setSheet] = useState(null);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState(false);
  const now = new Date(); const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const wk = new Date(sod); wk.setDate(sod.getDate() - sod.getDay());
  const lwk = new Date(wk); lwk.setDate(wk.getDate() - 7);
  const inPeriod = (d) => { const x = new Date(d); return period === 'All' || (period === 'Today' && x >= sod) || (period === 'This Week' && x >= wk) || (period === 'Last Week' && x >= lwk && x < wk) || (period === 'This Month' && x >= new Date(now.getFullYear(), now.getMonth(), 1)) || (period === 'Last Month' && x >= new Date(now.getFullYear(), now.getMonth() - 1, 1) && x < new Date(now.getFullYear(), now.getMonth(), 1)); };
  const list = state.orders.filter((o) => inPeriod(o.orderedAt) && (status === 'All' || o.status === status) && (o.no + dealer(o.dealerId).name + o.dealerId).toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="My Orders" right={<><HeaderIcon label={'⌕'} onPress={() => setSearch(!search)} /><HeaderIcon label={'✕'} onPress={() => { setPeriod('All'); setStatus('All'); setQ(''); }} /></>} />
      {search ? <TextInput autoFocus placeholder="Search order no. or dealer" value={q} onChangeText={setQ} style={[S.input, { margin: 14, marginBottom: 0 }]} /> : null}
      <View style={[S.row, { margin: 14, marginBottom: 0 }]}>
        <TouchableOpacity onPress={() => setSheet('period')} style={{ flex: 1, backgroundColor: '#EEEBFF', borderRadius: 14, padding: 12, alignItems: 'center', marginRight: 10 }}><Text>{period === 'All' ? 'Period' : period} {'⌄'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setSheet('status')} style={{ flex: 1, backgroundColor: '#EEEBFF', borderRadius: 14, padding: 12, alignItems: 'center' }}><Text>{status === 'All' ? 'Status' : status} {'⌄'}</Text></TouchableOpacity>
      </View>
      <FlatList data={list} keyExtractor={(o) => o.no} contentContainerStyle={{ paddingBottom: 20 }} ListEmptyComponent={<Empty />}
        renderItem={({ item }) => <OrderCard o={item} d={dealer(item.dealerId)} onPress={() => navigation.navigate('OrderDetail', { no: item.no })} />} />
      <Sheet visible={sheet === 'period'} title="Period" options={['All', 'Today', 'This Week', 'Last Week', 'This Month', 'Last Month']} value={period} onSelect={(v) => { setPeriod(v); setSheet(null); }} onClose={() => setSheet(null)} />
      <Sheet visible={sheet === 'status'} title="Status" options={['All', 'Draft', 'Order Placed', 'Order Confirmed', 'Approved', 'Invoiced', 'Dispatched']} value={status} onSelect={(v) => { setStatus(v); setSheet(null); }} onClose={() => setSheet(null)} />
    </View>
  );
}

// ---------- Order details + tracking ----------
export function OrderDetailScreen({ route, navigation }) {
  const { state, dealer } = useApp();
  const o = state.orders.find((x) => x.no === route.params.no);
  const [open, setOpen] = useState(false);
  if (!o) return null;
  const d = dealer(o.dealerId);
  const steps = ['Order Placed', 'Order Confirmed', 'Approved', 'Invoiced', 'Dispatched'];
  const done = o.tracking.map((t) => t.status);
  const next = steps.find((s) => !done.includes(s));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={d.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Card>
          <TouchableOpacity onPress={() => setOpen(!open)} style={[S.row, { justifyContent: 'space-between' }]}><Text>Order No. <Text style={{ fontWeight: '700' }}>{o.no}</Text></Text><View style={S.row}><Badge text={o.status} color={statusColor(o.status)} /><Text style={{ marginLeft: 8 }}>{open ? '⌃' : '⌄'}</Text></View></TouchableOpacity>
          {!o.synced ? <Text style={{ color: C.orange, marginTop: 6, fontSize: 12 }}>Saved on phone - will be sent at the next sync.</Text> : null}
          {open ? (
            <View style={{ borderTopWidth: 1, borderColor: C.line, marginTop: 10, paddingTop: 10 }}>
              <View style={S.row}><KV k="Customer Reference No." v={o.custRef || '--'} style={{ flex: 1 }} /><KV k="Division" v={o.division} style={{ flex: 1 }} /></View>
              <View style={S.row}><KV k="Order Date" v={fmtDateTime(o.orderedAt)} style={{ flex: 1 }} /><KV k="Shipment Date" v={fmtDate(o.dispatchDate)} style={{ flex: 1 }} /></View>
              <View style={S.row}><KV k="Order Amount" v={money(o.total)} style={{ flex: 1 }} /><KV k="Transport Mode" v={o.transportMode} style={{ flex: 1 }} /></View>
              <View style={S.row}><KV k="Transporter Name" v={o.transporter} style={{ flex: 1 }} /><KV k="Order By" v={o.orderBy} style={{ flex: 1 }} /></View>
              <View style={S.row}><KV k="Order Type" v={o.orderType} style={{ flex: 1 }} /><KV k="OOP Order No." v={o.oopNo || '--'} style={{ flex: 1 }} /></View>
              <KV k="Billing Address" v={o.billing} /><KV k="Shipping Address" v={o.shipping} />
              {o.customerRemarks ? <KV k="Customer Remarks" v={o.customerRemarks} /> : null}
            </View>) : null}
        </Card>
        <Card>
          <Text style={S.h2}>Order Tracking</Text>
          {o.tracking.length === 0 ? <Text style={{ color: C.muted, marginTop: 8 }}>Tracking details are not available for this order yet.</Text> : (
            <View style={{ marginTop: 10 }}>
              {o.tracking.map((t, i) => (<View key={i} style={[S.row, { alignItems: 'flex-start', marginBottom: 10 }]}><Text style={{ color: C.green, marginRight: 10 }}>{'●'}</Text><View style={{ flex: 1 }}><Text style={{ fontWeight: '700' }}>{t.status}</Text><Text style={{ fontSize: 12, color: C.muted }}>{t.msg}</Text><Text style={{ fontSize: 12, color: C.muted }}>{fmtDateTime(t.at)}</Text></View></View>))}
              {next ? <View style={[S.row, { alignItems: 'flex-start' }]}><Text style={{ color: C.line, marginRight: 10 }}>{'○'}</Text><View><Text style={{ color: C.muted, fontWeight: '700' }}>{next}</Text><Text style={{ fontSize: 12, color: C.muted }}>Awaiting update</Text></View></View> : null}
            </View>)}
        </Card>
        <Text style={[S.h2, { marginHorizontal: 16, marginTop: 14 }]}>Total {o.lines.length} Items</Text>
        <Card>{o.lines.map((l, i) => (<View key={i} style={{ borderBottomWidth: i < o.lines.length - 1 ? 1 : 0, borderColor: C.line, paddingVertical: 8 }}><View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{l.name}</Text><Text style={S.h2}>{money(l.amount * 1.05)}</Text></View><Text style={{ color: C.muted, fontSize: 12 }}>Qty. {l.qty}   Style: {l.style}   Size: {l.size}   Colour: {l.colour.split('-').slice(1).join('-') || l.colour}</Text></View>))}</Card>
        <Card><Text style={S.h2}>Amount Summary</Text><SummaryRows t={o} /></Card>
      </ScrollView>
    </View>
  );
}
