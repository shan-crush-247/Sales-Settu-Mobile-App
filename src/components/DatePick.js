// Cross-platform date / time picker.
// Android: native dialog. iOS: bottom sheet with a spinner (mounted once via <DatePickHost />).
import React, { useEffect, useState } from 'react';
import { Platform, Modal, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { C } from '../theme';

let show = null;

export function openPicker({ value, mode = 'date', minimumDate, onSet }) {
  const v = value || new Date();
  if (Platform.OS === 'android') {
    DateTimePickerAndroid.open({ value: v, mode, minimumDate, onChange: (e, d) => { if (e.type === 'set' && d) onSet(d); } });
  } else if (show) {
    show({ value: v, mode, minimumDate, onSet });
  }
}

const p2 = (n) => String(n).padStart(2, '0');
const toInput = (d, mode) => mode === 'time' ? `${p2(d.getHours())}:${p2(d.getMinutes())}` : `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const fromInput = (s, mode, base) => {
  const d = new Date(base);
  if (mode === 'time') { const [h, m] = s.split(':').map(Number); d.setHours(h || 0, m || 0, 0, 0); return d; }
  const [y, mo, da] = s.split('-').map(Number); return new Date(y, (mo || 1) - 1, da || 1, d.getHours(), d.getMinutes());
};

export function DatePickHost() {
  const [req, setReq] = useState(null);
  const [temp, setTemp] = useState(new Date());
  useEffect(() => { show = (r) => { setTemp(r.value); setReq(r); }; return () => { show = null; }; }, []);
  if (!req) return null;
  if (Platform.OS === 'web') {
    // Browser: native <input type="date|time"> (iOS Safari shows its own wheel picker)
    return (
      <Modal transparent animationType="fade" visible onRequestClose={() => setReq(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontWeight: '800', fontSize: 17, marginBottom: 14 }}>{req.mode === 'time' ? 'Select Time' : 'Select Date'}</Text>
            {React.createElement('input', {
              type: req.mode === 'time' ? 'time' : 'date',
              defaultValue: toInput(temp, req.mode),
              min: req.minimumDate && req.mode !== 'time' ? toInput(req.minimumDate, 'date') : undefined,
              onChange: (e) => { if (e.target.value) setTemp(fromInput(e.target.value, req.mode, temp)); },
              style: { fontSize: 18, padding: 12, borderRadius: 12, border: '1.5px solid #E4E6F0', width: '100%', boxSizing: 'border-box' },
            })}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <TouchableOpacity onPress={() => setReq(null)} style={{ padding: 10, marginRight: 8 }}><Text style={{ color: C.muted, fontSize: 16 }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { req.onSet(temp); setReq(null); }} style={{ padding: 10 }}><Text style={{ color: C.green, fontSize: 16, fontWeight: '800' }}>Confirm</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  return (
    <Modal transparent animationType="slide" visible onRequestClose={() => setReq(null)}>
      <TouchableOpacity activeOpacity={1} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setReq(null)} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
          <TouchableOpacity onPress={() => setReq(null)}><Text style={{ color: C.muted, fontSize: 16 }}>Cancel</Text></TouchableOpacity>
          <Text style={{ fontWeight: '700', fontSize: 16 }}>{req.mode === 'time' ? 'Select Time' : 'Select Date'}</Text>
          <TouchableOpacity onPress={() => { req.onSet(temp); setReq(null); }}><Text style={{ color: C.green, fontSize: 16, fontWeight: '700' }}>Confirm</Text></TouchableOpacity>
        </View>
        <DateTimePicker value={temp} mode={req.mode} display="spinner" minimumDate={req.minimumDate} onChange={(e, d) => d && setTemp(d)} themeVariant="light" />
      </View>
    </Modal>
  );
}
