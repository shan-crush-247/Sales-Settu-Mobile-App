import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { openPicker } from '../components/DatePick';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../store/AppStore';
import { C, S, G, money, fmtDate, fmtDateTime, fmtTime, todayKey, pad2 } from '../theme';
import { Header, Btn, Card, KV, Field, Select, Sheet, Done, Empty, Badge, Chips, Seg, statusColor, IconTile } from '../components/UI';
import { EXPENSE_TYPES, SURVEYS, COMPLAINT_TYPES, TARGETS } from '../data/seed';

// ---------- More ----------
export function MoreScreen({ navigation }) {
  const sec = (title, items) => (
    <View style={{ marginTop: 16 }}>
      <Text style={{ marginHorizontal: 18, color: C.muted, fontWeight: '800', fontSize: 12, letterSpacing: 1 }}>{title.toUpperCase()}</Text>
      <Card style={{ paddingVertical: 6, marginTop: 8 }}>
        {items.map(([label, screen, params, glyph, colors, sub], i) => (
          <TouchableOpacity key={label} onPress={() => navigation.navigate(screen, params)} style={[S.row, { paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderColor: '#F1F0FA' }]}>
            <IconTile glyph={glyph} colors={colors} size={42} />
            <View style={{ flex: 1, marginLeft: 14 }}><Text style={{ fontSize: 15, fontWeight: '700', color: C.ink }}>{label}</Text><Text style={S.label}>{sub}</Text></View>
            <Text style={{ fontSize: 22, color: C.greenMid }}>{'›'}</Text>
          </TouchableOpacity>))}
      </Card>
    </View>);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="More" />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {sec('HRMS', [['Attendance', 'Attendance', undefined, '📅', G.teal, 'Calendar, regularization, leave']])}
        {sec('General', [['Expense Management', 'Expenses', undefined, '₹', G.amber, 'Claims and approvals'], ['Survey', 'Survey', {}, '✎', G.violet, 'Outlet and generic surveys']])}
        {sec('Reports', [['Outstanding Dues', 'Outstanding', undefined, '💰', G.coral, 'Area, dealer and invoice dues']])}
        {sec('Dashboards', [['Executive Dashboard', 'Dashboard', undefined, '📊', G.header, 'Target, orders and coverage']])}
        {sec('Account', [['Profile and Settings', 'Profile', undefined, '⚙', ['#64748B', '#334155'], 'Sync, storage and logout']])}
      </ScrollView>
    </View>
  );
}

