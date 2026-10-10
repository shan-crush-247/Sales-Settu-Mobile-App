import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SectionList, Alert, Image, PanResponder } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../store/AppStore';
import { C, S, money, fmtDate, fmtDateTime, fmtTime, dur, todayKey } from '../theme';
import { Header, HeaderIcon, Btn, Seg, Card, KV, Field, Sheet, Empty, Badge, Chips, statusColor, Done } from '../components/UI';
import { TASKS_BEAT, TASKS_DIRECT } from '../data/seed';

// ---------- Visit Plans ----------
export function VisitPlansScreen({ navigation }) {
  const { state } = useApp();
  const [tab, setTab] = useState("Today's Beat");
  const [q, setQ] = useState('');
  const list = state.beats.filter((b) => (tab === "Today's Beat" ? b.weekday === 'today' : true) && b.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Visit Plans" />
      <Seg items={["Today's Beat", "All Beat's"]} value={tab} onChange={setTab} style={{ margin: 14, marginBottom: 0 }} />
      <TextInput placeholder="Search beat" value={q} onChangeText={setQ} style={[S.input, { marginHorizontal: 14, marginTop: 10 }]} />
      <View style={[S.row, { justifyContent: 'space-between', marginHorizontal: 14, marginTop: 10 }]}><Text style={S.label}>Beats {list.length}</Text><TouchableOpacity onPress={() => Alert.alert('Reschedule Beats', 'Beat reschedule request saved. It will be updated after sync.')}><Text style={{ color: C.green, fontWeight: '700' }}>Reschedule Beats</Text></TouchableOpacity></View>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {list.map((b) => {
          const visited = b.dealers.filter((d) => state.visits.some((v) => v.dealerId === d && (todayKey(new Date(v.checkIn)) === todayKey()))).length;
          return (
            <Card key={b.id} onPress={() => navigation.navigate('BeatOutlets', { id: b.id })}>
              <Text style={S.h2}>{b.name}</Text>
              <Text style={S.label}>{b.weekday === 'today' ? 'Today' : b.weekday === 'tomorrow' ? 'Tomorrow' : 'This month'}</Text>
              <View style={[S.row, { marginTop: 10 }]}>
                <KV k="Visited Outlets" v={visited} style={{ flex: 1 }} /><KV k="Non Visited Outlets" v={b.dealers.length - visited} style={{ flex: 1 }} />
              </View>
              <View style={[S.row, { backgroundColor: C.greenLight, borderRadius: 8, padding: 8 }]}><Text style={{ flex: 1 }}>MTD {money(b.mtd)}</Text><Text>Avg L3M {money(b.avgL3M)}</Text></View>
            </Card>);
        })}
      </ScrollView>
    </View>
  );
}

export function BeatOutletsScreen({ route, navigation }) {
  const { state, dealer, endTrip } = useApp();
  const b = state.beats.find((x) => x.id === route.params.id);
  const ended = (state.endedBeats || {})[b.id + todayKey()];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Visit Plans" sub={b.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Card>
          <Text style={S.h2}>End Trip</Text>
          <Text style={{ color: C.muted, marginVertical: 6 }}>Once all activities are completed, tap End.</Text>
          <Btn kind="danger" small title={ended ? 'Trip ended' : 'End'} disabled={!!ended} onPress={() => Alert.alert('End Trip', 'End this beat for today?', [{ text: 'Cancel' }, { text: 'End', onPress: () => endTrip(b.id) }])} />
        </Card>
        <Text style={[S.label, { marginHorizontal: 14, marginTop: 12 }]}>Visits {b.dealers.length}</Text>
        {b.dealers.map((id) => {
          const d = dealer(id); const v = state.visits.filter((x) => x.dealerId === id && (todayKey(new Date(x.checkIn)) === todayKey())).slice(-1)[0];
          const spent = v ? (new Date(v.checkOut || Date.now()) - new Date(v.checkIn)) : 0;
          return (
            <Card key={id} onPress={() => navigation.navigate('Dealer', { id, via: 'beat', beatId: b.id })} style={S.row}>
              <View style={{ width: 70 }}>{v ? <><Text style={{ fontSize: 12 }}>{fmtTime(v.checkIn)}</Text><Text style={{ fontSize: 11, color: C.muted }}>{dur(spent)}</Text></> : <Text style={{ color: C.muted }}>--</Text>}</View>
              <View style={{ flex: 1 }}><Text style={S.h2}>{d.name}, {d.city}</Text><Text style={S.label}>BP Code : {d.id}   Area Code : {d.area}</Text><Text style={S.label}>Phone : {d.phone}</Text></View>
              {v ? <Text style={{ fontSize: 20, color: v.checkOut && spent < 120000 ? C.orange : C.green }}>{v.checkOut && spent < 120000 ? '⚠' : '✔'}</Text> : null}
            </Card>);
        })}
      </ScrollView>
    </View>
  );
}

