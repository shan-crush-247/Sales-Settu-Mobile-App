import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../store/AppStore';
import { C, S, G, money, dur, todayKey, fmtTime } from '../theme';
import { Btn, Field, Card, Seg, Header, Grad, IconTile } from '../components/UI';
import { DATA_STORES, DEMO_PASSWORD, TARGETS } from '../data/seed';

const Logo = ({ size = 110 }) => (
  <Grad colors={G.amber} style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }], ...S.shadow }}>
    <Text style={{ color: '#fff', fontSize: size * 0.42, fontWeight: '900', transform: [{ rotate: '8deg' }] }}>SS</Text>
  </Grad>
);

// ---------- Login ----------
export function LoginScreen() {
  const { state, login } = useApp();
  const [id, setId] = useState(state.user.employeeId);
  const [pw, setPw] = useState('');
  const insets = useSafeAreaInsets();
  const go = () => {
    if (id.trim().toUpperCase() !== state.user.employeeId || pw !== DEMO_PASSWORD) { Alert.alert('Login failed', 'Check your Employee ID and password.\n\nDemo: ' + state.user.employeeId + ' / ' + DEMO_PASSWORD); return; }
    login();
  };
  return (
    <Grad colors={G.brand} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 50 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Logo />
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 18, letterSpacing: 0.5 }}>SalesSetu</Text>
          <Text style={{ color: '#E9D5FF', marginTop: 4 }}>Your bridge from field to factory</Text>
        </View>
        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, ...S.shadow }}>
          <Text style={[S.h1, { marginBottom: 4 }]}>Welcome back {'👋'}</Text>
          <Text style={{ color: C.muted, marginBottom: 18 }}>Sign in to start your day</Text>
          <Field label="Username / Employee ID" value={id} onChangeText={setId} autoCapitalize="characters" />
          <Field label="Password" value={pw} onChangeText={setPw} secureTextEntry placeholder="Password" />
          <Btn title="Log In" onPress={go} style={{ marginTop: 6 }} />
        </View>
        <Text style={{ color: '#DDD6FE', fontSize: 12, textAlign: 'center', marginTop: 20 }}>Demo build - data is kept on this phone only.{'\n'}Demo password: {DEMO_PASSWORD}</Text>
      </ScrollView>
    </Grad>
  );
}

// ---------- Daily login sync (patch files + active data, once a day) ----------
export function DailySyncScreen() {
  const { markDailySync } = useApp();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= DATA_STORES.length) { const t = setTimeout(markDailySync, 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setI(i + 1), 110);
    return () => clearTimeout(t);
  }, [i]);
  return (
    <Grad colors={G.brand} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <Logo size={130} />
      <Text style={{ fontSize: 24, fontWeight: '900', marginTop: 28, color: '#fff' }}>{i < 2 ? 'Downloading updates ...' : 'Syncing your data ...'}</Text>
      <Text style={{ fontSize: 16, marginTop: 12, color: '#EDE9FE' }}>Starting {Math.min(i + 1, DATA_STORES.length)} of {DATA_STORES.length} data stores</Text>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 }}><Text style={{ color: '#fff', fontWeight: '700' }}>{DATA_STORES[Math.min(i, DATA_STORES.length - 1)]}</Text></View>
      <View style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'stretch', borderRadius: 5, marginTop: 28, overflow: 'hidden' }}>
        <Grad colors={G.amber} style={{ height: 10, width: `${(i / DATA_STORES.length) * 100}%` }} />
      </View>
      <Text style={{ fontSize: 12, color: '#DDD6FE', marginTop: 16, textAlign: 'center' }}>Daily first-login sync: patch files and active data (users, dealers, products, prices, stock, schemes, beats, tasks). Please keep the app open.</Text>
    </Grad>
  );
}

// Progress ring for the sales target
const Ring = ({ pct, size = 180, stroke = 16 }) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs><SvgGrad id="rg" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFC857" /><Stop offset="0.5" stopColor="#EC4899" /><Stop offset="1" stopColor="#7C3AED" /></SvgGrad></Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EEEBFF" strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="url(#rg)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - Math.max(0.02, pct / 100))} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={{ fontSize: 38, fontWeight: '900', color: C.ink }}>{pct}%</Text>
      <Text style={{ color: C.muted, fontWeight: '600' }}>Target Achieved</Text>
    </View>
  );
};

