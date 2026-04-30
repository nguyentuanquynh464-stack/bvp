import React from 'react';
import Svg, {
  Rect, Circle, Path, Line, Polygon,
  Text as SvgText, G, Defs, ClipPath,
} from 'react-native-svg';

export default function BVPLogo({ width = 56, showText = false }) {
  const vbHeight = showText ? 522 : 400;
  const height = Math.round(width * (vbHeight / 400));

  return (
    <Svg width={width} height={height} viewBox={`140 20 400 ${vbHeight}`}>
      <Defs>
        <ClipPath id="bvpCardClip">
          <Rect x="140" y="20" width="400" height="522" rx="36" />
        </ClipPath>
      </Defs>

      {/* Shadow */}
      <Rect x="144" y="25" width="400" height="522" rx="36" fill="#C8D4E8" />
      {/* Card background */}
      <Rect x="140" y="20" width="400" height="522" rx="36" fill="#FFFFFF" />

      <G clipPath="url(#bvpCardClip)">
        {/* Decorative concentric circles */}
        <Circle cx="506" cy="400" r="115" fill="none" stroke="#E8EEF8" strokeWidth="18" />
        <Circle cx="506" cy="400" r="83"  fill="none" stroke="#DDE5F5" strokeWidth="14" />
        <Circle cx="506" cy="400" r="53"  fill="none" stroke="#D0DBF0" strokeWidth="11" />
        <Circle cx="506" cy="400" r="26"  fill="#DDE5F5" />

        {/* Bar chart columns */}
        <Polygon points="215,295 252,193 215,365" fill="#EEF2FA" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="252,193 252,365 215,365" fill="#F2F5FC" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="252,193 291,129 252,365" fill="#EEF2FA" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="291,129 291,365 252,365" fill="#F2F5FC" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="291,129 335,103 291,365" fill="#EEF2FA" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="335,103 335,365 291,365" fill="#F2F5FC" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="335,103 379,112 335,365" fill="#EEF2FA" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="379,112 379,365 335,365" fill="#F2F5FC" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="379,112 427,156 379,365" fill="#EEF2FA" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="427,156 427,365 379,365" fill="#F2F5FC" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="427,156 465,230 427,365" fill="#EEF2FA" stroke="#D8E2F2" strokeWidth="1" />
        <Polygon points="465,230 465,365 427,365" fill="#F2F5FC" stroke="#D8E2F2" strokeWidth="1" />

        {/* Axes */}
        <Line x1="180" y1="365" x2="498" y2="365" stroke="#003DA5" strokeWidth="1.5" />
        <Line x1="180" y1="78"  x2="180" y2="365" stroke="#003DA5" strokeWidth="1.5" />
        <Polygon points="498,365 490,360 490,370" fill="#003DA5" />
        <Polygon points="180,78 175,86 185,86"    fill="#003DA5" />
        <SvgText x="503" y="370" fontSize="14" fontStyle="italic" fill="#003DA5" fontFamily="Courier New">t</SvgText>
        <SvgText x="179" y="74"  fontSize="14" fontStyle="italic" fill="#003DA5" textAnchor="middle" fontFamily="Courier New">y</SvgText>

        {/* a, b dashed verticals */}
        <Line x1="215" y1="80"  x2="215" y2="365" stroke="#99B3D8" strokeWidth="0.9" strokeDasharray="5,4" />
        <Line x1="465" y1="80"  x2="465" y2="365" stroke="#99B3D8" strokeWidth="0.9" strokeDasharray="5,4" />
        <SvgText x="215" y="379" fontSize="12" fontStyle="italic" fill="#003DA5" textAnchor="middle" fontFamily="Courier New">a</SvgText>
        <SvgText x="465" y="379" fontSize="12" fontStyle="italic" fill="#003DA5" textAnchor="middle" fontFamily="Courier New">b</SvgText>

        {/* Shooting curves (dashed) */}
        <Path d="M 215 295 C 281 202 367 92 465 82"  fill="none" stroke="#99B3D8" strokeWidth="1.3" strokeDasharray="7,5" />
        <Path d="M 215 295 C 287 322 387 356 465 348" fill="none" stroke="#99B3D8" strokeWidth="1.3" strokeDasharray="7,5" />
        <SvgText x="192" y="168" fontSize="11" fill="#6688BB" fontFamily="Courier New">Shooting</SvgText>

        {/* Main BVP curve fill + stroke */}
        <Path d="M 215 295 C 285 50 375 50 465 230 L 465 365 L 215 365 Z" fill="#CC0000" opacity="0.05" />
        <Path d="M 215 295 C 285 50 375 50 465 230" fill="none" stroke="#CC0000" strokeWidth="4.5" strokeLinecap="round" />
        <Path d="M 215 295 C 285 50 375 50 465 230" fill="none" stroke="#FF6666" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />

        {/* Tick marks */}
        <Line x1="252" y1="362" x2="252" y2="368" stroke="#003DA5" strokeWidth="1.2" />
        <Line x1="291" y1="362" x2="291" y2="368" stroke="#003DA5" strokeWidth="1.2" />
        <Line x1="335" y1="362" x2="335" y2="368" stroke="#003DA5" strokeWidth="1.2" />
        <Line x1="379" y1="362" x2="379" y2="368" stroke="#003DA5" strokeWidth="1.2" />
        <Line x1="427" y1="362" x2="427" y2="368" stroke="#003DA5" strokeWidth="1.2" />

        {/* Method labels */}
        <SvgText x="456" y="180" fontSize="11" fill="#6688BB" textAnchor="end" fontFamily="Courier New">FDM</SvgText>
        <SvgText x="192" y="347" fontSize="11" fill="#6688BB" fontFamily="Courier New">FEM</SvgText>

        {/* FDM hollow dots on curve */}
        <Circle cx="252" cy="193" r="4.5" fill="#FFFFFF" stroke="#003DA5" strokeWidth="1.9" />
        <Circle cx="291" cy="129" r="4.5" fill="#FFFFFF" stroke="#003DA5" strokeWidth="1.9" />
        <Circle cx="335" cy="103" r="4.5" fill="#FFFFFF" stroke="#003DA5" strokeWidth="1.9" />
        <Circle cx="379" cy="112" r="4.5" fill="#FFFFFF" stroke="#003DA5" strokeWidth="1.9" />
        <Circle cx="427" cy="156" r="4.5" fill="#FFFFFF" stroke="#003DA5" strokeWidth="1.9" />

        {/* Boundary points α, β */}
        <Circle cx="215" cy="295" r="10"  fill="#CC0000" />
        <Circle cx="215" cy="295" r="5.5" fill="#FFFFFF" />
        <Circle cx="465" cy="230" r="10"  fill="#CC0000" />
        <Circle cx="465" cy="230" r="5.5" fill="#FFFFFF" />
        <SvgText x="202" y="291" fontFamily="serif" fontSize="17" fontStyle="italic" fill="#CC0000" textAnchor="end">α</SvgText>
        <SvgText x="478" y="226" fontFamily="serif" fontSize="17" fontStyle="italic" fill="#CC0000">β</SvgText>

        {/* BVP equation */}
        <SvgText x="340" y="95" fontSize="11" fill="#6688BB" textAnchor="middle" fontFamily="Courier New">
          {"y'' + p(t)·y' + q(t)·y = r(t)"}
        </SvgText>

        {/* h bracket */}
        <Line x1="252" y1="378" x2="291" y2="378" stroke="#99B3D8" strokeWidth="0.9" />
        <Line x1="252" y1="375" x2="252" y2="381" stroke="#99B3D8" strokeWidth="0.9" />
        <Line x1="291" y1="375" x2="291" y2="381" stroke="#99B3D8" strokeWidth="0.9" />
        <SvgText x="271" y="390" fontSize="11" fontStyle="italic" fill="#6688BB" textAnchor="middle" fontFamily="Courier New">h</SvgText>

        {/* Divider bars */}
        <Rect x="155" y="403" width="370" height="3.5" rx="1.5" fill="#CC0000" />
        <Rect x="155" y="409" width="370" height="2"   rx="1"   fill="#003DA5" />

        {/* Main title — two separate texts to avoid TSpan overlap bug in react-native-svg */}
        <SvgText x="216" y="456" fontFamily="Courier New" fontSize="46" fontWeight="700" fill="#003DA5">BVP</SvgText>
        <SvgText x="299" y="456" fontFamily="Courier New" fontSize="46" fontWeight="700" fill="#CC0000">Solver</SvgText>

        {/* Separator line */}
        <Line x1="182" y1="467" x2="498" y2="467" stroke="#D0D8E8" strokeWidth="1" />

        {/* Subtitles */}
        <SvgText x="340" y="487" fontSize="12" fill="#6688BB" textAnchor="middle" letterSpacing="2" fontFamily="Courier New">
          Boundary Value Problems
        </SvgText>
        <SvgText x="340" y="510" fontSize="11" fill="#CC0000" textAnchor="middle" letterSpacing="1" fontFamily="Courier New">
          TON DUC THANG UNIVERSITY
        </SvgText>
      </G>

      {/* Card border on top */}
      <Rect x="140" y="20" width="400" height="522" rx="36" fill="none" stroke="#003DA5" strokeWidth="2" />
    </Svg>
  );
}
