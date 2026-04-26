import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useApp } from '../context/AppContext';

export default function CalPick({ label, value, onChange }) {
  const { isDark, T } = useApp();
  const [open, setOpen] = useState(false);
  const [vY, sY] = useState(value.y);
  const [vM, sM] = useState(value.m);
  const [mode, setMode] = useState('day');
  const [yBase, setYBase] = useState(Math.floor(value.y / 12) * 12);

  const bg = isDark ? '#1e2230' : '#fff';
  const tx = isDark ? '#e8ecf4' : '#1a2030';
  const ts = isDark ? '#6a7a8a' : '#8a9aaa';
  const bdr = isDark ? '#333' : '#e0e0e0';
  const ac = '#2563eb';
  const iBg = isDark ? '#252b3b' : '#f7f8fb';

  const dim = new Date(vY, vM, 0).getDate();
  const fdow = new Date(vY, vM - 1, 1).getDay();
  const cells = [];
  for (let i = 0; i < fdow; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);

  const fmt = v => `${String(v.d).padStart(2, '0')}/${String(v.m).padStart(2, '0')}/${v.y}`;
  const prevM = () => { if (vM === 1) { sM(12); sY(vY - 1); } else sM(vM - 1); };
  const nextM = () => { if (vM === 12) { sM(1); sY(vY + 1); } else sM(vM + 1); };
  const pick = d => { onChange({ y: vY, m: vM, d }); setOpen(false); setMode('day'); };
  const isSel = d => d === value.d && vM === value.m && vY === value.y;
  const openCal = () => { sY(value.y); sM(value.m); setYBase(Math.floor(value.y / 12) * 12); setMode('day'); setOpen(true); };
  const years = Array.from({ length: 12 }, (_, i) => yBase + i);

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, color: ts, fontWeight: '500', marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: bdr, backgroundColor: iBg }} onPress={openCal}>
        <Text style={{ fontSize: 16, marginRight: 10 }}>📅</Text>
        <Text style={{ fontSize: 15, fontWeight: '500', color: tx }}>{fmt(value)}</Text>
        <Text style={{ marginLeft: 'auto', color: ts }}>▼</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={{ width: 320, borderRadius: 16, padding: 16, backgroundColor: bg, borderWidth: 1, borderColor: bdr }} onStartShouldSetResponder={() => true}>
            {mode === 'day' ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <TouchableOpacity onPress={prevM} style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: bdr, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, color: tx }}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMode('year')} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: ac + '18' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: ac }}>{T.mN[vM - 1]} {vY} ▾</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={nextM} style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: bdr, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, color: tx }}>›</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  {T.dN.map(d => <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: ts }}>{d}</Text>)}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {cells.map((d, i) => (
                    <TouchableOpacity key={i} disabled={!d} onPress={() => d && pick(d)}
                      style={{ width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, ...(d && isSel(d) ? { backgroundColor: ac } : {}) }}>
                      <Text style={{ fontSize: 14, fontWeight: d && isSel(d) ? '700' : '500', color: d ? (isSel(d) ? '#fff' : tx) : 'transparent' }}>{d || ''}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <TouchableOpacity onPress={() => setYBase(yBase - 12)} style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: bdr, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, color: tx }}>‹</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: tx }}>{yBase} – {yBase + 11}</Text>
                  <TouchableOpacity onPress={() => setYBase(yBase + 12)} style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: bdr, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, color: tx }}>›</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {years.map(y => (
                    <TouchableOpacity key={y} onPress={() => { sY(y); setMode('day'); }}
                      style={{ width: '30%', paddingVertical: 11, borderRadius: 10, alignItems: 'center', backgroundColor: y === vY ? ac : iBg, borderWidth: 1.5, borderColor: y === vY ? ac : bdr }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: y === vY ? '#fff' : tx }}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setMode('day')} style={{ marginTop: 14, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: bdr, alignItems: 'center' }}>
                  <Text style={{ color: ts, fontSize: 13 }}>‹ {T.mN[vM - 1]} {vY}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