// ---------- Attendance calendar, regularization, leave ----------
export function AttendanceScreen({ navigation }) {
  const { state } = useApp();
  const [month, setMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const y = month.getFullYear(), m = month.getMonth();
  const days = new Date(y, m + 1, 0).getDate(); const first = new Date(y, m, 1).getDay();
  const today = new Date();
  const mark = (dd) => {
    const k = `${y}-${pad2(m + 1)}-${pad2(dd)}`; const dt = new Date(y, m, dd);
    if (state.leaves.some((l) => l.status !== 'Rejected' && k >= l.from && k <= l.to)) return 'L';
    const a = state.attendance[k]; if (a && a.start) { const hrs = ((a.end ? new Date(a.end) : (k === todayKey() ? new Date() : new Date(a.start))) - new Date(a.start)) / 3600000; return a.end && hrs < 4 ? 'H' : 'P'; }
    if (dt < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && dt.getDay() !== 0) return 'A';
    return '';
  };
  const col = { P: C.green, A: C.red, L: C.orange, H: C.blue };
  const counts = { P: 0, A: 0, L: 0 }; for (let d = 1; d <= days; d++) { const k = mark(d); if (k === 'H') counts.P += 0.5; else if (counts[k] !== undefined) counts[k]++; }
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Attendance" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Card>
          <View style={[S.row, { justifyContent: 'space-between' }]}><TouchableOpacity onPress={() => setMonth(new Date(y, m - 1, 1))}><Text style={{ fontSize: 22 }}>{'‹'}</Text></TouchableOpacity><Text style={S.h2}>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</Text><TouchableOpacity onPress={() => setMonth(new Date(y, m + 1, 1))}><Text style={{ fontSize: 22 }}>{'›'}</Text></TouchableOpacity></View>
          <View style={[S.row, { marginTop: 10 }]}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <Text key={i} style={{ flex: 1, textAlign: 'center', color: C.muted }}>{d}</Text>)}</View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: first }).map((_, i) => <View key={'e' + i} style={{ width: '14.28%', height: 40 }} />)}
            {Array.from({ length: days }).map((_, i) => { const k = mark(i + 1); return (<View key={i} style={{ width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' }}><Text>{i + 1}</Text>{k ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col[k] }} /> : null}</View>); })}
          </View>
          <View style={[S.row, { justifyContent: 'space-around', marginTop: 8 }]}>{[['P', 'Present'], ['A', 'Absent'], ['L', 'Leave'], ['H', 'Half Day']].map(([k, l]) => <View key={k} style={S.row}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col[k], marginRight: 4 }} /><Text style={{ fontSize: 12 }}>{l}</Text></View>)}</View>
        </Card>
        <Card>
          <Text style={S.h2}>Attendance Regularization</Text>
          <View style={[S.row, { marginTop: 10 }]}><Btn small kind="outline" title="View All" onPress={() => navigation.navigate('Regularizations')} style={{ flex: 1, marginRight: 8 }} /><Btn small title="Regularize" onPress={() => navigation.navigate('Regularize')} style={{ flex: 1 }} /></View>
        </Card>
        <Card>
          <Text style={S.h2}>Overview</Text>
          <View style={[S.row, { marginTop: 10 }]}>{[['Present', counts.P, C.green], ['Absent', counts.A, C.red], ['Leave', counts.L, C.orange]].map(([l, n, c]) => <View key={l} style={{ flex: 1, alignItems: 'center', backgroundColor: c + '18', borderRadius: 10, padding: 10, marginHorizontal: 4 }}><Text style={{ fontSize: 20, fontWeight: '700', color: c }}>{n}</Text><Text>{l}</Text></View>)}</View>
        </Card>
        <Card>
          <View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>Leaves Info</Text><TouchableOpacity onPress={() => navigation.navigate('LeaveHistory')}><Text style={{ color: C.green }}>Leaves History</Text></TouchableOpacity></View>
          {state.leaveTypes.map((lt) => { const applied = state.leaves.filter((l) => l.type === lt.type).reduce((a, l) => a + l.days, 0); return (
            <View key={lt.type} style={[S.row, { borderTopWidth: 1, borderColor: '#F0F0F0', paddingVertical: 8 }]}><Text style={{ flex: 1.2, fontWeight: '600' }}>{lt.type}</Text><Text style={{ flex: 1, fontSize: 12 }}>Stock {lt.stock}</Text><Text style={{ flex: 1, fontSize: 12 }}>Used {lt.utilized}</Text><Text style={{ flex: 1, fontSize: 12 }}>Applied {applied}</Text><Text style={{ flex: 1, fontSize: 12, fontWeight: '700' }}>Bal {lt.stock - lt.utilized - applied}</Text></View>); })}
          <Btn title="Apply" onPress={() => navigation.navigate('ApplyLeave')} style={{ marginTop: 10 }} />
        </Card>
      </ScrollView>
    </View>
  );
}

const pickDate = (value, onSet) => openPicker({ value, mode: 'date', onSet });
const pickTime = (value, onSet) => openPicker({ value, mode: 'time', onSet });
const dk = (d) => d ? `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` : null;

export function RegularizeScreen({ navigation }) {
  const { regularize } = useApp();
  const [date, setDate] = useState(null); const [s, setS] = useState(null); const [e, setE] = useState(null); const [rem, setRem] = useState(''); const [ok, setOk] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Attendance Regularization" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Select label="Select Date" required value={date ? fmtDate(date) : null} placeholder="Select date" onPress={() => pickDate(date, setDate)} />
        <View style={S.row}><View style={{ flex: 1, marginRight: 8 }}><Select label="Day Start" required value={s ? fmtTime(s) : null} placeholder="Enter Time" onPress={() => pickTime(s, setS)} /></View><View style={{ flex: 1 }}><Select label="Day End" required value={e ? fmtTime(e) : null} placeholder="Enter Time" onPress={() => pickTime(e, setE)} /></View></View>
        <Field label="Enter Remarks" required multiline value={rem} onChangeText={setRem} placeholder="Write here..." />
        <Btn title="Submit" onPress={() => { if (!date || !s || !e || !rem) return Alert.alert('Fill date, times and remarks.'); regularize({ date: dk(date), start: fmtTime(s), end: fmtTime(e), remarks: rem }); setOk(true); }} />
      </ScrollView>
      <Done visible={ok} title="Submitted" message="Sent to your Reporting Head for approval." onOk={() => { setOk(false); navigation.goBack(); }} />
    </View>
  );
}

export function RegularizationsScreen({ navigation }) {
  const { state } = useApp(); const [f, setF] = useState('All');
  const list = state.regularizations.filter((r) => f === 'All' || r.status === f);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Regularization Requests" onBack={() => navigation.goBack()} />
      <Card style={S.row}><KV k="Name" v={state.user.name} style={{ flex: 1.4 }} /><KV k="Employee ID" v={state.user.employeeId} style={{ flex: 1 }} /><KV k="Approver" v={state.user.reportingHead} style={{ flex: 1.4 }} /></Card>
      <Text style={{ margin: 14, marginBottom: 0, fontWeight: '700' }}>Submitted Requests: {state.regularizations.length}</Text>
      <Chips items={['All', 'Approved', 'Submitted', 'Rejected']} value={f} onChange={setF} />
      <ScrollView>{list.length ? list.map((r) => <Card key={r.id}><View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{fmtDate(r.date)}</Text><Badge text={r.status} /></View><Text>{r.start} - {r.end}</Text><Text style={S.label}>{r.remarks}</Text></Card>) : <Empty />}</ScrollView>
    </View>
  );
}