// ---------- BP Directory ----------
export function BPListScreen({ navigation }) {
  const { state } = useApp();
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const sections = useMemo(() => {
    const list = state.dealers.filter((d) => (d.name + d.id + d.city).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
    const g = {}; list.forEach((d) => { const k = d.name[0].toUpperCase(); (g[k] = g[k] || []).push(d); });
    return Object.keys(g).sort().map((k) => ({ title: k, data: g[k] }));
  }, [q, state.dealers]);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Business Partner" right={<><HeaderIcon label="QR" onPress={() => navigation.navigate('Scan', { mode: 'bp' })} /><HeaderIcon label={'⌕'} onPress={() => setSearching(!searching)} /><HeaderIcon label="+" onPress={() => navigation.navigate('AddBP')} /></>} />
      {searching ? <TextInput autoFocus placeholder="Search name, BP code or city" value={q} onChangeText={setQ} style={[S.input, { margin: 14, marginBottom: 0 }]} /> : null}
      <Text style={[S.h2, { margin: 14, marginBottom: 0 }]}>Total BPs : {state.dealers.length}</Text>
      <SectionList sections={sections} keyExtractor={(d) => d.id} contentContainerStyle={{ paddingBottom: 20 }}
        renderSectionHeader={({ section }) => <Text style={{ marginHorizontal: 16, marginTop: 12, fontWeight: '700', color: C.muted }}>{section.title}</Text>}
        renderItem={({ item: d }) => (
          <Card onPress={() => navigation.navigate('Dealer', { id: d.id, via: 'direct' })} style={{ marginTop: 6 }}>
            <Text style={S.h2}>{d.name}, {d.city}</Text><Text style={S.label}>{d.state}, {d.pin}</Text><Text style={S.label}>BP Code: {d.id}</Text>
          </Card>)} />
    </View>
  );
}

export function AddBPScreen({ navigation }) {
  const { requestBP } = useApp();
  const [f, setF] = useState({ name: '', display: '', type: 'Dealer', area: '', first: '', last: '', phone: '', street: '', city: '', state: '', pin: '', gstin: '', division: '', destination: '', transporter: '', remarks: '' });
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const submit = () => {
    if (!f.name || !f.phone || !f.city || !f.pin) { Alert.alert('Fill BP Name, Phone, City and Postal Code.'); return; }
    requestBP(f); Alert.alert('Request sent', 'The new BP request is saved. BPs are created in OOP Back Office.'); navigation.goBack();
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Add New BP" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Field label="BP Name" required value={f.name} onChangeText={set('name')} /><Field label="Display Name" value={f.display} onChangeText={set('display')} />
        <Field label="BP Type" value={f.type} onChangeText={set('type')} /><Field label="Area Code" value={f.area} onChangeText={set('area')} />
        <Field label="Contact First Name" value={f.first} onChangeText={set('first')} /><Field label="Contact Last Name" value={f.last} onChangeText={set('last')} />
        <Field label="Phone" required keyboardType="phone-pad" value={f.phone} onChangeText={set('phone')} />
        <Field label="Street / Building" value={f.street} onChangeText={set('street')} /><Field label="City" required value={f.city} onChangeText={set('city')} />
        <Field label="State" value={f.state} onChangeText={set('state')} /><Field label="Postal Code" required keyboardType="number-pad" value={f.pin} onChangeText={set('pin')} />
        <Field label="GSTIN" value={f.gstin} onChangeText={set('gstin')} autoCapitalize="characters" /><Field label="Division Code" value={f.division} onChangeText={set('division')} />
        <Field label="Destination" value={f.destination} onChangeText={set('destination')} /><Field label="Transporter Name" value={f.transporter} onChangeText={set('transporter')} />
        <Field label="BP Remarks" multiline value={f.remarks} onChangeText={set('remarks')} />
        <Btn title="Submit" onPress={submit} />
      </ScrollView>
    </View>
  );
}

