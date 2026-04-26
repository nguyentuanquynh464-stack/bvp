import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

export default function SChart({ datasets, isDark }) {
  const W = Dimensions.get('window').width - 64, H = 220;
  const p = { l: 58, r: 12, t: 12, b: 26 };
  const cW = W - p.l - p.r, cH = H - p.t - p.b;

  let aX = [], aY = [];
  datasets.forEach(d => { aX.push(...d.x); aY.push(...d.y); });
  const xMn = Math.min(...aX), xMx = Math.max(...aX);
  const yMn = Math.min(...aY), yMx = Math.max(...aY);
  const xR = xMx - xMn || 1;
  const yP = (yMx - yMn) * 0.08 || 1;
  const yLo = yMn - yP, yHi = yMx + yP, yR = yHi - yLo;

  const tX = v => p.l + ((v - xMn) / xR) * cW;
  const tY = v => p.t + cH - ((v - yLo) / yR) * cH;
  const gc = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const tc = isDark ? '#8899aa' : '#7a8a9a';
  const cols = ['#94a3b8', '#2563eb', '#10b981', '#f59e0b'];

  return (
    <View>
      <Svg width={W} height={H}>
        {[0, 1, 2, 3, 4].map(i => {
          const y = p.t + (i / 4) * cH, val = yHi - (i / 4) * yR;
          return (
            <React.Fragment key={i}>
              <Line x1={p.l} y1={y} x2={W - p.r} y2={y} stroke={gc} strokeWidth={1} />
              <SvgText x={p.l - 5} y={y + 4} fill={tc} fontSize={9} textAnchor="end">
                {Math.abs(val) > 100 ? Math.round(val) : val.toFixed(3)}
              </SvgText>
            </React.Fragment>
          );
        })}
        {[0, 1, 2, 3, 4].map(i => {
          const x = p.l + (i / 4) * cW, val = xMn + (i / 4) * xR;
          return (
            <SvgText key={i} x={x} y={H - 6} fill={tc} fontSize={9} textAnchor="middle">
              {Math.abs(val) > 100 ? Math.round(val) : val.toFixed(1)}
            </SvgText>
          );
        })}
        {datasets.map((d, di) => {
          const pts = d.x.map((xv, i) => `${tX(xv)},${tY(d.y[i])}`).join(' ');
          return (
            <React.Fragment key={di}>
              <Polyline points={pts} fill="none" stroke={d.color || cols[di]}
                strokeWidth={d.thick || 2} strokeDasharray={d.dash ? '6,4' : undefined} />
              {d.dots && d.x.map((xv, i) => (
                <Circle key={i} cx={tX(xv)} cy={tY(d.y[i])} r={2.5} fill={d.color || cols[di]} />
              ))}
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
        {datasets.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: d.color || cols[i] }} />
            <Text style={{ fontSize: 11, color: tc }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