export function ApplyLeaveScreen({ navigation }) {
  const { state, applyLeave } = useApp();
  const [type, setType] = useState(null); const [from, setFrom] = useState(null); const [to, setTo] = useState(null); const [reason, setReason] = useState(''); const [sheet, setSheet] = useState(false); const [ok, setOk] = useState(false);
  const days = from && to ? Math.max(1, Math.round((to - from) / 86400000) + 1) : 0;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Apply Leave" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Select label="Leave Type" required value={type} placeholder="Select leave type" onPress={() => setSheet(true)} />
        <View style={S.row}><View style={{ flex: 1, marginRight: 8 }}><Select label="From" required value={from ? fmtDate(from) : null} placeholder="From date" onPress={() => pickDate(from, setFrom)} /></View><View style={{ flex: 1 }}><Select label="To" required value={to ? fmtDate(to) : null} placeholder="To date" onPress={() => pickDate(to || from, setTo)} /></View></View>
        {days ? <Text style={{ marginBottom: 10 }}>Days: {days}</Text> : null}
        <Field label="Reason" required multiline value={reason} onChangeText={setReason} />
        <Btn title="Apply" onPress={() => { if (!type || !from || !to || !reason || to < from) return Alert.alert('Fill all fields (To date must be on or after From date).'); applyLeave({ type, from: dk(from), to: dk(to), days, reason }); setOk(true); }} />
      </ScrollView>
      <Sheet visible={sheet} title="Leave Type" options={state.leaveTypes.map((l) => l.type)} value={type} onSelect={(v) => { setType(v); setSheet(false); }} onClose={() => setSheet(false)} />
      <Done visible={ok} title="Leave applied" message="Sent to your Reporting Head for approval." onOk={() => { setOk(false); navigation.goBack(); }} />
    </View>
  );
}

