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
    let basePayload;
    let startDate, endDate;

    if (modelId === 1) {
      const toISO = d => `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`;
      startDate = d1s; endDate = d1e;
      basePayload = { modelId: 1, startDate: toISO(d1s), endDate: toISO(d1e) };
    } else if (modelId === 2) {
      basePayload = { modelId: 2, m: parseFloat(v2m), k: parseFloat(v2k), A: parseFloat(v2a) };
    } else if (modelId === 3) {
      basePayload = { modelId: 3, r1: parseFloat(v3a), T1: parseFloat(v3b),
        r2: parseFloat(v3c), T2: parseFloat(v3d) };
    } else {
      basePayload = { modelId: 4, K0: parseFloat(v4a), KT: parseFloat(v4b), Te: parseFloat(v4t) };
    }

    const SERVER = 'https://bvp-iud7.onrender.com';
    const makeFetch = (n) => fetch(`${SERVER}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...basePayload, N: n }),
    }).then(r => r.json()).catch(() => null);

    // Fixed N values for convergence order chart + user's N for main result
    const convNs = [...new Set([5, 9, 17, 33, 65, 129, 257, N])].sort((a, b) => a - b);

    try {
      setSolving(true);
      const allResults = await Promise.all(convNs.map(makeFetch));

      const mainIdx = convNs.indexOf(N);
      const data = allResults[mainIdx];
      if (!data || data.error) throw new Error(data?.error || 'Lỗi kết nối server');

      // Build convergence dataset (filter out failed calls)
      const convData = convNs.map((n, i) => {
        const r = allResults[i];
        if (!r || r.error || r.eF == null || r.eS == null || r.eE == null) return null;
        return { N: n, eF: r.eF, eS: r.eS, eE: r.eE };
      }).filter(Boolean);

      // Reconstruct yExact function from server metadata
      let yExact;
      if (modelId === 1) {
        const { w, Ac, Bc, mu: mu1 } = data;
        yExact = t => Ac * Math.cos(w * t) + Bc * Math.sin(w * t) + (mu1 || 0);
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

      const res = { ...data, yExact, convData };
      if (modelId === 1) { res.startDate = startDate; res.endDate = endDate; }
      navigation.navigate('Result', { results: res });
    } catch (err) {
      Alert.alert('Lỗi kết nối server', err.message);
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 10, marginTop: 22 }}>{T.m1Intro}</Text>
            <Text style={{ fontSize: 13, color: th.ts, lineHeight: 21, marginBottom: 18 }}>{T.m1IntroText}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16 }}>{T.bvpBoundary}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><CalPick label={T.startDate} value={d1s} onChange={sd1s} /></View>
              <View style={{ flex: 1 }}><CalPick label={T.endDate} value={d1e} onChange={sd1e} /></View>
            </View>
          </>
        )}

        {/* Model 2 */}
        {modelId === 2 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 10, marginTop: 22 }}>{T.m2Intro}</Text>
            <Text style={{ fontSize: 13, color: th.ts, lineHeight: 21, marginBottom: 18 }}>{T.m2IntroText}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16 }}>{T.mechParams}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><FieldInput label={T.mass} icon="⚖" value={v2m} onChangeText={s2m} /></View>
              <View style={{ flex: 1 }}><FieldInput label={T.spring} icon="🔩" value={v2k} onChangeText={s2k} /></View>
            </View>
            <FieldInput label={T.amp} icon="↕" value={v2a} onChangeText={s2a} />
          </>
        )}

        {/* Model 3 */}
        {modelId === 3 && (
          <>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 10, marginTop: 22 }}>{T.m3Intro}</Text>
            <Text style={{ fontSize: 13, color: th.ts, lineHeight: 21, marginBottom: 18 }}>{T.m3IntroText}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16 }}>{T.heatParams}</Text>
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
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 10, marginTop: 22 }}>{T.m4Intro}</Text>
            <Text style={{ fontSize: 13, color: th.ts, lineHeight: 21, marginBottom: 18 }}>{T.m4IntroText}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 16 }}>{T.econParams}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}><FieldInput label={T.k0} icon="📊" value={v4a} onChangeText={s4a} /></View>
              <View style={{ flex: 1 }}><FieldInput label={T.kT} icon="🎯" value={v4b} onChangeText={s4b} /></View>
            </View>
            <FieldInput label={T.tEnd} icon="⏱" value={v4t} onChangeText={s4t} />
          </>
        )}

        {/* BVP Equation */}
        <Text style={{ fontSize: 13, fontWeight: '700', color: th.ac, letterSpacing: 0.8, marginBottom: 12, marginTop: 22 }}>{T.bvpEquLabel}</Text>
        <View style={{ backgroundColor: th.cBg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: th.bdr, marginBottom: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
            {/* Left brace bar */}
            <View style={{ width: 3, backgroundColor: th.ac, borderRadius: 99 }} />
            {/* System lines */}
            <View style={{ flex: 1, gap: 8 }}>
              {modelId === 1 && (
                <>
                  <Text style={{ fontSize: 14, color: th.tx, fontWeight: '600' }}>x″(t) + ω²x(t) = 0</Text>
                  <Text style={{ fontSize: 13, color: th.ts }}>x(a) = y(a)</Text>
                  <Text style={{ fontSize: 13, color: th.ts }}>x(b) = y(b)</Text>
                  <View style={{ marginTop: 2, paddingTop: 6, borderTopWidth: 1, borderTopColor: th.bdr }}>
                    <Text style={{ fontSize: 12, color: th.ac }}>ω = 3π / (2(b − a))</Text>
                  </View>
                </>
              )}
              {modelId === 2 && (
                <>
                  <Text style={{ fontSize: 14, color: th.tx, fontWeight: '600' }}>mx″(t) + kx(t) = 0</Text>
                  <Text style={{ fontSize: 13, color: th.ts }}>x(0) = 0,{'   '}x(1) = 0</Text>
                </>
              )}
              {modelId === 3 && (
                <>
                  <Text style={{ fontSize: 14, color: th.tx, fontWeight: '600' }}>ru″(r) + 2u′(r) = 0</Text>
                  <Text style={{ fontSize: 13, color: th.ts }}>u(r₁) = T₁,{'   '}u(r₂) = T₂</Text>
                </>
              )}
              {modelId === 4 && (
                <>
                  <Text style={{ fontSize: 14, color: th.tx, fontWeight: '600' }}>x″(t) = 0</Text>
                  <Text style={{ fontSize: 13, color: th.ts }}>x(0) = K₀</Text>
                  <Text style={{ fontSize: 13, color: th.ts }}>x(T) = K_T</Text>
                </>
              )}
            </View>
          </View>
        </View>

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