// ---------- QR scanner (dealer or product) ----------
export function ScanScreen({ route, navigation }) {
  const { state, dealer } = useApp();
  const mode = route.params.mode;
  const [perm, requestPerm] = useCameraPermissions();
  const done = useRef(false);
  useEffect(() => { if (perm && !perm.granted && perm.canAskAgain) requestPerm(); }, [perm]);
  const onScan = ({ data }) => {
    if (done.current) return;
    let code = String(data || '').trim();
    try { const j = JSON.parse(code); code = j.bpCode || j.BPCode || j.sku || j.productId || code; } catch {}
    if (mode === 'bp') {
      const d = dealer(code.toUpperCase());
      if (!d) { done.current = true; Alert.alert('Not found', 'This QR is not a Business Partner linked to you: ' + code, [{ text: 'Scan again', onPress: () => { done.current = false; } }]); return; }
      done.current = true; navigation.replace('Dealer', { id: d.id, via: 'direct' });
    } else {
      const p = state.products.find((x) => x.qr === code || x.id === code.toUpperCase());
      if (!p) { done.current = true; Alert.alert('Not found', 'No product for this code: ' + code, [{ text: 'Scan again', onPress: () => { done.current = false; } }]); return; }
      done.current = true; navigation.replace('ProductEntry', { id: p.id });
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Header title={mode === 'bp' ? 'Scan Business Partner' : 'Scan Products'} onBack={() => navigation.goBack()} />
      {perm && perm.granted ? (
        <CameraView style={{ flex: 1 }} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={onScan} />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}><Text style={{ color: '#fff', textAlign: 'center', marginBottom: 16 }}>Camera permission is needed to scan QR codes.</Text><Btn title="Allow camera" onPress={requestPerm} /></View>
      )}
      <View style={{ padding: 14, backgroundColor: '#111' }}><Text style={{ color: '#ccc', textAlign: 'center', fontSize: 12 }}>Demo QR text: {mode === 'bp' ? 'a BP code, e.g. C051500' : 'a product code, e.g. P1'}</Text></View>
    </View>
  );
}