// ---------- Home ----------
export function HomeScreen({ navigation }) {
  const { state, dayEnd } = useApp();
  const [period, setPeriod] = useState('Monthly');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const insets = useSafeAreaInsets();
  const att = state.attendance[todayKey()];
  const started = att && att.start && !att.end;

  const todayBeat = state.beats.find((b) => b.weekday === 'today');
  const todayVisits = state.visits.filter((v) => (todayKey(new Date(v.checkIn)) === todayKey()));
  const visited = todayBeat ? todayBeat.dealers.filter((d) => todayVisits.some((v) => v.dealerId === d)).length : 0;
  const productive = todayVisits.filter((v) => state.orders.some((o) => o.dealerId === v.dealerId && (todayKey(new Date(o.orderedAt)) === todayKey()))).length;
  const now0 = new Date();
  const from = { Monthly: new Date(now0.getFullYear(), now0.getMonth(), 1), Quarterly: new Date(now0.getFullYear(), Math.floor(now0.getMonth() / 3) * 3, 1), 'Half Year': new Date(now0.getFullYear(), now0.getMonth() < 6 ? 0 : 6, 1), Annual: new Date(now0.getFullYear(), 0, 1) }[period];
  const achieved = state.orders.filter((o) => new Date(o.orderedAt) >= from).reduce((a, o) => a + o.total, 0);
  const target = TARGETS[period];
  const pct = Math.min(100, Math.round((achieved / target) * 100));
  const hour = now0.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const total = todayBeat ? todayBeat.dealers.length : 0;

  const end = () => Alert.alert('Day End', 'Close the day? Check-out time will be sent to HRMS.', [{ text: 'Cancel' }, { text: 'Day End', onPress: dayEnd }]);
  const tile = (n, label, colors, glyph, wide) => (
    <Grad colors={colors} style={{ flex: wide ? undefined : 1, margin: 5, borderRadius: 18, padding: 14, minHeight: 92, ...S.shadow }}>
      <View style={[S.row, { justifyContent: 'space-between' }]}><Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{n}</Text><Text style={{ fontSize: 22, color: 'rgba(255,255,255,0.85)' }}>{glyph}</Text></View>
      <Text style={{ color: '#fff', fontWeight: '700', marginTop: 6 }}>{label}</Text>
    </Grad>
  );
  const chip = (d, colors) => (
    <TouchableOpacity key={d.id} onPress={() => navigation.navigate('Dealer', { id: d.id, via: 'direct' })} style={{ marginRight: 10, marginTop: 8 }}>
      <View style={[S.row, { backgroundColor: '#F6F5FF', borderRadius: 16, padding: 10, paddingRight: 14 }]}>
        <IconTile glyph={d.name[0]} colors={colors} size={34} /><View style={{ marginLeft: 10 }}><Text style={{ fontWeight: '700', color: C.ink }}>{d.name}</Text><Text style={S.label}>{d.city}</Text></View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Grad colors={G.brand} style={{ paddingTop: insets.top + 12, paddingBottom: 26, paddingHorizontal: 16, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <View style={S.row}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Grad colors={G.amber} style={{ width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontWeight: '900', color: '#fff', fontSize: 17 }}>{state.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</Text></Grad>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: '#DDD6FE', fontWeight: '600' }}>{greet} {'☀️'}</Text><Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }} numberOfLines={1}>{state.user.name}</Text></View>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 20, padding: 14, marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#E9D5FF', fontSize: 12, fontWeight: '700' }}>{now0.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            {started ? <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 2 }}>{dur(now - new Date(att.start))}</Text>
              : att && att.end ? <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 4 }}>Day closed at {fmtTime(att.end)}</Text>
              : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 4 }}>Ready to start your day?</Text>}
          </View>
          {started ? <Btn small kind="danger" title="Day End" onPress={end} />
            : !(att && att.end) && state.user.attendanceRequired ? <Btn kind="yellow" title="Day Start" onPress={() => navigation.navigate('DayStart')} /> : null}
        </View>
      </Grad>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={{ marginHorizontal: 9, marginTop: 14 }}>
          <Text style={[S.h2, { marginHorizontal: 6, marginBottom: 4 }]}>Beat Highlights <Text style={{ color: C.green }}>{todayBeat ? '• ' + todayBeat.name : ''}</Text></Text>
          <View style={S.row}>{tile(total, 'Total Outlets', G.header, '▦')}{tile(visited, 'Visited Outlets', G.teal, '✔')}</View>
          <View style={S.row}>{tile(total - visited, 'Non Visited', G.coral, '⏳')}{tile(productive, 'Productive Calls', ['#34D399', '#059669'], '★')}</View>
          <View style={S.row}>{tile(Math.max(0, todayVisits.length - productive), 'Unproductive Calls', G.violet, '✕')}{tile(state.orders.filter((o) => todayKey(new Date(o.orderedAt)) === todayKey()).length, 'Orders Today', G.amber, '₹')}</View>
        </View>
        <Card>
          <Text style={[S.h2, { marginBottom: 12 }]}>Sales Target</Text>
          <Seg items={['Monthly', 'Quarterly', 'Half Year', 'Annual']} value={period} onChange={setPeriod} />
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Ring pct={pct} />
            <Text style={{ marginTop: 12, color: C.muted }}><Text style={{ color: C.ink, fontWeight: '800' }}>{money(achieved)}</Text> of {money(target)}</Text>
            <View style={{ backgroundColor: C.greenLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 6 }}><Text style={{ color: C.green, fontWeight: '700', fontSize: 12 }}>{state.user.targetGroup}</Text></View>
          </View>
        </Card>
        <Card>
          <View style={[S.row, { justifyContent: 'space-between' }]}><View style={S.row}><IconTile glyph={'🏆'} colors={G.amber} size={38} /><Text style={[S.h2, { marginLeft: 10 }]}>Leader Board</Text></View><Text style={{ fontWeight: '900', color: C.green, fontSize: 18 }}>#{achieved > 0 ? 3 : 12}<Text style={{ color: C.muted, fontSize: 13, fontWeight: '600' }}> / 18</Text></Text></View>
          <View style={{ height: 10, backgroundColor: '#EEEBFF', borderRadius: 5, marginTop: 14, overflow: 'hidden' }}><Grad colors={G.amber} style={{ height: 10, width: `${Math.max(3, pct)}%` }} /></View>
          <Text style={{ marginTop: 8, color: C.muted, fontSize: 12 }}>{money(achieved)} / {money(target)} (sample ranking)</Text>
        </Card>
        <Card>
          <Text style={S.h2}>{'⭐'} Premium Business Partners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>{state.dealers.filter((d) => d.premium).map((d) => chip(d, G.amber))}</ScrollView>
          <Text style={[S.h2, { marginTop: 16 }]}>{'💤'} Dormant Business Partners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>{state.dealers.filter((d) => d.dormant).map((d) => chip(d, G.coral))}</ScrollView>
        </Card>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Catalog', { browse: true })} style={{ marginHorizontal: 14, marginTop: 12 }}>
          <Grad colors={G.teal} style={{ borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', ...S.shadow }}>
            <Text style={{ fontSize: 32, marginRight: 14 }}>{'👕'}</Text>
            <View style={{ flex: 1 }}><Text style={{ color: '#fff', fontSize: 17, fontWeight: '900' }}>Product Catalogue</Text><Text style={{ color: '#E0F7F4' }}>Browse prices, colours and stock</Text></View>
            <Text style={{ color: '#fff', fontSize: 26 }}>{'›'}</Text>
          </Grad>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------- Day Start: photo + GPS (GPS optional) ----------
export function DayStartScreen({ navigation }) {
  const { dayStart } = useApp();
  const [photo, setPhoto] = useState(null);
  const [loc, setLoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [locNote, setLocNote] = useState('');

  const takePhoto = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { Alert.alert('Camera permission is needed for Day Start.'); return; }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.4, cameraType: ImagePicker.CameraType.front });
    if (!r.canceled && r.assets && r.assets[0]) setPhoto(r.assets[0].uri);
  };
  // Location is optional for Day Start: captured when available, never blocks the user.
  const getLoc = async (manual) => {
    setBusy(true); setLocNote('');
    try {
      const p = await Location.requestForegroundPermissionsAsync();
      if (p.status !== 'granted') { setLocNote('Location permission not given - Day Start will be saved without location.'); return; }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (e) { setLocNote('Location not available' + (manual ? ' (' + String(e.message || e) + ')' : '') + ' - you can still start the day.'); } finally { setBusy(false); }
  };
  useEffect(() => { getLoc(false); }, []);
  const confirm = () => {
    if (!photo) { Alert.alert('Take your photo first.'); return; }
    dayStart({ photo, lat: loc ? loc.lat : null, lng: loc ? loc.lng : null });
    navigation.goBack();
  };
  const step = (n, title, sub, colors) => (<View style={[S.row, { marginBottom: 12 }]}><IconTile glyph={n} colors={colors} size={34} /><View style={{ marginLeft: 10 }}><Text style={S.h2}>{title}</Text>{sub ? <Text style={S.label}>{sub}</Text> : null}</View></View>);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Header title="Day Start" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <Card>
          {step('1', 'Your photo', 'Required', G.header)}
          <TouchableOpacity onPress={takePhoto} style={{ height: 230, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: photo ? 'transparent' : C.greenMid, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#F6F5FF' }}>
            {photo ? <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} /> : <><Text style={{ fontSize: 44 }}>{'📸'}</Text><Text style={{ color: C.green, fontWeight: '800', marginTop: 6 }}>Tap to take selfie</Text></>}
          </TouchableOpacity>
        </Card>
        <Card>
          {step('2', 'GPS location', 'Optional', G.teal)}
          {busy ? <ActivityIndicator color={C.green} /> : loc ? (
            <View style={[S.row, { backgroundColor: '#E8FBF7', borderRadius: 14, padding: 12 }]}><Text style={{ fontSize: 22, marginRight: 10 }}>{'📍'}</Text><Text style={{ color: C.ink, fontWeight: '600' }}>Lat {loc.lat.toFixed(6)}{'\n'}Lng {loc.lng.toFixed(6)}</Text></View>
          ) : (<>
            {locNote ? <Text style={{ color: C.muted, marginBottom: 8 }}>{locNote}</Text> : null}
            <Btn small kind="outline" title="Get location" onPress={() => getLoc(true)} style={{ alignSelf: 'flex-start' }} />
          </>)}
        </Card>
        <Card style={{ backgroundColor: '#FFF7EB' }}><Text style={{ color: '#8A5300' }}>{'ℹ️'}  Day Start marks you Present. The working day is 8 hours from now. If you forget Day End, the system closes the day at 11:30 PM.</Text></Card>
        <Btn title="Confirm Day Start" kind="yellow" onPress={confirm} style={{ margin: 14 }} />
      </ScrollView>
    </View>
  );
}