export function LeaveHistoryScreen({ navigation }) {
  const { state } = useApp();
  return (<View style={{ flex: 1, backgroundColor: C.bg }}><Header title="Leaves History" onBack={() => navigation.goBack()} />
    <ScrollView>{state.leaves.length ? state.leaves.map((l) => <Card key={l.id}><View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{l.type} - {l.days} day(s)</Text><Badge text={l.status} /></View><Text>{fmtDate(l.from)} to {fmtDate(l.to)}</Text><Text style={S.label}>{l.reason}</Text></Card>) : <Empty />}</ScrollView></View>);
}

// ---------- Expense ----------
export function ExpensesScreen({ navigation }) {
  const { state } = useApp(); const [f, setF] = useState('All');
  const list = state.expenses.filter((e) => f === 'All' || e.status === f);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Expense Management" onBack={() => navigation.goBack()} />
      <Card style={S.row}><KV k="Name" v={state.user.name} style={{ flex: 1.4 }} /><KV k="Employee ID" v={state.user.employeeId} style={{ flex: 1 }} /><KV k="Approver" v={state.user.reportingHead} style={{ flex: 1.4 }} /></Card>
      <View style={[S.row, { justifyContent: 'space-between', marginHorizontal: 14, marginTop: 12 }]}><Text style={{ fontWeight: '700' }}>Submitted Requests: {state.expenses.filter((e) => e.status !== 'Draft').length}</Text><TouchableOpacity onPress={() => navigation.navigate('AddExpense')}><Text style={{ color: C.green, fontWeight: '700' }}>+ Add Expense</Text></TouchableOpacity></View>
      <Chips items={['All', 'Approved', 'Submitted', 'Draft', 'Rejected']} value={f} onChange={setF} />
      <ScrollView>{list.length ? list.map((e) => <Card key={e.id}><View style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{e.type}</Text><Badge text={e.status} color={e.status === 'Draft' ? C.muted : C.orange} /></View><Text>{money(e.amount)} - {fmtDate(e.date)}</Text>{e.remarks ? <Text style={S.label}>{e.remarks}</Text> : null}{e.bill ? <Image source={{ uri: e.bill }} style={{ width: 70, height: 90, borderRadius: 6, marginTop: 6 }} /> : null}</Card>) : <Empty />}</ScrollView>
    </View>
  );
}

export function AddExpenseScreen({ navigation }) {
  const { state, addExpense } = useApp();
  const [type, setType] = useState(null); const [amount, setAmount] = useState(''); const [date, setDate] = useState(new Date()); const [remarks, setRemarks] = useState(''); const [bill, setBill] = useState(null); const [sheet, setSheet] = useState(false);
  const save = (status) => { if (!type || !Number(amount)) return Alert.alert('Select the Expense Type and enter the amount.'); addExpense({ type, amount: Number(amount), date: dk(date), remarks, bill, status }); navigation.goBack(); };
  const photo = async () => { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.4 }); if (!r.canceled) setBill(r.assets[0].uri); };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="New Expense" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Field label="Employee ID" value={state.user.employeeId} editable={false} />
        <Select label="Expense Type" required value={type} placeholder="Select Expense Type" onPress={() => setSheet(true)} />
        <Field label="Amount" required keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
        <Select label="Date" value={fmtDate(date)} onPress={() => pickDate(date, setDate)} />
        <Field label="Remarks" multiline value={remarks} onChangeText={setRemarks} />
        {bill ? <Image source={{ uri: bill }} style={{ width: 120, height: 150, borderRadius: 8, marginBottom: 10 }} /> : null}
        <Btn kind="outline" title={bill ? 'Retake bill photo' : 'Add bill photo'} onPress={photo} style={{ marginBottom: 12 }} />
        <View style={S.row}><Btn kind="outline" title="Save Draft" onPress={() => save('Draft')} style={{ flex: 1, marginRight: 8 }} /><Btn title="Confirm" onPress={() => save('Submitted')} style={{ flex: 1 }} /></View>
      </ScrollView>
      <Sheet visible={sheet} title="Expense Type" options={EXPENSE_TYPES} value={type} onSelect={(v) => { setType(v); setSheet(false); }} onClose={() => setSheet(false)} />
    </View>
  );
}