// ---------- Dealer page: Store Info / Tasks / History ----------
export function DealerScreen({ route, navigation }) {
  const { id, via = 'direct', beatId } = route.params;
  const { state, dealer, checkIn, checkOut, taskDone, outstandingFor, startCart } = useApp();
  const d = dealer(id);
  const [tab, setTab] = useState(via === 'beat' ? 'Tasks' : 'Store Info');
  const [hist, setHist] = useState('Orders');
  const [supSheet, setSupSheet] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const visit = state.visits.filter((v) => v.dealerId === id && v.via === via && !v.checkOut && (todayKey(new Date(v.checkIn)) === todayKey())).slice(-1)[0];
  const tasks = via === 'beat' ? TASKS_BEAT : TASKS_DIRECT;
  const suppliers = state.suppliers.filter((s) => d.suppliers.includes(s.id));
  const frequent = [...new Set(state.orders.filter((o) => o.dealerId === id).flatMap((o) => o.lines.map((l) => l.name)))];
  const dayStarted = !!state.attendance[todayKey()]?.start;

  const startOrder = () => setSupSheet(true);
  const openTask = (t) => {
    if (via === 'beat' && !visit) { Alert.alert('Check In first', 'Tap Check In to start the visit.'); return; }
    if (visit) taskDone(visit.id, t.key);
    if (t.key === 'order') return startOrder();
    if (t.key === 'payment') return navigation.navigate('Payment', { id });
    if (t.key === 'survey') return navigation.navigate('Survey', { dealerId: id });
    if (t.key === 'competitor') return navigation.navigate('SurveyForm', { surveyId: 'SV1', dealerId: id });
    if (t.key === 'planogram') return navigation.navigate('Planogram', { dealerId: id });
    if (t.key === 'signature') return navigation.navigate('Signature', { dealerId: id });
  };
  const doCheckIn = () => { if (!dayStarted && state.user.attendanceRequired) { Alert.alert('Day Start needed', 'Tap Day Start on Home before visiting dealers.'); return; } checkIn(id, beatId, via); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={`${d.name}, ${d.city}`} onBack={() => navigation.goBack()} right={<HeaderIcon label={'🛒'} onPress={startOrder} />} />
      <Seg items={['Store Info', 'Tasks', 'History']} value={tab} onChange={setTab} style={{ margin: 14, marginBottom: 0 }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {tab === 'Store Info' && (<>
          <Card>
            <Text style={S.h2}>Business Partner Details</Text>
            <Text style={{ marginTop: 10, fontWeight: '700' }}>GST: {d.gst || '--'} {d.gst ? <Text style={{ color: d.gstActive ? C.green : C.red, fontWeight: '400' }}>({d.gstActive ? 'Active' : 'InActive'})</Text> : null}</Text>
            <Text style={[S.h2, { marginTop: 10 }]}>Address</Text>
            <Text style={S.label}>Address 1  <Text style={{ fontWeight: '700', color: C.ink }}>Billing Address</Text></Text><Text style={{ marginBottom: 8 }}>{d.billing}</Text>
            {d.shipping.map((s, i) => <View key={i}><Text style={S.label}>Address {i + 2}  <Text style={{ fontWeight: '700', color: C.ink }}>Shipping Address</Text></Text><Text style={{ marginBottom: 8 }}>{s}</Text></View>)}
          </Card>
          <Card>
            <Text style={S.h2}>Credit Limit</Text>
            {d.credit.map((c) => {
              const used = c.used + state.orders.filter((o) => o.dealerId === id && o.division === c.div && o.status !== 'Cancelled').reduce((a, o) => a + o.total, 0);
              return (<View key={c.div} style={{ borderTopWidth: 1, borderColor: C.line, marginTop: 10, paddingTop: 10 }}>
                <Text style={{ fontWeight: '700' }}>{c.div}</Text>
                <View style={S.row}><KV k="Total Credit Limit" v={money(c.total)} style={{ flex: 1 }} /><KV k="Utilized Amt." v={money(used)} style={{ flex: 1 }} /></View>
                <View style={S.row}><KV k="Available Credit" v={money(Math.max(0, c.total - used))} style={{ flex: 1 }} /><KV k="Grade" v={c.grade} style={{ flex: 1 }} /></View>
              </View>);
            })}
          </Card>
          <Card><Text style={S.h2}>Frequently Ordered Items</Text>{frequent.length ? frequent.map((n) => <Text key={n} style={{ marginTop: 6 }}>{'•'} {n}</Text>) : <Text style={{ color: C.muted, marginTop: 6 }}>No frequently ordered items</Text>}</Card>
        </>)}

        {tab === 'Tasks' && (<>
          <Card style={{ backgroundColor: via === 'beat' ? '#fff' : C.greenLight }}><Text style={{ fontSize: 12, color: C.muted }}>{via === 'beat' ? 'Opened via Beat Plan - beat visit task board' : 'Opened directly from BP page - direct visit task board'}</Text></Card>
          {via === 'beat' && (
            <Card style={S.row}>
              <Text style={{ flex: 1, fontSize: 18, fontWeight: '700' }}>{visit ? dur(now - new Date(visit.checkIn)) : '00:00:00'}</Text>
              {visit ? <Btn small kind="outline" title="Check Out" onPress={() => checkOut(visit.id)} /> : <Btn small title="Check In" onPress={doCheckIn} />}
            </Card>)}
          {tasks.map((t, i) => {
            const isDone = visit && visit.tasksDone.includes(t.key);
            return (
              <Card key={t.key} onPress={() => openTask(t)} style={[S.row, { borderLeftWidth: 5, borderLeftColor: C.green }]}>
                <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: C.green, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: isDone ? C.green : '#fff' }}><Text style={{ color: isDone ? '#fff' : C.green, fontWeight: '700' }}>{isDone ? '✓' : i + 1}</Text></View>
                <View style={{ flex: 1 }}><Text style={S.h2}>{t.name}</Text><Text style={S.label}>{String(t.mins).padStart(2, '0')} mins</Text></View><Text style={{ fontSize: 20 }}>{'›'}</Text>
              </Card>);
          })}
        </>)}

        {tab === 'History' && (<>
          <View style={[S.row, { margin: 14, marginBottom: 0 }]}>{['Orders', 'Invoices'].map((h) => <Btn key={h} small kind={hist === h ? 'primary' : 'outline'} title={h} onPress={() => setHist(h)} style={{ flex: 1, marginRight: h === 'Orders' ? 8 : 0 }} />)}</View>
          {hist === 'Orders' ? (state.orders.filter((o) => o.dealerId === id).length ? state.orders.filter((o) => o.dealerId === id).map((o) => <OrderCard key={o.no} o={o} d={d} onPress={() => navigation.navigate('OrderDetail', { no: o.no })} />) : <Empty />) : (<>
            <Btn title="Initiate Return" style={{ margin: 14 }} onPress={() => navigation.navigate('Return', { id })} />
            {outstandingFor(id).length ? outstandingFor(id).map((i) => (
              <Card key={i.no}><View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{i.no}</Text><Text>{i.div}</Text></View><Text style={S.label}>{fmtDate(i.date)} - {i.days} days</Text><Text style={{ marginTop: 4 }}>Amount {money(i.amount)}   Due <Text style={{ color: i.due > 0 ? C.red : C.green }}>{money(i.due)}</Text></Text></Card>)) : <Empty />}
          </>)}
        </>)}
      </ScrollView>
      <Sheet visible={supSheet} title="Select Supplier" options={suppliers.map((s) => ({ label: s.name, value: s.id }))} value={state.cart?.dealerId === id ? state.cart.supplierId : null}
        onSelect={(sid) => { setSupSheet(false); startCart(id, sid); navigation.navigate('Catalog', { dealerId: id }); }} onClose={() => setSupSheet(false)} />
    </View>
  );
}

