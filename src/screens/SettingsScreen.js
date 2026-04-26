import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useApp, useTheme } from '../context/AppContext';
import { FlagVN, FlagGB } from '../components/FlagIcon';

export default function SettingsScreen({ navigation }) {
  const { lang, setLang, isDark, setIsDark, T } = useApp();
  const th = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: th.bdr }}>
        <TouchableOpacity onPress={() => navigation.goBack()}
          style={{ padding: 8, borderRadius: 10, borderWidth: 1, borderColor: th.bdr, backgroundColor: th.cBg }}>
          <Text style={{ color: th.tx }}>‹ {T.home}</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'right', fontWeight: '600', fontSize: 15, color: th.tx }}>{T.settings}</Text>
      </View>
      <View style={{ padding: 16 }}>
        {/* Ngôn ngữ */}
        <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: th.bdr }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: th.tx, marginBottom: 16 }}>{T.language}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[['vi', '🇻🇳', 'Tiếng Việt'], ['en', '🇬🇧', 'English']].map(([c, flag, name]) => {
              const sel = lang === c;
              return (
                <TouchableOpacity key={c} onPress={() => setLang(c)}
                  style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, borderRadius: 14, borderWidth: 2, borderColor: sel ? th.ac : th.bdr, backgroundColor: sel ? th.acL : 'transparent', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 32, lineHeight: 36 }}>{flag}</Text>
                  <Text style={{ color: sel ? th.ac : th.tx, fontWeight: sel ? '700' : '500', fontSize: 13 }}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* Giao diện */}
        <View style={{ backgroundColor: th.cBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: th.bdr }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: th.tx, marginBottom: 16 }}>{T.theme}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[[false, '☀', '#f59e0b', T.light], [true, '☽', '#94a3b8', T.dark]].map(([v, icon, ic, label]) => {
              const sel = isDark === v;
              return (
                <TouchableOpacity key={String(v)} onPress={() => setIsDark(v)}
                  style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, borderRadius: 14, borderWidth: 2, borderColor: sel ? th.ac : th.bdr, backgroundColor: sel ? th.acL : 'transparent', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 30, fontWeight: '300', color: ic, lineHeight: 36 }}>{icon}</Text>
                  <Text style={{ color: sel ? th.ac : th.tx, fontWeight: sel ? '700' : '500', fontSize: 13 }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
