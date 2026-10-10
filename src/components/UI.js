import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { C, S, G } from '../theme';

export const Grad = ({ colors = G.header, style, children, horizontal = true }) => (
  <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={horizontal ? { x: 1, y: 1 } : { x: 0, y: 1 }} style={style}>{children}</LinearGradient>
);

export function Header({ title, onBack, right, sub }) {
  const insets = useSafeAreaInsets();
  return (
    <Grad colors={G.header} style={[st.header, { paddingTop: insets.top + 10 }]}>
      {onBack ? <TouchableOpacity onPress={onBack} style={st.back} hitSlop={12}><Text style={st.hIcon}>{'‹'}</Text></TouchableOpacity> : <View style={st.hBtn} />}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={st.hTitle} numberOfLines={2}>{title}</Text>
        {sub ? <Text style={st.hSub}>{sub}</Text> : null}
      </View>
      <View style={[st.hBtn, { width: undefined, minWidth: 40, flexDirection: 'row', justifyContent: 'flex-end' }]}>{right}</View>
    </Grad>
  );
}

export const HeaderIcon = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress} hitSlop={10} style={{ marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, minWidth: 34, height: 34, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{label}</Text>
  </TouchableOpacity>
);

export function Btn({ title, onPress, kind = 'primary', style, disabled, small }) {
  const pad = { paddingVertical: small ? 9 : 14, paddingHorizontal: small ? 14 : 20, borderRadius: small ? 12 : 14, alignItems: 'center', justifyContent: 'center' };
  const txt = { fontWeight: '800', fontSize: small ? 13 : 15, letterSpacing: 0.2 };
  const grads = { primary: G.header, yellow: G.amber, teal: G.teal };
  if (grads[kind]) {
    return (
      <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.85} style={[{ opacity: disabled ? 0.45 : 1, borderRadius: pad.borderRadius }, S.shadow, style]}>
        <Grad colors={grads[kind]} style={pad}><Text style={[txt, { color: kind === 'yellow' ? '#3A2300' : '#fff' }]}>{title}</Text></Grad>
      </TouchableOpacity>
    );
  }
  const k = { outline: ['#fff', C.green, C.green], danger: ['#FFF1F4', C.red, '#FBC6D0'], ghost: ['transparent', C.green, 'transparent'] }[kind] || ['#fff', C.green, C.green];
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.8} style={[pad, { backgroundColor: k[0], borderColor: k[2], borderWidth: 1.5, opacity: disabled ? 0.45 : 1 }, style]}>
      <Text style={[txt, { color: k[1] }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Seg({ items, value, onChange, style }) {
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: '#E9E8F8', borderRadius: 14, padding: 4 }, style]}>
      {items.map((it) => (
        <TouchableOpacity key={it} onPress={() => onChange(it)} style={[{ flex: 1, borderRadius: 11, overflow: 'hidden' }, value === it && S.shadow]}>
          {value === it
            ? <Grad colors={G.header} style={{ paddingVertical: 9, alignItems: 'center' }}><Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }} numberOfLines={1}>{it}</Text></Grad>
            : <View style={{ paddingVertical: 9, alignItems: 'center' }}><Text style={{ fontSize: 13, fontWeight: '600', color: C.muted }} numberOfLines={1}>{it}</Text></View>}
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Chips({ items, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}>
      {items.map((it) => (
        <TouchableOpacity key={it} onPress={() => onChange(it)} style={{ borderRadius: 20, marginRight: 8, overflow: 'hidden', borderWidth: value === it ? 0 : 1, borderColor: C.line }}>
          {value === it
            ? <Grad colors={G.header} style={{ paddingHorizontal: 16, paddingVertical: 8 }}><Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{it}</Text></Grad>
            : <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' }}><Text style={{ color: C.ink, fontSize: 13 }}>{it}</Text></View>}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Coloured round icon tile (used in menus and stats)
export const IconTile = ({ glyph, colors = G.header, size = 40 }) => (
  <Grad colors={colors} style={{ width: size, height: size, borderRadius: size / 2.6, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#fff', fontSize: size * 0.45, fontWeight: '800' }}>{glyph}</Text>
  </Grad>
);

export const Card = ({ children, style, onPress }) => onPress
  ? <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[S.card, style]}>{children}</TouchableOpacity>
  : <View style={[S.card, style]}>{children}</View>;

export const KV = ({ k, v, style }) => (<View style={[{ marginBottom: 8 }, style]}><Text style={S.label}>{k}</Text><Text style={S.value}>{v ?? '--'}</Text></View>);

export const Field = ({ label, required, ...p }) => (
  <View style={{ marginBottom: 12 }}>
    {label ? <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 6 }}>{label}{required ? <Text style={{ color: C.red }}> *</Text> : null}</Text> : null}
    <TextInput placeholderTextColor="#9AA3AB" style={[S.input, p.editable === false && { backgroundColor: '#F1F2F4', color: C.muted }, p.multiline && { minHeight: 80, textAlignVertical: 'top' }]} {...p} />
  </View>
);

export const Select = ({ label, required, value, placeholder, onPress }) => (
  <View style={{ marginBottom: 12 }}>
    {label ? <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 6 }}>{label}{required ? <Text style={{ color: C.red }}> *</Text> : null}</Text> : null}
    <TouchableOpacity onPress={onPress} style={[S.input, { flexDirection: 'row', justifyContent: 'space-between' }]}>
      <Text style={{ color: value ? C.ink : '#9AA3AB', fontSize: 14 }}>{value || placeholder}</Text><Text style={{ color: C.muted }}>{'⌄'}</Text>
    </TouchableOpacity>
  </View>
);

export function Sheet({ visible, title, options, value, onSelect, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 34 }}>
        <View style={[S.row, { justifyContent: 'space-between', marginBottom: 12 }]}><Text style={S.h1}>{title}</Text><TouchableOpacity onPress={onClose} hitSlop={12}><Text style={{ fontSize: 20 }}>{'✕'}</Text></TouchableOpacity></View>
        <ScrollView style={{ maxHeight: 360 }}>
          {options.map((o) => { const label = typeof o === 'string' ? o : o.label; const val = typeof o === 'string' ? o : o.value; return (
            <TouchableOpacity key={val} onPress={() => onSelect(val)} style={[S.row, { paddingVertical: 11 }]}>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.green, marginRight: 14, alignItems: 'center', justifyContent: 'center' }}>{value === val ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.green }} /> : null}</View>
              <Text style={{ fontSize: 15, color: value === val ? C.green : C.ink, fontWeight: value === val ? '700' : '400' }}>{label}</Text>
            </TouchableOpacity>); })}
        </ScrollView>
      </View>
    </Modal>
  );
}