export function OrderCard({ o, d, onPress }) {
  return (
    <Card onPress={onPress}>
      <View style={S.row}><KV k="SO Number" v={o.no} style={{ flex: 1 }} /><KV k="Division" v={o.division} style={{ flex: 1 }} /></View>
      <Text style={{ fontSize: 13 }}>BP Name : <Text style={{ fontWeight: '700' }}>{d.name}, {d.city}</Text></Text>
      <Text style={{ fontSize: 13, marginTop: 4 }}>BP Code : <Text style={{ fontWeight: '700' }}>{d.id}</Text></Text>
      <Text style={{ fontSize: 13, marginTop: 4 }}>Total Amount: <Text style={{ fontWeight: '700' }}>{money(o.total)}</Text></Text>
      <View style={[S.row, { justifyContent: 'space-between', borderTopWidth: 1, borderColor: C.line, marginTop: 10, paddingTop: 10 }]}>
        <View><Text style={S.label}>Ordered Date</Text><Text>{fmtDateTime(o.orderedAt)}</Text></View><Badge text={o.status} color={statusColor(o.status)} />
      </View>
    </Card>
  );
}

// ---------- Payment (invoice ageing, pay, advance pay, history) ----------
export function PaymentScreen({ route, navigation }) {
  const { id } = route.params;
  const { state, dealer, outstandingFor, pay } = useApp();
  const d = dealer(id);
  const [tab, setTab] = useState('Invoices');
  const [age, setAge] = useState('All');
  const [payFor, setPayFor] = useState(null);
  const [amt, setAmt] = useState('');
  const [mode, setMode] = useState('NEFT');
  const [ref, setRef] = useState('');
  const inv = outstandingFor(id).filter((i) => i.due > 0).filter((i) => age === 'All' || (age === '0-30' ? i.days <= 30 : age === '31-60' ? i.days > 30 && i.days <= 60 : i.days > 60));
  const total = inv.reduce((a, i) => a + i.due, 0);
  const save = () => { const n = Number(amt); if (!n || n <= 0) { Alert.alert('Enter an amount.'); return; } pay(id, payFor === 'ADV' ? null : payFor, n, mode, ref); setPayFor(null); setAmt(''); setRef(''); Alert.alert('Payment saved', 'Payment recorded (Payment module is in testing).'); };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Payment" sub={d.name} onBack={() => navigation.goBack()} />
      <Seg items={['Invoices', 'History']} value={tab} onChange={setTab} style={{ margin: 14, marginBottom: 0 }} />
      {tab === 'Invoices' ? (<>
        <Chips items={['All', '0-30', '31-60', '60+']} value={age} onChange={setAge} />
        <View style={[S.row, { justifyContent: 'space-between', marginHorizontal: 14 }]}><Text style={S.h2}>Total: {money(total)}</Text><Btn small kind="outline" title="Advance Pay" onPress={() => setPayFor('ADV')} /></View>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {inv.length ? inv.map((i) => (
            <Card key={i.no}>
              <View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{i.no}</Text><Text style={{ color: i.days > 60 ? C.red : C.ink }}>{i.days} days</Text></View>
              <Text style={S.label}>{i.div} - {fmtDate(i.date)}</Text>
              <Text style={{ marginTop: 6 }}>Invoice {money(i.amount)}  Received {money(i.paidTotal)}</Text>
              <View style={[S.row, { justifyContent: 'space-between', marginTop: 8 }]}><Text style={{ fontWeight: '700', color: C.red }}>Due {money(i.due)}</Text><Btn small title="Pay" onPress={() => { setPayFor(i.no); setAmt(String(i.due)); }} /></View>
            </Card>)) : <Empty text="No invoices in this period" />}
        </ScrollView>
      </>) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {state.payments.filter((p) => p.dealerId === id).length ? state.payments.filter((p) => p.dealerId === id).map((p) => (
            <Card key={p.id}><Text style={S.h2}>{money(p.amount)} - {p.mode}</Text><Text style={S.label}>{p.invoice ? 'Against ' + p.invoice : 'Advance payment'} - {fmtDateTime(p.at)}</Text>{p.ref ? <Text style={S.label}>Ref: {p.ref}</Text> : null}</Card>)) : <Empty text="No payments in this period" />}
        </ScrollView>)}
      {payFor ? (
        <View style={{ backgroundColor: '#fff', padding: 14, borderTopWidth: 1, borderColor: C.line }}>
          <Text style={[S.h2, { marginBottom: 8 }]}>{payFor === 'ADV' ? 'Advance Pay' : 'Pay ' + payFor}</Text>
          <Field label="Amount" keyboardType="decimal-pad" value={amt} onChangeText={setAmt} />
          <Chips items={['NEFT', 'Cheque', 'Cash', 'UPI']} value={mode} onChange={setMode} />
          <Field label="Reference / Cheque No." value={ref} onChangeText={setRef} />
          <View style={S.row}><Btn kind="outline" title="Cancel" onPress={() => setPayFor(null)} style={{ flex: 1, marginRight: 8 }} /><Btn title="Save Payment" onPress={save} style={{ flex: 1 }} /></View>
        </View>) : null}
    </View>
  );
}

