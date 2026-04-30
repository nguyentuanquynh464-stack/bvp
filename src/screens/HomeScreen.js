import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useApp, useTheme } from '../context/AppContext';

const mdDefs = [
  { id: 1, icon: '📈' },
  { id: 2, icon: '⚙️' },
  { id: 3, icon: '🌍' },
  { id: 4, icon: '💼' },
];
const bCols = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function HomeScreen({ navigation }) {
  const { isDark, T } = useApp();
  const th = useTheme();
  const names = [T.m1, T.m2, T.m3, T.m4];
  const descs = [T.m1d, T.m2d, T.m3d, T.m4d];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: th.bdr }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: th.tx }}>{T.home}</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}
          style={{ padding: 8, borderRadius: 10, borderWidth: 1, borderColor: th.bdr, backgroundColor: th.cBg }}>
          <Text>⚙️</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: th.ac, marginBottom: 6, textAlign: 'center' }}>{T.welcomeMsg}</Text>
          <Text style={{ fontSize: 14, color: th.ts, textAlign: 'center', lineHeight: 22 }}>{T.welcomeSub}</Text>
        </View>
        <View style={{ backgroundColor: th.hBg, borderRadius: 16, padding: 22, marginBottom: 22 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{T.chooseModel}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 18 }}>4 {T.nModels}</Text>
          <View style={{ flexDirection: 'row', borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' }}>
            {[['3', T.methods], ['4', T.models]].map(([n, l], i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', padding: 18, borderRightWidth: i < 1 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{n}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>{l}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 18, fontWeight: '700', color: th.tx, marginBottom: 14 }}>{T.modelList}</Text>
        {mdDefs.map((m, idx) => (
          <TouchableOpacity key={m.id} onPress={() => navigation.navigate('Input', { modelId: m.id })} activeOpacity={0.7}
            style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: th.bdr, borderLeftWidth: 4, borderLeftColor: bCols[idx], flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: bCols[idx] + '18', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24 }}>{m.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: th.tx, marginBottom: 4 }}>{names[idx]}</Text>
              <Text style={{ fontSize: 13, color: th.ts, marginBottom: 8, lineHeight: 18 }}>{descs[idx]}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['FDM', 'SM', 'FEM'].map(tag => (
                  <View key={tag} style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: bCols[idx] + '15', borderWidth: 1, borderColor: bCols[idx] + '40' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: bCols[idx] }}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={{ fontSize: 20, color: th.ts }}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