export function Done({ visible, title, message, onOk }) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onOk}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center', paddingBottom: 36 }}>
          <Grad colors={G.teal} style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginVertical: 18 }}><Text style={{ color: '#fff', fontSize: 46, fontWeight: '800' }}>{'✓'}</Text></Grad>
          <Text style={[S.h1, { marginBottom: 8 }]}>{title}</Text>
          <Text style={{ textAlign: 'center', color: C.ink, fontSize: 15, marginBottom: 22 }}>{message}</Text>
          <Btn title="Ok" onPress={onOk} style={{ alignSelf: 'stretch' }} />
        </View>
      </View>
    </Modal>
  );
}

export const Empty = ({ text = 'No Data Available' }) => <Text style={{ textAlign: 'center', color: C.muted, marginTop: 50, fontSize: 15 }}>{text}</Text>;

export const Badge = ({ text, color = C.orange }) => (
  <View style={{ backgroundColor: color + '1F', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: color + '55' }}><Text style={{ color, fontWeight: '800', fontSize: 12 }}>{text}</Text></View>
);

export const Section = ({ title, children, right }) => (
  <Card><View style={[S.row, { justifyContent: 'space-between', marginBottom: 10 }]}><Text style={S.h2}>{title}</Text>{right}</View>{children}</Card>
);

export const statusColor = (s) => ({ Draft: C.orange, 'Order Placed': C.pink, 'Order Confirmed': C.blue, Approved: '#7C3AED', Invoiced: C.teal, Dispatched: '#16A34A', Cancelled: C.red, Submitted: C.orange, Approved_: '#16A34A' })[s] || C.muted;

const st = StyleSheet.create({
  header: { paddingHorizontal: 14, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  hBtn: { width: 40 },
  back: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  hIcon: { color: '#fff', fontSize: 30, lineHeight: 32, fontWeight: '400', marginTop: -2 },
  hTitle: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  hSub: { color: '#DDD6FE', fontSize: 12, marginTop: 2 },
});