export function ReturnScreen({ route, navigation }) {
  const { id } = route.params;
  const { outstandingFor, initiateReturn, state } = useApp();
  const [inv, setInv] = useState(null); const [reason, setReason] = useState(''); const [ok, setOk] = useState(false);
  const list = outstandingFor(id);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Initiate Return" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Text style={S.h2}>Select invoice</Text>
        {list.length ? list.map((i) => <TouchableOpacity key={i.no} onPress={() => setInv(i.no)} style={[S.input, { marginTop: 8, borderColor: inv === i.no ? C.green : C.line }]}><Text>{i.no} - {money(i.amount)} - {fmtDate(i.date)}</Text></TouchableOpacity>) : <Empty />}
        <View style={{ height: 12 }} />
        <Field label="Reason for return" required multiline value={reason} onChangeText={setReason} />
        <Btn title="Submit Return" onPress={() => { if (!inv || !reason) { Alert.alert('Select an invoice and enter the reason.'); return; } initiateReturn(id, inv, reason); setOk(true); }} />
        {state.returns.filter((r) => r.dealerId === id).map((r) => <Card key={r.id} style={{ marginHorizontal: 0 }}><Text style={S.h2}>{r.invoice}</Text><Text style={S.label}>{r.status} - {fmtDateTime(r.at)}</Text><Text>{r.reason}</Text></Card>)}
      </ScrollView>
      <Done visible={ok} title="Return initiated" message="The return is processed in SAP and shows in SFA the next morning after 8 AM." onOk={() => { setOk(false); navigation.goBack(); }} />
    </View>
  );
}

