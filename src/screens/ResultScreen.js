import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useApp, useTheme } from '../context/AppContext';
import SChart from '../components/SChart';
import ConvergenceChart from '../components/ConvergenceChart';

export default function ResultScreen({ route, navigation }) {
  const { results: res } = route.params;
  const { isDark, T } = useApp();
  const th = useTheme();
  const { fdm, sm, fem, tEx, yEx, eF, eS, eE, convData } = res;
  const domainLen = fdm.t[fdm.t.length - 1] - fdm.t[0];
  const xLb = res.mdl === 3 ? 'r (km)' : res.mdl === 1 ? T.xAxisDays : 't';

  const ds = [
    { x: tEx, y: yEx, color: '#94a3b8', thick: 2.5, dash: true, label: T.exact },
    { x: fdm.t, y: fdm.y, color: '#2563eb', dots: true, thick: 2, label: 'FDM' },
    { x: sm.t, y: sm.y, color: '#10b981', thick: 2, label: 'SM' },
    { x: fem.t, y: fem.y, color: '#f59e0b', thick: 2, label: 'FEM' },
  ];

  const adv = res.mdl === 1 ? T.adv1 : res.mdl === 2 ? T.adv2 : res.mdl === 3 ? T.adv3 : T.adv4;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: th.bdr }}>
        <TouchableOpacity onPress={() => navigation.goBack()}
          style={{ padding: 8, borderRadius: 10, borderWidth: 1, borderColor: th.bdr, backgroundColor: th.cBg }}>
          <Text style={{ color: th.tx }}>‹ {T.inputTitle}</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'right', fontWeight: '600', fontSize: 15, color: th.tx }}>{T.resultTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Chart */}
        <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: th.bdr }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 2 }}>{T.chartTitle}</Text>
          <Text style={{ fontSize: 12, color: th.ts, marginBottom: 10 }}>{T.chartSub}</Text>
          <SChart datasets={ds} xLabel={xLb} isDark={isDark} />
        </View>

        {/* Model 1 — Stock BVP */}
        {res.mdl === 1 && (() => {
          const { w, Ac, Bc, a, b, ya, yb, fdm, sm, fem, yExact, startDate, endDate } = res;
          const N = fdm.t.length;
          const step = Math.max(1, Math.floor((N - 1) / 9));
          const rows = [];
          for (let i = 0; i < N; i += step) rows.push(i);
          if (rows[rows.length - 1] !== N - 1) rows.push(N - 1);
          const fmtDate = d => d ? `${String(d.d).padStart(2,'0')}/${String(d.m).padStart(2,'0')}/${d.y}` : '';

          return (
            <View style={{ marginBottom: 14 }}>
              {/* Date range info */}
              {startDate && endDate && (
                <View style={{ backgroundColor: th.acL, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: th.ac, fontWeight: '600' }}>{fmtDate(startDate)} → {fmtDate(endDate)}</Text>
                  <Text style={{ fontSize: 12, color: th.ac, fontWeight: '600' }}>T = {b - a} {T.days}  |  ω = {w.toFixed(4)}</Text>
                </View>
              )}
              {/* Solution Table */}
              <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 10, borderWidth: 1, borderColor: th.bdr }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 12 }}>📋 {T.solTable}</Text>
                {/* Header */}
                <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: th.ac }}>
                  {[T.tDaysCol, T.exact, 'FDM', 'SM', 'FEM'].map((h, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 11, fontWeight: '800', color: th.ac, textAlign: 'center' }}>{h}</Text>
                  ))}
                </View>
                {rows.map((i, idx) => {
                  const ti = fdm.t[i];
                  const ex = yExact(ti);
                  return (
                    <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: th.bdr, backgroundColor: idx % 2 === 0 ? 'transparent' : th.acL + '50' }}>
                      <Text style={{ flex: 1, fontSize: 11, color: th.ts, textAlign: 'center' }}>{ti.toFixed(2)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{ex.toFixed(4)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#2563eb', textAlign: 'center' }}>{fdm.y[i].toFixed(4)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#10b981', textAlign: 'center' }}>{sm.y[i].toFixed(4)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>{fem.y[i].toFixed(4)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* Model 2 — Auto Feeder */}
        {res.mdl === 2 && (() => {
          const { fdm, sm, fem, yExact, w, A_amp } = res;
          const N = fdm.t.length;
          const step = Math.max(1, Math.floor((N - 1) / 9));
          const rows = [];
          for (let i = 0; i < N; i += step) rows.push(i);
          if (rows[rows.length - 1] !== N - 1) rows.push(N - 1);

          return (
            <View style={{ marginBottom: 14 }}>
              {/* Solution Table */}
              <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 10, borderWidth: 1, borderColor: th.bdr }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 12 }}>📋 {T.solTable}</Text>
                <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: th.ac }}>
                  {['t', T.exact, 'FDM', 'SM', 'FEM'].map((h, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 11, fontWeight: '800', color: th.ac, textAlign: 'center' }}>{h}</Text>
                  ))}
                </View>
                {rows.map((i, idx) => {
                  const ti = fdm.t[i];
                  const ex = yExact(ti);
                  return (
                    <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: th.bdr, backgroundColor: idx % 2 === 0 ? 'transparent' : th.acL + '50' }}>
                      <Text style={{ flex: 1, fontSize: 11, color: th.ts, textAlign: 'center' }}>{ti.toFixed(2)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{ex.toFixed(6)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#2563eb', textAlign: 'center' }}>{fdm.y[i].toFixed(6)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#10b981', textAlign: 'center' }}>{sm.y[i].toFixed(6)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>{fem.y[i].toFixed(6)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* Model 3 — Earth Core Heat */}
        {res.mdl === 3 && (() => {
          const { fdm, sm, fem, yExact } = res;
          const N = fdm.t.length;
          const step = Math.max(1, Math.floor((N - 1) / 9));
          const rows = [];
          for (let i = 0; i < N; i += step) rows.push(i);
          if (rows[rows.length - 1] !== N - 1) rows.push(N - 1);

          return (
            <View style={{ marginBottom: 14 }}>
              {/* Solution Table */}
              <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 10, borderWidth: 1, borderColor: th.bdr }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 12 }}>📋 {T.solTable}</Text>
                <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: th.ac }}>
                  {['r (km)', T.exact, 'FDM', 'SM', 'FEM'].map((h, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 11, fontWeight: '800', color: th.ac, textAlign: 'center' }}>{h}</Text>
                  ))}
                </View>
                {rows.map((i, idx) => {
                  const ri = fdm.t[i];
                  const ex = yExact(ri);
                  return (
                    <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: th.bdr, backgroundColor: idx % 2 === 0 ? 'transparent' : th.acL + '50' }}>
                      <Text style={{ flex: 1, fontSize: 11, color: th.ts, textAlign: 'center' }}>{Math.round(ri)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{ex.toFixed(2)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#2563eb', textAlign: 'center' }}>{fdm.y[i].toFixed(2)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#10b981', textAlign: 'center' }}>{sm.y[i].toFixed(2)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>{fem.y[i].toFixed(2)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* Model 4 — Investment */}
        {res.mdl === 4 && (() => {
          const { fdm, sm, fem, yExact } = res;
          const N = fdm.t.length;
          const step = Math.max(1, Math.floor((N - 1) / 9));
          const rows = [];
          for (let i = 0; i < N; i += step) rows.push(i);
          if (rows[rows.length - 1] !== N - 1) rows.push(N - 1);
          return (
            <View style={{ marginBottom: 14 }}>
              <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 10, borderWidth: 1, borderColor: th.bdr }}>
                <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 12 }}>📋 {T.solTable}</Text>
                <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: th.ac }}>
                  {['t', T.exact, 'FDM', 'SM', 'FEM'].map((h, i) => (
                    <Text key={i} style={{ flex: 1, fontSize: 11, fontWeight: '800', color: th.ac, textAlign: 'center' }}>{h}</Text>
                  ))}
                </View>
                {rows.map((i, idx) => {
                  const ti = fdm.t[i];
                  const ex = yExact(ti);
                  return (
                    <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: th.bdr, backgroundColor: idx % 2 === 0 ? 'transparent' : th.acL + '50' }}>
                      <Text style={{ flex: 1, fontSize: 11, color: th.ts, textAlign: 'center' }}>{ti.toFixed(4)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{ex.toFixed(6)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#2563eb', textAlign: 'center' }}>{fdm.y[i].toFixed(6)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#10b981', textAlign: 'center' }}>{sm.y[i].toFixed(6)}</Text>
                      <Text style={{ flex: 1, fontSize: 11, color: '#f59e0b', textAlign: 'center' }}>{fem.y[i].toFixed(6)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })()}

        {/* Error table */}
        <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: th.bdr }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 14 }}>{T.errTable}</Text>
          {[{ n: 'FDM', e: eF, c: '#2563eb' }, { n: 'SM', e: eS, c: '#10b981' }, { n: 'FEM', e: eE, c: '#f59e0b' }].map(m => (
            <View key={m.n} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: th.bdr }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: m.c }} />
                <Text style={{ color: th.tx, fontSize: 14 }}>{m.n}</Text>
              </View>
              <Text style={{ fontWeight: '600', color: th.tx, fontSize: 13 }}>{m.e.toExponential(4)}</Text>
            </View>
          ))}
        </View>

        {/* Convergence Order Chart */}
        {convData && convData.length >= 3 && (
          <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: th.bdr }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 2 }}>{T.convOrderTitle}</Text>
            <Text style={{ fontSize: 12, color: th.ts, marginBottom: 10 }}>{T.convOrderSub}</Text>
            <ConvergenceChart convData={convData} mode="order" domainLen={domainLen} isDark={isDark} skipHFilter={res.mdl === 3} />
          </View>
        )}

        {/* Convergence by N Chart */}
        {convData && convData.length >= 3 && (
          <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: th.bdr }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 2 }}>{T.convNTitle}</Text>
            <Text style={{ fontSize: 12, color: th.ts, marginBottom: 10 }}>{T.convNSub}</Text>
            <ConvergenceChart convData={convData} mode="N" domainLen={domainLen} isDark={isDark} />
          </View>
        )}

        {/* Advice — hidden for Model 1, 2, 3, and 4 */}
        {res.mdl !== 1 && res.mdl !== 2 && res.mdl !== 3 && res.mdl !== 4 && (
          <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: th.bdr, borderLeftWidth: 4, borderLeftColor: th.ac }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: th.tx, marginBottom: 8 }}>💡 {T.advice}</Text>
            <Text style={{ fontSize: 14, color: th.ts, lineHeight: 22 }}>{adv}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
