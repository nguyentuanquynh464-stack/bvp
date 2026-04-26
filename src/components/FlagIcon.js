import React from 'react';
import Svg, { Rect, Polygon, Path } from 'react-native-svg';

// Cờ Việt Nam: nền đỏ + ngôi sao vàng 5 cánh
// viewBox 3×2 (tỷ lệ chuẩn), star tâm (1.5,1.0), R=0.45, r=0.18
export function FlagVN({ width = 48, height = 32 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 3 2">
      <Rect width="3" height="2" fill="#DA251D" />
      <Polygon
        points="1.5,0.55 1.606,0.854 1.928,0.861 1.671,1.056 1.765,1.364 1.5,1.18 1.235,1.364 1.329,1.056 1.072,0.861 1.394,0.854"
        fill="#FFCD00"
      />
    </Svg>
  );
}

// Cờ Anh (Union Jack): viewBox 60×30 (tỷ lệ 2:1)
// - Nền xanh navy #012169
// - Chữ X trắng (St Andrew, rộng 6) + chữ X đỏ đối xứng ngược (St Patrick, rộng 2)
// - Chữ + trắng (St George, rộng 10) + chữ + đỏ (rộng 6)
// Đường chéo đỏ được offset đúng kiểu "counterchanged"
// Perpendicular shift = 2 đơn vị: Δ = (±2/√5, ±4/√5) ≈ (±0.894, ±1.789)
export function FlagGB({ width = 48, height = 32 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 30">
      {/* Nền xanh navy */}
      <Rect width="60" height="30" fill="#012169" />

      {/* Chữ X trắng – St Andrew (rộng 6) */}
      <Path d="M0,0 L60,30" stroke="white" strokeWidth="6" />
      <Path d="M60,0 L0,30" stroke="white" strokeWidth="6" />

      {/* Chữ X đỏ counterchanged – St Patrick (rộng 2, offset 2 đơn vị perpendicular)
          \ trên: lệch về phía NW (−0.894, +1.789)
          \ dưới: lệch về phía SE (+0.894, −1.789)
          / trên: lệch về phía NE (+0.894, −1.789) — hướng lên-phải trong SVG
          / dưới: lệch về phía SW (−0.894, +1.789) */}
      <Path d="M-0.894,1.789 L29.106,16.789"  stroke="#C8102E" strokeWidth="2" />
      <Path d="M30.894,13.211 L60.894,28.211"  stroke="#C8102E" strokeWidth="2" />
      <Path d="M60.894,-1.789 L30.894,13.211"  stroke="#C8102E" strokeWidth="2" />
      <Path d="M29.106,16.789 L-0.894,31.789"  stroke="#C8102E" strokeWidth="2" />

      {/* Chữ + trắng – St George (rộng 10) */}
      <Path d="M30,0 L30,30" stroke="white" strokeWidth="10" />
      <Path d="M0,15 L60,15" stroke="white" strokeWidth="10" />

      {/* Chữ + đỏ – St George (rộng 6) */}
      <Path d="M30,0 L30,30" stroke="#C8102E" strokeWidth="6" />
      <Path d="M0,15 L60,15" stroke="#C8102E" strokeWidth="6" />
    </Svg>
  );
}
