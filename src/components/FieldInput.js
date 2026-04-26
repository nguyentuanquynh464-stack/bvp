import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../context/AppContext';

export default function FieldInput({ label, icon, value, onChangeText }) {
  const th = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, color: th.ts, fontWeight: '500', marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: th.bdr, backgroundColor: th.iBg, paddingHorizontal: 14 }}>
        <Text style={{ fontSize: 16, marginRight: 10, opacity: 0.4 }}>{icon}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: th.tx }}
          placeholderTextColor={th.ts}
        />
      </View>
    </View>
  );
}
