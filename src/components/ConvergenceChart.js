import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

function fitLine(xs, ys) {
  const lx = xs.map(v => Math.log10(v));
  const ly = ys.map(v => Math.log10(v));
  const n = lx.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  const mx = lx.reduce((a, b) => a + b, 0) / n;
  const my = ly.reduce((a, b) => a + b, 0) / n;
  const num = lx.reduce((s, x, i) => s + (x - mx) * (ly[i] - my), 0);
  const den = lx.reduce((s, x) => s + (x - mx) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

function getLogTicks(minV, maxV) {
  const lo = Math.floor(Math.log10(minV));
  const hi = Math.ceil(Math.log10(maxV));
  const ticks = [];
  for (let e = lo; e <= hi; e++) {
    const v = Math.pow(10, e);
    if (v >= minV * 0.5 && v <= maxV * 2) ticks.push(v);
  }
  return ticks.length >= 2 ? ticks : [minV, maxV];
}

function getLinTicks(minV, maxV, count = 5) {
  return Array.from({ length: count }, (_, i) => minV + (i / (count - 1)) * (maxV - minV));
}

function fmtLogTick(v) {
  const e = Math.round(Math.log10(v));
  if (e === 0) return '1';
  if (e === 1) return '10';
  if (e === 2) return '100';
  return `1e${e}`;
}

export default function ConvergenceChart({ convData, mode, domainLen, isDark }) {
  const W = Dimensions.get('window').width - 72;
  const H = 250;
  const pad = { l: 56, r: 16, t: 14, b: 34 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const tc = isDark ? '#8899aa' : '#7a8a9a';
  const gc = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const refColor = '#16a34a';

  const valid = convData.filter(d =>
    d.eF > 1e-12 && d.eS > 1e-12 && d.eE > 1e-12 &&
    isFinite(d.eF) && isFinite(d.eS) && isFinite(d.eE)
  );
  if (valid.length < 3) return null;

  const isOrder = mode === 'order';
  const dl = domainLen > 0 ? domainLen : 1;

  const xVals = isOrder
    ? valid.map(d => dl / d.N)
    : valid.map(d => d.N);

  const datasets = [
    { ys: valid.map(d => d.eF), color: '#2563eb', label: 'FDM' },
    { ys: valid.map(d => d.eS), color: '#10b981', label: 'SM' },
    { ys: valid.map(d => d.eE), color: '#f59e0b', label: 'FEM' },
  ];

  const allY = datasets.flatMap(d => d.ys).filter(v => v > 0 && isFinite(v));
  const xRawMin = Math.min(...xVals), xRawMax = Math.max(...xVals);
  const yMin = Math.min(...allY) * 0.35;
  const yMax = Math.max(...allY) * 3;

  const xMin = isOrder ? xRawMin : 0;
  const xMax = xRawMax;

  if (!isFinite(xMin) || !isFinite(xMax) || !isFinite(yMin) || !isFinite(yMax) || yMin <= 0) return null;

  const logXMin = Math.log10(xMin || 1e-30);
  const logXMax = Math.log10(xMax);
  const logYMin = Math.log10(yMin);
  const logYMax = Math.log10(yMax);

  const tX = v => {
    if (isOrder) {
      if (logXMax === logXMin) return pad.l;
      return pad.l + (Math.log10(v) - logXMin) / (logXMax - logXMin) * cW;
    }
    if (xMax === xMin) return pad.l;
    return pad.l + (v - xMin) / (xMax - xMin) * cW;
  };
  const tY = v => {
    if (logYMax === logYMin) return pad.t + cH;
    return pad.t + cH - (Math.log10(v) - logYMin) / (logYMax - logYMin) * cH;
  };

  const xTicks = isOrder ? getLogTicks(xRawMin, xRawMax) : getLinTicks(0, xMax, 5);
  const yTicks = getLogTicks(yMin, yMax);

  // Compute fitted line data for each dataset (order mode only)
  const fittedLines = isOrder ? datasets.map(ds => {
    const { slope, intercept } = fitLine(xVals, ds.ys);
    const pts = xVals.map(h => {
      const eFit = Math.pow(10, intercept + slope * Math.log10(h));
      if (!isFinite(eFit) || eFit < yMin * 0.05 || eFit > yMax * 20) return null;
      const px = tX(h), py = tY(eFit);
      if (!isFinite(px) || !isFinite(py)) return null;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).filter(Boolean).join(' ');
    return { slope, pts };
  }) : null;

  // O(h²) reference line anchored at the median FDM point
  let refPts = '';
  if (isOrder && xVals.length >= 2) {
    const mid = Math.floor(xVals.length / 2);
    const C2 = valid[mid].eF / Math.pow(xVals[mid], 2);
    refPts = xVals.map(h => {
      const e = C2 * h * h;
      if (!isFinite(e) || e < yMin * 0.05 || e > yMax * 20) return null;
      const px = tX(h), py = tY(e);
      if (!isFinite(px) || !isFinite(py)) return null;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).filter(Boolean).join(' ');
  }

  const makePts = ys =>
    xVals.map((xv, i) => {
      const yv = ys[i];
      if (!yv || yv <= 0 || !isFinite(yv)) return null;
      const px = tX(xv), py = tY(yv);
      if (!isFinite(px) || !isFinite(py) || py < pad.t - 10 || py > H - pad.b + 10) return null;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).filter(Boolean).join(' ');

  const xLabel = isOrder ? 'h' : 'N';
  const yLabel = 'Sai số L∞';

  return (
    <View>
      <Svg width={W} height={H}>
        {/* Y-axis label (rotated) */}
        <SvgText
          x={0} y={0}
          fill={tc} fontSize={8} textAnchor="middle"
          transform={`rotate(-90) translate(${-(pad.t + cH / 2)}, 10)`}
        >
          {yLabel}
        </SvgText>

        {/* Y grid lines + tick labels */}
        {yTicks.map((v, i) => {
          const y = tY(v);
          if (!isFinite(y) || y < pad.t - 4 || y > H - pad.b + 4) return null;
          return (
            <React.Fragment key={`yl${i}`}>
              <Line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke={gc} strokeWidth={1} />
              <SvgText x={pad.l - 5} y={y + 4} fill={tc} fontSize={8} textAnchor="end">
                {fmtLogTick(v)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X grid lines + tick labels */}
        {xTicks.map((v, i) => {
          const x = tX(v);
          if (!isFinite(x) || x < pad.l - 4 || x > W - pad.r + 4) return null;
          return (
            <React.Fragment key={`xl${i}`}>
              <Line x1={x} y1={pad.t} x2={x} y2={H - pad.b} stroke={gc} strokeWidth={1} />
              <SvgText x={x} y={H - pad.b + 13} fill={tc} fontSize={8} textAnchor="middle">
                {isOrder ? fmtLogTick(v) : Math.round(v)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* X-axis label */}
        <SvgText x={pad.l + cW / 2} y={H - 2} fill={tc} fontSize={8} textAnchor="middle">
          {xLabel}
        </SvgText>

        {/* O(h²) reference line */}
        {isOrder && refPts !== '' && (
          <Polyline points={refPts} fill="none" stroke={refColor}
            strokeWidth={1.5} strokeDasharray="3,3" />
        )}

        {/* Fitted lines (dashed, same color) — order mode only */}
        {isOrder && fittedLines && fittedLines.map((fl, di) => (
          fl.pts ? (
            <Polyline key={`fit${di}`} points={fl.pts} fill="none"
              stroke={datasets[di].color} strokeWidth={1.5} strokeDasharray="6,3"
              strokeOpacity={0.7} />
          ) : null
        ))}

        {/* Actual data lines + dots */}
        {datasets.map((ds, di) => {
          const pts = makePts(ds.ys);
          if (!pts) return null;
          return (
            <React.Fragment key={di}>
              <Polyline points={pts} fill="none" stroke={ds.color} strokeWidth={2} />
              {xVals.map((xv, i) => {
                const yv = ds.ys[i];
                if (!yv || yv <= 0 || !isFinite(yv)) return null;
                const px = tX(xv), py = tY(yv);
                if (!isFinite(px) || !isFinite(py) || py < pad.t - 10 || py > H - pad.b + 10) return null;
                return <Circle key={i} cx={px} cy={py} r={2.5} fill={ds.color} />;
              })}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
        {datasets.map((ds, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: ds.color }} />
            <Text style={{ fontSize: 10, color: tc }}>
              {isOrder && fittedLines
                ? `${ds.label} (p≈${fittedLines[i].slope.toFixed(2)})`
                : ds.label}
            </Text>
          </View>
        ))}
        {isOrder && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 14, height: 2, backgroundColor: refColor }} />
            <Text style={{ fontSize: 10, color: tc }}>O(h²)</Text>
          </View>
        )}
      </View>
    </View>
  );
}
