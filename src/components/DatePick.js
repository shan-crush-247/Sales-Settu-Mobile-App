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

export function DatePickHost() {
  const [req, setReq] = useState(null);
  const [temp, setTemp] = useState(new Date());
  useEffect(() => { show = (r) => { setTemp(r.value); setReq(r); }; return () => { show = null; }; }, []);
  if (!req) return null;
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