// ---------- Survey ----------
export function SurveyScreen({ route, navigation }) {
  const { state } = useApp();
  const dealerId = route.params?.dealerId;
  const [tab, setTab] = useState('Outlet Specific Survey');
  const list = tab === 'Outlet Specific Survey' ? SURVEYS.outlet : SURVEYS.generic;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Survey" onBack={() => navigation.goBack()} />
      <Seg items={['Outlet Specific Survey', 'Generic Survey']} value={tab} onChange={setTab} style={{ margin: 14, marginBottom: 0 }} />
      <ScrollView>
        {list.map((s, i) => <Card key={s.id} onPress={() => navigation.navigate('SurveyForm', { surveyId: s.id, dealerId })} style={S.row}><Text style={{ fontWeight: '700', marginRight: 10 }}>{i + 1}</Text><Text style={[S.h2, { flex: 1 }]}>{s.name}</Text><Text>{'›'}</Text></Card>)}
        <Text style={[S.h2, { margin: 14, marginBottom: 0 }]}>Submitted</Text>
        {state.surveyResponses.filter((r) => r.survey).slice(0, 10).map((r) => <Card key={r.id}><Text style={S.h2}>{r.survey}</Text><Text style={S.label}>{fmtDateTime(r.at)}{r.dealerId ? ' - ' + r.dealerId : ''}</Text></Card>)}
      </ScrollView>
    </View>
  );
}

export function SurveyFormScreen({ route, navigation }) {
  const { state, submitSurvey, dealer } = useApp();
  const s = [...SURVEYS.outlet, ...SURVEYS.generic].find((x) => x.id === route.params.surveyId);
  const d = route.params.dealerId ? dealer(route.params.dealerId) : null;
  const [a, setA] = useState(s.complaint ? { code: d?.id || '', bpType: 'Dealer', name: d?.name || '', invoice: '', type: null, comments: '' } : {});
  const [photo, setPhoto] = useState(null); const [ok, setOk] = useState(false);
  const take = async () => { const p = await ImagePicker.requestCameraPermissionsAsync(); if (!p.granted) return; const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.4 }); if (!r.canceled) setPhoto(r.assets[0].uri); };
  const radio = (on) => <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.green, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>{on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.green }} /> : null}</View>;
  const submit = () => {
    if (s.complaint && (!a.code || !a.name || !a.invoice || !a.type)) return Alert.alert('Fill customer code, name, invoice number and complaint type.');
    submitSurvey({ survey: s.name, dealerId: d?.id, answers: a, photo }); setOk(true);
  };
  const q = (n, title, child) => <Card key={n}><Text style={S.label}>{n} Question</Text><Text style={[S.h2, { marginBottom: 8 }]}>{title}</Text>{child}</Card>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title={s.name} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {s.complaint ? (<>
          {q(1, 'Customer Code', <TextInput style={S.input} value={a.code} onChangeText={(v) => setA({ ...a, code: v })} placeholder="Write here..." />)}
          {q(2, 'BP Type', ['Dealer', 'Distributor'].map((t) => <TouchableOpacity key={t} onPress={() => setA({ ...a, bpType: t })} style={[S.row, { paddingVertical: 6 }]}>{radio(a.bpType === t)}<Text>{t}</Text></TouchableOpacity>))}
          {q(3, 'Dealer / Distributor Name', <TextInput style={S.input} value={a.name} onChangeText={(v) => setA({ ...a, name: v })} placeholder="Write here..." />)}
          {q(4, 'Invoice Number', <TextInput style={S.input} value={a.invoice} onChangeText={(v) => setA({ ...a, invoice: v })} placeholder="Write here..." />)}
          {q(5, 'Type of Complaint', COMPLAINT_TYPES.map((t) => <TouchableOpacity key={t} onPress={() => setA({ ...a, type: t })} style={[S.row, { paddingVertical: 6 }]}>{radio(a.type === t)}<Text>{t}</Text></TouchableOpacity>))}
          {q(6, 'Image', <>{photo ? <Image source={{ uri: photo }} style={{ width: 120, height: 150, borderRadius: 8, marginBottom: 8 }} /> : null}<Btn small title="Click Image" onPress={take} /></>)}
          {q(7, 'Additional Comments', <TextInput style={[S.input, { minHeight: 70 }]} multiline value={a.comments} onChangeText={(v) => setA({ ...a, comments: v })} placeholder="Write here..." />)}
        </>) : s.questions.map((t, i) => q(i + 1, t, <TextInput style={S.input} value={a[t] || ''} onChangeText={(v) => setA({ ...a, [t]: v })} placeholder="Write here..." />))}
        <Btn title="Submit" onPress={submit} style={{ margin: 14 }} />
      </ScrollView>
      <Done visible={ok} title="Submitted" message="Your survey has been saved." onOk={() => { setOk(false); navigation.goBack(); }} />
    </View>
  );
}

