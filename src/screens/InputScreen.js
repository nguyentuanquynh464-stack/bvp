import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useApp, useTheme } from '../context/AppContext';
import FieldInput from '../components/FieldInput';
import CalPick from '../components/CalPick';

const mdDefs = [
  { id: 1, icon: '📈' },
  { id: 2, icon: '⚙️' },
  { id: 3, icon: '🌍' },
  { id: 4, icon: '💼' },
];
const bCols = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function InputScreen({ route, navigation }) {
  const { modelId } = route.params;
  const { T } = useApp();
  const th = useTheme();

  // Model 1 — Stock BVP (giá ya/yb tự động fetch từ server theo ngày)
  const [d1s, sd1s] = useState({ y: 2008, m: 10, d: 2 });
  const [d1e, sd1e] = useState({ y: 2008, m: 10, d: 14 });

  // Model 2 — Piston
  const [v2m, s2m] = useState('147.8');
  const [v2k, s2k] = useState('1460');
  const [v2a, s2a] = useState('0.045');

  // Model 3 — Earth Core Heat
  const [v3a, s3a] = useState('1220');
  const [v3b, s3b] = useState('5700');
  const [v3c, s3c] = useState('3480');
  const [v3d, s3d] = useState('4000');

  // Model 4 — Investment
  const [v4a, s4a] = useState('12.032915');
  const [v4b, s4b] = useState('13.643233');
  const [v4t, s4t] = useState('1');

  // Grid N
  const [vN, sN] = useState('30');

  const [solving, setSolving] = useState(false);
  const md = mdDefs.find(m => m.id === modelId);
  const names = [T.m1, T.m2, T.m3, T.m4];

  const doSolve = async () => {
    const N = parseInt(vN) || 30;
    let payload;
    let startDate, endDate;

    if (modelId === 1) {
      const toISO = d => `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
      startDate = d1s; endDate = d1e;
      // Server tự fetch giá đóng cửa DJI theo ngày và tính a, b
      payload = { modelId: 1, N, startDate: toISO(d1s), endDate: toISO(d1e) };
    } else if (modelId === 2) {
      payload = { modelId: 2, N,
        m: parseFloat(v2m), k: parseFloat(v2k), A: parseFloat(v2a) };
    } else if (modelId === 3) {
      payload = { modelId: 3, N,
        r1: parseFloat(v3a), T1: parseFloat(v3b),
        r2: parseFloat(v3c), T2: parseFloat(v3d) };
    } else {
      payload = { modelId: 4, N,
        K0: parseFloat(v4a), KT: parseFloat(v4b), Te: parseFloat(v4t) };
    }

    try {
      setSolving(true);
      const response = await fetch(`https://bvp-iud7.onrender.com/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Tái tạo yExact là hàm JS từ metadata server trả về
      let yExact;
      if (modelId === 1) {
        const { w, Ac, Bc } = data;
        yExact = t => Ac * Math.cos(w * t) + Bc * Math.sin(w * t);
      } else if (modelId === 2) {
        const { w, A_amp } = data;
        yExact = t => A_amp * Math.sin(w * t);
      } else if (modelId === 3) {
        const { C1, C2 } = data;
        yExact = r => C1 / r + C2;
      } else {
        const { K0, KT } = data;
        const Te = parseFloat(v4t);
        yExact = t => (KT - K0) * (t / Te) + K0;
      }

      const res = { ...data, yExact };
      if (modelId === 1) { res.startDate = startDate; res.endDate = endDate; }
      navigation.navigate('Result', { results: res });
    } catch (err) {
      Alert.alert('Lỗi kết nối server', `${err.message}\n\nKiểm tra server đang chạy tại ${SERVER_URL}`);
    } finally {
      setSolving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: th.bdr }}>
        <TouchableOpacity onPress={() => navigation.goBack()}
          style={{ padding: 8, borderRadius: 10, borderWidth: 1, borderColor: th.bdr, backgroundColor: th.cBg }}>
          <Text style={{ color: th.tx }}>‹ {T.home}</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'right', fontWeight: '600', fontSize: 15, color: th.tx }}>{T.inputTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Model header */}
        <View style={{ backgroundColor: th.acL, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8, borderWidth: 1, borderColor: th.ac + '30' }}>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22 }}>{md.icon}</Text>
          </View>
          <View>
            <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx }}>{names[modelId - 1]}</Text>
            <Text style={{ fontSize: 13, color: th.ac, fontWeight: '600' }}>FDM • SM • FEM</Text>
          </View>
        </View>

        {/* Model 1 */}
        {modelId === 1 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16, marginTop: 22 }}>{T.bvpBoundary}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><CalPick label={T.startDate} value={d1s} onChange={sd1s} /></View>
              <View style={{ flex: 1 }}><CalPick label={T.endDate} value={d1e} onChange={sd1e} /></View>
            </View>
            <View style={{ backgroundColor: th.acL, borderRadius: 10, padding: 10, marginTop: 4, borderWidth: 1, borderColor: th.ac + '30' }}>
              <Text style={{ fontSize: 12, color: th.ac }}>Giá đóng cửa DJI (y(a), y(b)) sẽ được tự động lấy từ dữ liệu thực theo ngày đã chọn.</Text>
            </View>
          </>
        )}

        {/* Model 2 */}
        {modelId === 2 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16, marginTop: 22 }}>{T.mechParams}</Text>
            <FieldInput label={T.mass} icon="⚖" value={v2m} onChangeText={s2m} />
            <FieldInput label={T.spring} icon="🔩" value={v2k} onChangeText={s2k} />
            <FieldInput label={T.amp} icon="↕" value={v2a} onChangeText={s2a} />
          </>
        )}

        {/* Model 3 */}
        {modelId === 3 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16, marginTop: 22 }}>{T.heatParams}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><FieldInput label={T.r1} icon="◉" value={v3a} onChangeText={s3a} /></View>
              <View style={{ flex: 1 }}><FieldInput label={T.t1} icon="🌡" value={v3b} onChangeText={s3b} /></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><FieldInput label={T.r2} icon="◎" value={v3c} onChangeText={s3c} /></View>
              <View style={{ flex: 1 }}><FieldInput label={T.t2} icon="🌡" value={v3d} onChangeText={s3d} /></View>
            </View>
          </>
        )}

        {/* Model 4 */}
        {modelId === 4 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16, marginTop: 22 }}>{T.econParams}</Text>
            <FieldInput label={T.k0} icon="📊" value={v4a} onChangeText={s4a} />
            <FieldInput label={T.kT} icon="🎯" value={v4b} onChangeText={s4b} />
            <FieldInput label={T.tEnd} icon="⏱" value={v4t} onChangeText={s4t} />
          </>
        )}

        {/* Grid N */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16, marginTop: 22 }}>{T.numParams}</Text>
        <FieldInput label={`${T.gridN} ${T.gridHint}`} icon="⚡" value={vN} onChangeText={sN} />

        <TouchableOpacity onPress={doSolve} disabled={solving} activeOpacity={0.8}
          style={{ backgroundColor: th.hBg, borderRadius: 14, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10, opacity: solving ? 0.7 : 1 }}>
          {solving
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>📊 {T.solve}</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