// ---------- Planogram (photo) and Digital Signature ----------
export function PlanogramScreen({ route, navigation }) {
  const { submitSurvey } = useApp();
  const [photos, setPhotos] = useState([]);
  const take = async () => { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.4 }); if (!r.canceled) setPhotos([...photos, r.assets[0].uri]); };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Planogram" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Text style={{ color: C.muted, marginBottom: 10 }}>Take photos of the Ramraj display / shelf at the dealer.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{photos.map((u) => <Image key={u} source={{ uri: u }} style={{ width: 100, height: 130, borderRadius: 8, margin: 4 }} />)}</View>
        <Btn kind="outline" title="Click Image" onPress={take} style={{ marginVertical: 12 }} />
        <Btn title="Submit" disabled={!photos.length} onPress={() => { submitSurvey({ type: 'Planogram', dealerId: route.params.dealerId, photos }); navigation.goBack(); }} />
      </ScrollView>
    </View>
  );
}

export function SignatureScreen({ route, navigation }) {
  const { submitSurvey, dealer } = useApp();
  const d = dealer(route.params.dealerId);
  const [paths, setPaths] = useState([]);
  const cur = useRef('');
  const [, force] = useState(0);
  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true, onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { const { locationX: x, locationY: y } = e.nativeEvent; cur.current = `M${x.toFixed(1)},${y.toFixed(1)}`; force((n) => n + 1); },
    onPanResponderMove: (e) => { const { locationX: x, locationY: y } = e.nativeEvent; cur.current += ` L${x.toFixed(1)},${y.toFixed(1)}`; force((n) => n + 1); },
    onPanResponderRelease: () => { setPaths((p) => [...p, cur.current]); cur.current = ''; },
  })).current;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Digital Signature" onBack={() => navigation.goBack()} />
      <Text style={{ margin: 14, color: C.muted }}>Ask the dealer ({d.name}) to sign in the box.</Text>
      <View {...pr.panHandlers} style={{ height: 300, marginHorizontal: 14, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: C.line }}>
        <Svg width="100%" height="100%">{[...paths, cur.current].filter(Boolean).map((p, i) => <Path key={i} d={p} stroke={C.ink} strokeWidth={2.5} fill="none" />)}</Svg>
      </View>
      <View style={[S.row, { margin: 14 }]}><Btn kind="outline" title="Clear" onPress={() => setPaths([])} style={{ flex: 1, marginRight: 8 }} /><Btn title="Save" disabled={!paths.length} style={{ flex: 1 }} onPress={() => { submitSurvey({ type: 'Digital Signature', dealerId: d.id, signature: paths }); navigation.goBack(); }} /></View>
    </View>
  );
}