// ---------- Outstanding Dues (Area > BP > Invoice) ----------
export function OutstandingScreen({ navigation }) {
  const { state, outstandingFor } = useApp();
  const [open, setOpen] = useState({}); const [q, setQ] = useState('');
  const rows = state.dealers.filter((d) => (d.name + d.id).toLowerCase().includes(q.toLowerCase())).map((d) => ({ d, inv: outstandingFor(d.id).filter((i) => Math.abs(i.due) > 0) })).filter((r) => r.inv.length);
  const areas = [...new Set(rows.map((r) => r.d.area))];
  const totInv = rows.reduce((a, r) => a + r.inv.reduce((x, i) => x + i.amount, 0), 0);
  const totDue = rows.reduce((a, r) => a + r.inv.reduce((x, i) => x + i.due, 0), 0);
  const tg = (k) => setOpen({ ...open, [k]: !open[k] });
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Customer Outstanding Details" onBack={() => navigation.goBack()} />
      <Card><Text>Selected: <Text style={{ fontWeight: '700' }}>{rows.length} BPs</Text></Text><Text>Total invoice value: <Text style={{ fontWeight: '700' }}>{money(totInv)}</Text></Text><Text>Total amount to be paid: <Text style={{ fontWeight: '700', color: C.red }}>{money(totDue)}</Text></Text></Card>
      <View style={[S.row, { marginHorizontal: 14, marginTop: 10 }]}><TouchableOpacity onPress={() => setOpen({})}><Text style={{ color: C.green, marginRight: 14 }}>Collapse</Text></TouchableOpacity><TextInput placeholder="Search dealer" value={q} onChangeText={setQ} style={[S.input, { flex: 1, paddingVertical: 6 }]} /></View>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {areas.map((ar) => { const rs = rows.filter((r) => r.d.area === ar); const due = rs.reduce((a, r) => a + r.inv.reduce((x, i) => x + i.due, 0), 0); return (
          <Card key={ar}>
            <TouchableOpacity onPress={() => tg(ar)} style={[S.row, { justifyContent: 'space-between' }]}><Text style={S.h2}>{ar}</Text><Text style={{ fontWeight: '700' }}>{money(due)} {open[ar] ? '⌃' : '⌄'}</Text></TouchableOpacity>
            {open[ar] ? rs.map((r) => (
              <View key={r.d.id} style={{ backgroundColor: C.greenLight, borderRadius: 10, padding: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={() => tg(r.d.id)} style={[S.row, { justifyContent: 'space-between' }]}><Text style={{ fontWeight: '700', flex: 1 }}>{r.d.name}, {r.d.city}</Text><Text>{money(r.inv.reduce((x, i) => x + i.due, 0))}</Text></TouchableOpacity>
                <Text style={S.label}>Invoices: {r.inv.length}</Text>
                {open[r.d.id] ? r.inv.map((i) => (<View key={i.no} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 8, marginTop: 6 }}><Text style={{ fontWeight: '700' }}>{i.no}  {i.div}</Text><Text style={{ fontSize: 12 }}>{fmtDate(i.date)}  {money(i.amount)}  {i.days} Days</Text><Text style={{ fontSize: 12 }}>Incoming payment {money(i.paidTotal)}  To be paid <Text style={{ color: i.due < 0 ? C.green : C.red }}>{money(i.due)}</Text></Text></View>)) : null}
              </View>)) : null}
          </Card>); })}
        {!areas.length ? <Empty /> : null}
      </ScrollView>
    </View>
  );
}

// ---------- Executive dashboard (computed from data on the phone) ----------
export function DashboardScreen({ navigation }) {
  const { state, outstandingFor } = useApp();
  const now = new Date(); const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const orders = state.orders.filter((o) => new Date(o.orderedAt) >= from);
  const sales = orders.reduce((a, o) => a + o.total, 0);
  const target = TARGETS.Monthly; const daysIn = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(); const daysLeft = daysIn - now.getDate() + 1;
  const expected = Math.round((now.getDate() / daysIn) * 100);
  const by = (s) => orders.filter((o) => o.status === s).length;
  const inv = state.dealers.flatMap((d) => outstandingFor(d.id));
  const due = inv.reduce((a, i) => a + Math.max(0, i.due), 0);
  const bucket = (lo, hi) => inv.filter((i) => i.due > 0 && i.days >= lo && i.days < hi).reduce((a, i) => a + i.due, 0);
  const billed = new Set(state.orders.map((o) => o.dealerId)).size;
  const tile = (t, v, sub) => <Card style={{ flex: 1, marginHorizontal: 6 }}><Text style={S.label}>{t}</Text><Text style={{ fontSize: 18, fontWeight: '800' }}>{v}</Text>{sub ? <Text style={{ fontSize: 11, color: C.muted }}>{sub}</Text> : null}</Card>;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Executive Dashboard" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 8 }}>
        <Card><Text style={S.h2}>{state.user.name}</Text><Text style={S.label}>{state.user.designation} - {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</Text></Card>
        <Card>
          <Text style={S.h2}>Target vs Sales</Text>
          <Text style={{ marginTop: 6 }}>Achieved <Text style={{ fontWeight: '800' }}>{money(sales)}</Text> / {money(target)}</Text>
          <View style={{ height: 8, backgroundColor: '#EEE', borderRadius: 4, marginVertical: 8 }}><View style={{ height: 8, borderRadius: 4, width: `${Math.min(100, (sales / target) * 100)}%`, backgroundColor: C.green }} /></View>
          <Text style={{ color: (sales / target) * 100 < expected ? C.red : C.green }}>Expected by today {expected}%  {(sales / target) * 100 < expected ? '⚠ AT RISK' : 'On track'}</Text>
          <Text style={S.label}>Required / day: {money(Math.max(0, target - sales) / daysLeft)}  - Days left {daysLeft}</Text>
        </Card>
        <View style={S.row}>{tile('Orders (month)', orders.length, money(sales))}{tile('Draft / Placed', by('Draft') + ' / ' + by('Order Placed'))}</View>
        <View style={S.row}>{tile('Confirmed / Approved', by('Order Confirmed') + ' / ' + by('Approved'))}{tile('Invoiced / Dispatched', by('Invoiced') + ' / ' + by('Dispatched'))}</View>
        <Card>
          <Text style={S.h2}>Outstanding</Text><Text style={{ fontSize: 20, fontWeight: '800', marginTop: 4 }}>{money(due)}</Text>
          <View style={[S.row, { marginTop: 8 }]}>{[['< 30', bucket(0, 30)], ['30-60', bucket(30, 60)], ['60-90', bucket(60, 90)], ['> 90', bucket(90, 9999)]].map(([k, v]) => <View key={k} style={{ flex: 1 }}><Text style={S.label}>{k}</Text><Text style={{ fontSize: 12, fontWeight: '700' }}>{money(v)}</Text></View>)}</View>
        </Card>
        <View style={S.row}>{tile('BPs mapped', state.dealers.length)}{tile('BPs billed', billed, Math.round((billed / state.dealers.length) * 100) + '% coverage')}</View>
        <View style={S.row}>{tile('Sales returns', state.returns.length)}{tile('Payments recorded', state.payments.length)}</View>
        <Text style={{ textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 10 }}>Computed from data on this phone. Tableau dashboards need the live BI connection.</Text>
      </ScrollView>
    </View>
  );
}

// ---------- Profile and Sync settings ----------
export function ProfileScreen({ navigation }) {
  const { state, syncNow, logout, resetData } = useApp();
  const [tab, setTab] = useState('My Profile');
  const [busy, setBusy] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const size = Math.round(JSON.stringify(state).length / 1024);
  const pending = state.orders.filter((o) => !o.synced || o.status === 'Draft').length;
  const doSync = async () => { setBusy(true); const ok = await syncNow(); setBusy(false); Alert.alert(ok ? 'Sync complete' : 'Sync failed', ok ? 'Data sent and latest status received (simulated OOP / SAP).' : 'No network. Your entries stay on the phone.'); };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Profile" onBack={() => navigation.goBack()} />
      <Seg items={['My Profile', 'Settings']} value={tab} onChange={setTab} style={{ margin: 14, marginBottom: 0 }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {tab === 'My Profile' ? (
          <Card style={{ alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{state.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</Text></View>
            <Text style={[S.h1, { marginTop: 10 }]}>{state.user.name}</Text>
            <View style={{ alignSelf: 'stretch', marginTop: 14 }}>
              <KV k="Employee Id" v={state.user.employeeId} /><KV k="Role" v={state.user.role} /><KV k="Phone Number" v={state.user.phone} /><KV k="Reporting To" v={state.user.reportingHead} /><KV k="Target Group" v={state.user.targetGroup} />
            </View>
            <Btn title="Logout" kind="danger" onPress={() => Alert.alert('Logout', 'Log out of the app?', [{ text: 'Cancel' }, { text: 'Logout', onPress: logout }])} style={{ alignSelf: 'stretch' }} />
          </Card>
        ) : (
          <Card>
            <View style={[S.row, { justifyContent: 'space-between', paddingVertical: 10 }]}><Text>Sync Data</Text><Btn small title={busy ? 'Syncing...' : 'Sync Now'} disabled={busy} onPress={doSync} /></View>
            <View style={[S.row, { justifyContent: 'space-between', paddingVertical: 10 }]}><Text>Last Sync</Text><Text>{state.lastSync ? fmtDateTime(state.lastSync) : '--'}</Text></View>
            <View style={[S.row, { justifyContent: 'space-between', paddingVertical: 10 }]}><Text>Pending to send</Text><Text>{pending} order(s)</Text></View>
            <View style={[S.row, { justifyContent: 'space-between', paddingVertical: 10 }]}><Text>Total Offline Storage</Text><Text>{size} KB</Text></View>
            <View style={[S.row, { justifyContent: 'space-between', paddingVertical: 10 }]}><Text>Version</Text><Text>1.0.0 (demo)</Text></View>
            <View style={[S.row, { justifyContent: 'space-between', paddingVertical: 10 }]}><Text>Sync Errors ({state.syncErrors.length})</Text><TouchableOpacity onPress={() => setShowErr(!showErr)}><Text style={{ color: C.green }}>Show</Text></TouchableOpacity></View>
            {showErr ? (state.syncErrors.length ? state.syncErrors.map((e, i) => <Text key={i} style={{ fontSize: 12, color: C.red, marginBottom: 4 }}>{fmtDateTime(e.at)} - {e.msg}</Text>) : <Text style={S.label}>No sync errors</Text>) : null}
            <Btn kind="outline" small title="Reset demo data" style={{ marginTop: 16 }} onPress={() => Alert.alert('Reset demo data', 'Delete all orders, visits and entries on this phone and reload the sample data?', [{ text: 'Cancel' }, { text: 'Reset', style: 'destructive', onPress: resetData }])} />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
