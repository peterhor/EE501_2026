// insolation-scene.jsx — Daily insolation explainer (Goosse et al. §2.1.3.3, eqs 2.21–2.26)
// Depends on globals set by animations.jsx (Stage, Sprite, useTime, Easing, clamp).

const INK = '#2b2620';
const MUTED = '#8a8172';
const LINE = '#c9c0ae';
const PAPER = '#faf7f0';
const CARD = '#ffffff';
const CARD_BORDER = '#e4ddd0';
const AMBER = '#c8873a';   // sun / declination accent
const BLUE = '#3d6e94';    // insolation data accent
const IR_RED = '#a5493f';  // longwave (F_IR↓ / F_IR↑) accent, surface energy budget panel
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const S0 = 1361; // solar constant, W/m^2 (present day)
const D2R = Math.PI / 180;

function polar(cx, cy, r, angleDeg) {
  const a = angleDeg * D2R;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const sweep = a1 > a0 ? 0 : 1;
  return `M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`;
}

// eq 2.23 — raw approximation of declination (deg), zero order in eccentricity
function declinationDeg(nday) {
  return 23.45 * Math.sin(((360 * (nday - 80)) / 365) * D2R);
}

// eq 2.24 — sunset hour angle (radians), with polar day/night clamping
function haSunsetRad(phiDeg, deltaDeg) {
  const x = -Math.tan(phiDeg * D2R) * Math.tan(deltaDeg * D2R);
  if (x <= -1) return Math.PI;   // polar day: sun never sets
  if (x >= 1) return 0;          // polar night: sun never rises
  return Math.acos(x);
}

// eq 2.21 — cosine of solar zenith distance at a given hour angle (deg)
function cosThetaS(phiDeg, deltaDeg, haDeg) {
  const phi = phiDeg * D2R, delta = deltaDeg * D2R, ha = haDeg * D2R;
  return Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(ha);
}

// eq 2.14 — orbital eccentricity (present day)
const ECC = 0.0167;
const PERH = 102.04; // eq 2.19 — longitude of perihelion from autumn equinox
const PERIHELION_DAY = 4; // Earth passes perihelion ~Jan 4

// Solve Kepler's equation (M = E - ecc sinE) for eccentric anomaly, then true anomaly v (radians, 0 at perihelion)
function trueAnomaly(nday) {
  const M = (2 * Math.PI * (nday - PERIHELION_DAY)) / 365.25;
  let E = M;
  for (let i = 0; i < 6; i++) E = E - (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));
  return 2 * Math.atan2(Math.sqrt(1 + ECC) * Math.sin(E / 2), Math.sqrt(1 - ECC) * Math.cos(E / 2));
}
// eq 2.15 — distance from Sun (in units of semi-major axis a), given true anomaly v and an eccentricity to use for the radius
function rOfV(vRad, eccUsed) {
  return (1 - eccUsed * eccUsed) / (1 + eccUsed * Math.cos(vRad));
}
// eq 2.19 — true longitude from true anomaly
function trueLongitudeDeg(vRad) {
  return ((vRad * 180 / Math.PI) + PERH + 180 + 360) % 360;
}

function seasonLabel(nday) {
  if (nday >= 80 && nday < 172) return 'Spring (N. Hemisphere)';
  if (nday >= 172 && nday < 266) return 'Summer (N. Hemisphere)';
  if (nday >= 266 && nday < 355) return 'Autumn (N. Hemisphere)';
  return 'Winter (N. Hemisphere)';
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: 1, background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 6,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 30, color: accent || INK, fontWeight: 600 }}>{value}</div>
      {sub ? <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{sub}</div> : null}
    </div>
  );
}

// Compact card for the dense control strips inside a panel (same information as StatCard,
// but sized so five of them fit above the main figure without stealing its height).
function MiniStat({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0, background: '#fbfaf7', border: `1px solid ${CARD_BORDER}`, borderRadius: 6,
      padding: '7px 11px', display: 'flex', flexDirection: 'column', gap: 1,
    }}>
      <div style={{ fontFamily: SANS, fontSize: 10.5, color: MUTED, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: 20, lineHeight: 1.15, color: accent || INK, fontWeight: 600 }}>{value}</div>
      {sub ? <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div> : null}
    </div>
  );
}

// Every figure sits in one of these so it carries a stable, visible name — "1 · Surface Energy
// Budget", "2 · Daily Insolation (TOA)" — which makes the layout easy to talk about in class.
function PanelFrame({ name, tag, style, bodyStyle, children }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0,
      background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        flex: '0 0 auto', padding: '7px 14px', display: 'flex', alignItems: 'baseline', gap: 10,
        fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: MUTED, background: '#faf8f4', borderBottom: `1px solid ${CARD_BORDER}`,
      }}>
        <span>{name}</span>
        {tag ? <span style={{ fontWeight: 600, letterSpacing: '0.02em', textTransform: 'none', fontSize: 11.5, color: LINE }}>{tag}</span> : null}
      </div>
      <div style={{ flex: '1 1 0', minHeight: 0, minWidth: 0, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function calendarDate(nday) {
  let d = clamp(Math.round(nday), 1, 365), m = 0;
  while (d > MONTH_LENGTHS[m]) { d -= MONTH_LENGTHS[m]; m++; }
  return { month: MONTH_NAMES[m], monthShort: MONTH_NAMES[m].slice(0, 3), dayOfMonth: d };
}

function LatButton({ label, deg, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: '12px 8px', fontFamily: SANS, fontSize: 15, fontWeight: 600,
        color: active ? '#fff' : INK,
        background: active ? BLUE : CARD,
        border: `1px solid ${active ? BLUE : CARD_BORDER}`,
        borderRadius: 6, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function OrbitPanel({ nday, exaggerateOrbit }) {
  const W = 620, H = 470;
  const cx = W / 2, cy = H / 2 + 10;
  const aPx = 175; // pixels per semi-major axis (Sun-fixed view)
  const eccUsed = exaggerateOrbit ? 0.6 : ECC; // fixed, strongly elliptical shape — display only, not physically to scale

  const v = trueAnomaly(nday);
  const lambdaT = trueLongitudeDeg(v);

  // orbit path: sample true anomaly 0..2pi, radius uses eccUsed (perihelion fixed along +x from Sun)
  const pathPts = [];
  for (let deg = 0; deg <= 360; deg += 4) {
    const vv = (deg * Math.PI) / 180;
    const r = rOfV(vv, eccUsed) * aPx;
    pathPts.push([cx + r * Math.cos(vv), cy - r * Math.sin(vv)]);
  }
  const orbitPath = 'M ' + pathPts.map((p) => p.join(' ')).join(' L ') + ' Z';

  const rNow = rOfV(v, eccUsed) * aPx;
  const earthX = cx + rNow * Math.cos(v), earthY = cy - rNow * Math.sin(v);
  const rNowReal = rOfV(v, ECC); // real r/a, for the numeric readout (unaffected by exaggeration)

  // reference points: perihelion/aphelion + equinoxes/solstices, via eq 2.19 (v = lambdaT - PERH - 180)
  const markers = [
    { lambdaT: null, vDeg: 0, label: 'perihelion', kind: 'apsis' },
    { lambdaT: null, vDeg: 180, label: 'aphelion', kind: 'apsis' },
    { lambdaT: 0, label: 'vernal equinox', kind: 'season' },
    { lambdaT: 90, label: 'summer solstice (N)', kind: 'season' },
    { lambdaT: 180, label: 'autumn equinox', kind: 'season' },
    { lambdaT: 270, label: 'winter solstice (N)', kind: 'season' },
  ].map((m) => {
    const vDeg = m.vDeg != null ? m.vDeg : ((m.lambdaT - PERH - 180 + 720) % 360);
    const vv = (vDeg * Math.PI) / 180;
    const r = rOfV(vv, eccUsed) * aPx;
    return { ...m, x: cx + r * Math.cos(vv), y: cy - r * Math.sin(vv) };
  });

  // Earth's rotation axis keeps a FIXED direction in space as it orbits — drawn at the same
  // screen angle regardless of orbital position, to show axial parallelism (the real cause of the seasons).
  const axisAngle = -66.5; // degrees, arbitrary fixed absolute direction
  const axisLen = 26;
  const [ax1, ay1] = polar(earthX, earthY, axisLen, axisAngle);
  const [ax2, ay2] = polar(earthX, earthY, axisLen, axisAngle + 180);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <text x={16} y={26} fontFamily={SANS} fontSize={14} fill={MUTED}>Earth orbits the fixed Sun — heliocentric view (eqs. 2.14–2.19)</text>

      {/* orbit path */}
      <path d={orbitPath} fill="none" stroke={LINE} strokeWidth={1.5} />

      {/* season/apsis markers */}
      {markers.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r={3.5} fill={m.kind === 'apsis' ? MUTED : '#7a6a3f'} />
          <text x={m.x} y={m.y - 10} textAnchor="middle" fontFamily={SANS} fontSize={11} fill={MUTED}>{m.label}</text>
        </g>
      ))}

      {/* Sun — fixed at focus, does not move */}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={AMBER} strokeWidth={2.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const [x1, y1] = polar(cx, cy, 23, a);
        const [x2, y2] = polar(cx, cy, 31, a);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AMBER} strokeWidth={2} />;
      })}
      <text x={cx} y={cy + 46} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={700} fill={AMBER}>SUN (fixed)</text>

      {/* Sun–Earth line */}
      <line x1={cx} y1={cy} x2={earthX} y2={earthY} stroke={BLUE} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />

      {/* Earth marker, orbiting */}
      <circle cx={earthX} cy={earthY} r={9} fill={BLUE} />
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke={INK} strokeWidth={2} />
      <circle cx={ax1} cy={ay1} r={2.5} fill={INK} />
      <text x={earthX + 14} y={earthY - 12} fontFamily={SANS} fontSize={13} fontWeight={700} fill={BLUE}>Earth</text>

      <text x={16} y={H - 14} fontFamily={SANS} fontSize={12} fill={MUTED}>
        {exaggerateOrbit ? 'Orbit shape exaggerated for visibility — ' : ''}r/rₘ = {rNowReal.toFixed(4)} · λt = {lambdaT.toFixed(0)}° · ecc = {ECC}
      </text>
    </svg>
  );
}

function DiagramPanel({ phiDeg, deltaDeg }) {
  const cx = 370, cy = 300, R = 190;
  const noonZenith = phiDeg - deltaDeg; // signed zenith angle at local solar noon
  const sunUpAtNoon = Math.abs(noonZenith) < 90;

  const [px, py] = polar(cx, cy, R, phiDeg);
  // local horizon tangent through P (perpendicular to OP)
  const tanLen = 130;
  const tx = px + tanLen * Math.cos((phiDeg + 90) * D2R);
  const ty = py - tanLen * Math.sin((phiDeg + 90) * D2R);
  const tx2 = px - tanLen * Math.cos((phiDeg + 90) * D2R);
  const ty2 = py + tanLen * Math.sin((phiDeg + 90) * D2R);
  // local normal (zenith direction), extended outward
  const [nx, ny] = polar(px - cx + cx, py - cy + cy, 1, 0); // unused placeholder
  const normLen = 70;
  const [zx, zy] = [px + normLen * Math.cos(phiDeg * D2R), py - normLen * Math.sin(phiDeg * D2R)];

  // sun ray direction (toward Earth), angle delta above/below equatorial plane, from the right
  const rayDX = -Math.cos(deltaDeg * D2R), rayDY = Math.sin(deltaDeg * D2R);
  const rayLines = [-90, -40, 0, 40, 90].map((offset) => {
    // offset perpendicular to ray direction, in px, to create parallel rays
    const perpX = -rayDY, perpY = rayDX;
    const startX = cx - rayDX * 320 + perpX * offset;
    const startY = cy - rayDY * 320 + perpY * offset;
    const endX = cx - rayDX * (R + 4) + perpX * offset;
    const endY = cy - rayDY * (R + 4) + perpY * offset;
    return { startX, startY, endX, endY };
  });
  const sunCx = cx - rayDX * 350, sunCy = cy - rayDY * 350;

  // night side: exact 180° arc from the terminator, using SVG arc commands (not a stepped polyline)
  // so the boundary is always precisely at deltaDeg+90 .. deltaDeg+270, with no seam.
  const nightPath = arcPath(cx, cy, R, deltaDeg + 90, deltaDeg + 270) + ` L ${cx} ${cy} Z`;
  const [nightLabelX, nightLabelY] = polar(cx, cy, R * 0.55, deltaDeg + 180);
  const [dayLabelX, dayLabelY] = polar(cx, cy, R * 0.55, deltaDeg);

  return (
    <svg viewBox="0 0 740 600" width="100%" height="100%">
      {/* sun rays */}
      {rayLines.map((r, i) => (
        <line key={i} x1={r.startX} y1={r.startY} x2={r.endX} y2={r.endY} stroke={AMBER} strokeWidth={1.5} opacity={0.55} />
      ))}
      {/* sun glyph */}
      <circle cx={sunCx} cy={sunCy} r={22} fill="none" stroke={AMBER} strokeWidth={2.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const [x1, y1] = polar(sunCx, sunCy, 26, a);
        const [x2, y2] = polar(sunCx, sunCy, 34, a);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AMBER} strokeWidth={2} />;
      })}
      <text x={sunCx} y={sunCy + 50} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={AMBER} fontWeight={700}>SUN</text>

      {/* declination reference line through center, parallel to rays */}
      <line
        x1={cx - Math.cos(deltaDeg * D2R) * 230} y1={cy + Math.sin(deltaDeg * D2R) * 230}
        x2={cx + Math.cos(deltaDeg * D2R) * 230} y2={cy - Math.sin(deltaDeg * D2R) * 230}
        stroke={AMBER} strokeWidth={1.5} strokeDasharray="5 4"
      />

      {/* Earth circle */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={2} />
      {/* night-side shading — no direct radiation reaches this half */}
      <clipPath id="earthClip"><circle cx={cx} cy={cy} r={R} /></clipPath>
      <path d={nightPath} fill="#2b3140" opacity={0.55} clipPath="url(#earthClip)" />
      <text x={nightLabelX} y={nightLabelY} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={700} fill="#e8e6df">night</text>
      <text x={dayLabelX} y={dayLabelY} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={700} fill={INK}>day</text>
      {/* equator */}
      <line x1={cx - R - 30} y1={cy} x2={cx + R + 30} y2={cy} stroke={LINE} strokeWidth={1.5} />
      <text x={cx + R + 36} y={cy + 5} fontFamily={SANS} fontSize={13} fill={MUTED}>equator</text>
      {/* axis */}
      <line x1={cx} y1={cy - R - 40} x2={cx} y2={cy + R + 40} stroke={LINE} strokeWidth={1.5} />
      <text x={cx + 8} y={cy - R - 44} fontFamily={SANS} fontSize={13} fill={MUTED}>axis</text>

      {/* radius to observer P */}
      <line x1={cx} y1={cy} x2={px} y2={py} stroke={INK} strokeWidth={1.5} />
      {/* horizon tangent at P */}
      <line x1={tx} y1={ty} x2={tx2} y2={ty2} stroke={BLUE} strokeWidth={1.5} />
      {/* zenith normal at P */}
      <line x1={px} y1={py} x2={zx} y2={zy} stroke={BLUE} strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={px} cy={py} r={5} fill={BLUE} />
      <text x={px + (phiDeg >= 0 ? 10 : 10)} y={py - 10} fontFamily={SANS} fontSize={13} fontWeight={700} fill={BLUE}>observer</text>

      {/* angle phi at O between equator and OP */}
      <path d={arcPath(cx, cy, 46, 0, phiDeg)} fill="none" stroke={INK} strokeWidth={1.3} />
      <text x={cx + 58} y={cy - 16} fontFamily={SERIF} fontSize={17} fontStyle="italic" fill={INK}>φ</text>

      {/* angle delta at O between equator-line and sun-direction line */}
      <path d={arcPath(cx, cy, 74, 0, deltaDeg)} fill="none" stroke={AMBER} strokeWidth={1.3} />
      <text x={cx + 86} y={cy - (deltaDeg >= 0 ? 38 : -30)} fontFamily={SERIF} fontSize={17} fontStyle="italic" fill={AMBER}>δ</text>

      {sunUpAtNoon && (
        <>
          <path d={arcPath(px, py, 34, phiDeg, phiDeg + noonZenith)} fill="none" stroke="#7a6a3f" strokeWidth={1.3} />
          <text x={px - 60} y={py + (noonZenith >= 0 ? -46 : 46)} fontFamily={SERIF} fontSize={16} fontStyle="italic" fill="#7a6a3f">θs (noon)</text>
        </>
      )}

      <text x={20} y={30} fontFamily={SANS} fontSize={14} fill={MUTED}>Earth-centred close-up (local solar noon) — derived from the orbit at left</text>
    </svg>
  );
}

function CurvePanel({ phiDeg, deltaDeg, hourOfDay, showEquations = true }) {
  const cap = typeof document !== 'undefined' && document.documentElement.hasAttribute('data-capture');
  const F = { head: cap ? 23 : 14, sub: cap ? 20 : 12, tick: cap ? 20 : 12, axis: cap ? 22 : 13, series: cap ? 22 : 13, read: cap ? 23 : 13 };
  const W = 940, H = 620;
  const ML = 74, MR = 24, MT = 66, MB = 96;
  const plotW = W - ML - MR, plotH = H - MT - MB;
  const xOf = (haDeg) => ML + ((haDeg + 180) / 360) * plotW;
  const yOf = (sh) => MT + (1 - clamp(sh, 0, S0) / S0) * plotH;

  const pts = [];
  for (let ha = -180; ha <= 180; ha += 3) {
    const sh = Math.max(0, S0 * cosThetaS(phiDeg, deltaDeg, ha));
    pts.push([xOf(ha), yOf(sh)]);
  }
  const linePath = 'M ' + pts.map((p) => p.join(' ')).join(' L ');
  const areaPath = linePath + ` L ${xOf(180)} ${yOf(0)} L ${xOf(-180)} ${yOf(0)} Z`;

  const haSS_rad = haSunsetRad(phiDeg, deltaDeg);
  const haSSdeg = haSS_rad * 180 / Math.PI;
  const haSRdeg = -haSSdeg;
  const lod = (24 / Math.PI) * haSS_rad;
  const { mean } = meanInsolationWm2(phiDeg, deltaDeg);

  const polarDay = haSSdeg >= 179.9;
  const polarNight = haSSdeg <= 0.1;
  const shortDay = !polarDay && !polarNight && (xOf(haSSdeg) - xOf(haSRdeg)) < 90;

  // moving "current time of day" marker — continuous loop, decoupled from NDAY scrubber
  const haNow = (hourOfDay - 12) * 15;
  const shNow = Math.max(0, S0 * cosThetaS(phiDeg, deltaDeg, haNow));
  const dotX = xOf(haNow), dotY = yOf(shNow);
  const dotLabelBelow = dotY < MT + 26;

  // keep the mean-line label from crowding the top margin when insolation is high
  const meanLabelY = clamp(yOf(mean) - 8, MT + 14, H - MB - 10);

  const ticks = [
    [-180, '00:00'], [-90, '06:00'], [0, '12:00'], [90, '18:00'], [180, '24:00'],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {/* static caption band — reserved above the plot, never overlapped by data */}
      <text x={16} y={18} fontFamily={SANS} fontSize={14} fill={MUTED}>{showEquations ? 'Sh = S₀ cos θs — instantaneous insolation over the day' : 'Instantaneous insolation over the day'}</text>
      {showEquations && (
        <text x={16} y={38} fontFamily={SANS} fontSize={12} fill={MUTED}>eqs. 2.20–2.21 (curve) · 2.24 (sunrise/sunset) · 2.25 (day length) · 2.26 (mean)</text>
      )}

      {/* axes grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={ML} x2={W - MR} y1={MT + f * plotH} y2={MT + f * plotH} stroke={LINE} strokeWidth={1} opacity={0.6} />
      ))}
      <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke={INK} strokeWidth={1.5} />
      <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke={INK} strokeWidth={1.5} />

      {/* y labels */}
      {[0, 0.5, 1].map((f) => (
        <text key={f} x={ML - 12} y={MT + (1 - f) * plotH + 5} textAnchor="end" fontFamily={MONO} fontSize={14} fill={MUTED}>
          {Math.round(f * S0)}
        </text>
      ))}
      <text x={22} y={MT + plotH / 2} transform={`rotate(-90 22 ${MT + plotH / 2})`} textAnchor="middle" fontFamily={SANS} fontSize={14} fill={MUTED}>
        Sh  (W/m²)
      </text>

      {/* x ticks */}
      {ticks.map(([ha, lbl]) => (
        <g key={ha}>
          <line x1={xOf(ha)} x2={xOf(ha)} y1={H - MB} y2={H - MB + 6} stroke={INK} strokeWidth={1.5} />
          <text x={xOf(ha)} y={H - MB + (cap ? 34 : 24)} textAnchor="middle" fontFamily={MONO} fontSize={F.tick} fill={MUTED}>{lbl}</text>
        </g>
      ))}
      <text x={W / 2} y={H - (cap ? 14 : 16)} textAnchor="middle" fontFamily={SANS} fontSize={F.axis} fill={MUTED}>local solar time</text>

      {/* area + curve */}
      <path d={areaPath} fill={BLUE} opacity={0.12} />
      <path d={linePath} fill="none" stroke={BLUE} strokeWidth={3} />

      {/* mean line */}
      {mean > 1 && (
        <>
          <line x1={ML} x2={W - MR} y1={yOf(mean)} y2={yOf(mean)} stroke={INK} strokeDasharray="6 5" strokeWidth={1.5} />
          <text x={W - MR - 6} y={meanLabelY} textAnchor="end" fontFamily={SANS} fontSize={14} fill={INK}>
            mean S̄h = {mean.toFixed(0)} W/m²
          </text>
        </>
      )}

      {/* sunrise / sunset markers */}
      {!polarDay && !polarNight && (
        <>
          <line x1={xOf(haSRdeg)} x2={xOf(haSRdeg)} y1={MT} y2={H - MB} stroke={AMBER} strokeDasharray="4 4" strokeWidth={1.5} />
          <line x1={xOf(haSSdeg)} x2={xOf(haSSdeg)} y1={MT} y2={H - MB} stroke={AMBER} strokeDasharray="4 4" strokeWidth={1.5} />
          {shortDay ? (
            <text x={(xOf(haSRdeg) + xOf(haSSdeg)) / 2} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={AMBER}>
              sunrise/sunset
            </text>
          ) : (
            <>
              <text x={xOf(haSRdeg)} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={AMBER}>sunrise</text>
              <text x={xOf(haSSdeg)} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={AMBER}>sunset</text>
            </>
          )}
          {/* LOD bracket */}
          <line x1={xOf(haSRdeg)} x2={xOf(haSSdeg)} y1={H - MB + 44} y2={H - MB + 44} stroke={INK} strokeWidth={1.3} />
          <line x1={xOf(haSRdeg)} x2={xOf(haSRdeg)} y1={H - MB + 40} y2={H - MB + 48} stroke={INK} strokeWidth={1.3} />
          <line x1={xOf(haSSdeg)} x2={xOf(haSSdeg)} y1={H - MB + 40} y2={H - MB + 48} stroke={INK} strokeWidth={1.3} />
          <text x={(xOf(haSRdeg) + xOf(haSSdeg)) / 2} y={H - MB + 60} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={INK}>
            LOD = {lod.toFixed(1)} h
          </text>
        </>
      )}
      {polarDay && (
        <text x={W / 2} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={15} fontWeight={700} fill={AMBER}>midnight sun — LOD = 24 h</text>
      )}
      {polarNight && (
        <text x={W / 2} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={15} fontWeight={700} fill={MUTED}>polar night — LOD = 0 h</text>
      )}

      {/* moving current-instant dot */}
      <line x1={dotX} y1={dotY} x2={dotX} y2={H - MB} stroke={BLUE} strokeWidth={1} opacity={0.4} />
      <circle cx={dotX} cy={dotY} r={7} fill={BLUE} stroke="#fff" strokeWidth={2} />
      <text x={dotX} y={dotLabelBelow ? dotY + 24 : dotY - 14} textAnchor="middle" fontFamily={MONO} fontSize={13} fontWeight={700} fill={BLUE}>
        Sh = {shNow.toFixed(0)}
      </text>
    </svg>
  );
}


// --- Surface Energy Budget (Oke 1987 Fig. 2.20 style) --------------------------------------
// Connects this scene's solar-geometry engine (same F_solar driving the TOA insolation curve
// above) to the case studies in the "Local Energy Balance" lecture: each preset below supplies
// an albedo, an atmospheric-emission baseline, and a simplified diurnal surface-temperature
// response (mean + amplitude + phase lag) so students can see how the SAME incoming energy
// partitions completely differently depending on surface type. Simplifications, stated plainly:
// a fixed atmospheric transmissivity (0.75) converts TOA insolation to a clear-sky surface value,
// and the surface-temperature response is a lagged cosine rather than a full thermal model — this
// is illustrative of the mechanism (Stefan-Boltzmann + albedo + solar geometry are all real), not
// a substitute for the measured Oke case-study numbers used elsewhere in the lecture.
const TRANSMISSIVITY = 0.75;
const STEFAN_BOLTZMANN = 5.670374419e-8;

const SCENARIOS = {
  desert: { label: 'Desert (dry soil)', section: '03 · Soil moisture', albedo: 0.35, emissivity: 0.92, irDownBase: 265, irDownDayBump: 15, tMean: 24, tAmplitude: 20, lagHr: 1, accent: AMBER,
    note: 'High albedo + very low heat capacity: modest F_NR, but a huge diurnal swing in F_IR\u2191.' },
  oasis: { label: 'Moist soil / oasis', section: '03\u201304 · Soil moisture & oasis', albedo: 0.16, emissivity: 0.96, irDownBase: 310, irDownDayBump: 20, tMean: 20, tAmplitude: 8, lagHr: 1.5, accent: BLUE,
    note: 'Evaporative cooling caps the daytime peak \u2014 energy goes into F_LH, not surface heating.' },
  snow: { label: 'Snow & ice', section: '05 · Snow & ice', albedo: 0.80, emissivity: 0.99, irDownBase: 210, irDownDayBump: 8, tMean: -8, tAmplitude: 4, lagHr: 1, accent: '#6f8fae',
    note: 'Albedo reflects most F_solar away \u2014 F_NR stays small (even negative) despite full daylight.' },
  crop: { label: 'Grass / crop', section: '06 · Vegetation & forests', albedo: 0.24, emissivity: 0.96, irDownBase: 300, irDownDayBump: 18, tMean: 18, tAmplitude: 7, lagHr: 1.5, accent: '#5a8a4a',
    note: 'Transpiration keeps the canopy cool \u2014 F_LH dominates the energy balance (not shown here).' },
  forest: { label: 'Coniferous forest', section: '06 · Vegetation & forests', albedo: 0.10, emissivity: 0.97, irDownBase: 300, irDownDayBump: 14, tMean: 16, tAmplitude: 5, lagHr: 2, accent: '#2f5f3f',
    note: 'Very low albedo (needle geometry traps light) \u2014 absorbed energy is re-emitted gradually.' },
  urban: { label: 'Urban (pavement)', section: '07 · Urban surfaces', albedo: 0.12, emissivity: 0.95, irDownBase: 290, irDownDayBump: 12, tMean: 22, tAmplitude: 14, lagHr: 4, accent: '#8a5a3f',
    note: 'Low albedo + high heat storage: F_IR\u2191 stays elevated well after sunset \u2014 the heat-island lag.' },
};

function surfaceBudgetAt(phiDeg, deltaDeg, haDeg, sc) {
  const cosZ = Math.max(0, cosThetaS(phiDeg, deltaDeg, haDeg));
  const fSolar = TRANSMISSIVITY * S0 * cosZ;
  const reflected = -sc.albedo * fSolar;
  const irDown = sc.irDownBase + sc.irDownDayBump * cosZ;
  const lagDeg = sc.lagHr * 15;
  const shape = Math.cos((haDeg - lagDeg) * D2R);
  const tSurf = sc.tMean + sc.tAmplitude * shape;
  const irUp = -sc.emissivity * STEFAN_BOLTZMANN * Math.pow(tSurf + 273.15, 4);
  const fNR = fSolar + reflected + irDown + irUp;
  return { fSolar, reflected, irDown, irUp, fNR, tSurf };
}

const BUDGET_SERIES = [
  { key: 'fSolar', text: 'F_solar', color: AMBER, dash: null, width: 2.6, sign: '+' },
  { key: 'reflected', text: 'αF_solar', color: AMBER, dash: '6 4', width: 2, sign: '−' },
  { key: 'irDown', text: 'F_IR↓', color: IR_RED, dash: null, width: 2.6, sign: '+' },
  { key: 'irUp', text: 'F_IR↑', color: IR_RED, dash: '6 4', width: 2, sign: '−' },
  { key: 'fNR', text: 'F_NR', color: INK, dash: null, width: 3.4, sign: '=' },
];

function surfaceBudgetDailyMean(phiDeg, deltaDeg, sc) {
  const N = 240;
  const acc = { fSolar: 0, reflected: 0, irDown: 0, irUp: 0, fNR: 0, tSurf: 0 };
  for (let i = 0; i < N; i++) {
    const b = surfaceBudgetAt(phiDeg, deltaDeg, -180 + (360 * i) / N, sc);
    for (const k in acc) acc[k] += b[k];
  }
  for (const k in acc) acc[k] /= N;
  return acc;
}

function niceStep(raw) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-6))));
  const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function budgetYRange(phiDeg, sc) {
  let lo = 0, hi = 0;
  for (const dec of [-23.45, -16, -8, 0, 8, 16, 23.45]) {
    for (let ha = -180; ha <= 180; ha += 5) {
      const b = surfaceBudgetAt(phiDeg, dec, ha, sc);
      for (const s of BUDGET_SERIES) {
        const v = b[s.key];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
  }
  const pad = Math.max(30, (hi - lo) * 0.06);
  const step = niceStep((hi - lo + 2 * pad) / 8);
  lo = Math.floor((lo - pad) / step) * step;
  hi = Math.ceil((hi + pad) / step) * step;
  const ticks = [];
  for (let v = lo; v <= hi + step * 0.5; v += step) ticks.push(Math.round(v));
  return { yMin: lo, yMax: hi, ticks };
}

function ScenarioButton({ label, active, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 0', minWidth: 0, padding: '9px 6px', fontFamily: SANS, fontSize: 13, fontWeight: 600,
        color: active ? '#fff' : INK,
        background: active ? accent : CARD,
        border: `1px solid ${active ? accent : CARD_BORDER}`,
        borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
    >
      {label}
    </button>
  );
}

function EnergyBudgetPanel({ phiDeg, deltaDeg, hourOfDay, scenarioKey }) {
  const sc = SCENARIOS[scenarioKey] || SCENARIOS.desert;
  const cap = typeof document !== 'undefined' && document.documentElement.hasAttribute('data-capture');
  const F = { tick: cap ? 19 : 13, axis: cap ? 21 : 14, series: cap ? 22 : 15, read: cap ? 23 : 14, note: cap ? 19 : 12.5 };
  const W = 1160, H = 610;
  const ML = cap ? 116 : 96, MR = cap ? 72 : 52, MT = 30, MB = cap ? 82 : 66;
  const plotW = W - ML - MR, plotH = H - MT - MB;

  const { yMin, yMax, ticks: yTicks } = React.useMemo(() => budgetYRange(phiDeg, sc), [phiDeg, scenarioKey]);
  const xOf = (haDeg) => ML + ((haDeg + 180) / 360) * plotW;
  const yOf = (v) => MT + (1 - (clamp(v, yMin, yMax) - yMin) / (yMax - yMin)) * plotH;
  const zeroY = yOf(0);
  const plotBottom = H - MB;

  const series = [];
  for (let ha = -180; ha <= 180; ha += 2) series.push({ ha, ...surfaceBudgetAt(phiDeg, deltaDeg, ha, sc) });
  const lineOf = (key) => 'M ' + series.map((p) => `${xOf(p.ha)} ${yOf(p[key])}`).join(' L ');
  const fnrArea = `M ${xOf(-180)} ${zeroY} L ` + series.map((p) => `${xOf(p.ha)} ${yOf(p.fNR)}`).join(' L ') + ` L ${xOf(180)} ${zeroY} Z`;

  const haNow = (hourOfDay - 12) * 15;
  const now = surfaceBudgetAt(phiDeg, deltaDeg, haNow, sc);
  const dotX = xOf(haNow);

  const haSS = (haSunsetRad(phiDeg, deltaDeg) * 180) / Math.PI;
  const polarDay = haSS >= 179.9, polarNight = haSS <= 0.1;
  const xTicks = [[-180, '00:00'], [-135, '03:00'], [-90, '06:00'], [-45, '09:00'], [0, '12:00'], [45, '15:00'], [90, '18:00'], [135, '21:00'], [180, '24:00']];

  const labelSpecs = [
    { key: 'fSolar', ha: -62, dy: -15, text: 'F_solar', color: AMBER, anchor: 'middle' },
    { key: 'reflected', ha: -62, dy: 22, text: 'αF_solar', color: AMBER, anchor: 'middle' },
    { key: 'irDown', ha: -156, dy: -14, text: 'F_IR↓', color: IR_RED, anchor: 'start' },
    { key: 'irUp', ha: 112, dy: 24, text: 'F_IR↑', color: IR_RED, anchor: 'middle' },
    { key: 'fNR', ha: -128, dy: -16, text: 'F_NR', color: INK, anchor: 'middle' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="sebPlot"><rect x={ML} y={MT} width={plotW} height={plotH} /></clipPath>
        <clipPath id="sebGain"><rect x={ML} y={MT} width={plotW} height={Math.max(0, zeroY - MT)} /></clipPath>
        <clipPath id="sebLoss"><rect x={ML} y={zeroY} width={plotW} height={Math.max(0, plotBottom - zeroY)} /></clipPath>
      </defs>

      <g clipPath="url(#sebPlot)">
        {!polarDay && (
          polarNight ? (
            <rect x={ML} y={MT} width={plotW} height={plotH} fill="#2b3140" opacity={0.07} />
          ) : (
            <>
              <rect x={ML} y={MT} width={Math.max(0, xOf(-haSS) - ML)} height={plotH} fill="#2b3140" opacity={0.07} />
              <rect x={xOf(haSS)} y={MT} width={Math.max(0, ML + plotW - xOf(haSS))} height={plotH} fill="#2b3140" opacity={0.07} />
            </>
          )
        )}
      </g>

      {yTicks.map((v) => (
        <line key={v} x1={ML} x2={ML + plotW} y1={yOf(v)} y2={yOf(v)} stroke={v === 0 ? INK : LINE} strokeWidth={v === 0 ? 1.4 : 1} opacity={v === 0 ? 0.75 : 0.5} />
      ))}
      <line x1={ML} y1={MT} x2={ML} y2={plotBottom} stroke={INK} strokeWidth={1.5} />
      <line x1={ML} y1={plotBottom} x2={ML + plotW} y2={plotBottom} stroke={INK} strokeWidth={1.5} />

      {yTicks.map((v) => (
        <text key={v} x={ML - 12} y={yOf(v) + F.tick * 0.36} textAnchor="end" fontFamily={MONO} fontSize={F.tick} fill={MUTED}>{v}</text>
      ))}
      <text x={cap ? 26 : 22} y={MT + plotH / 2} transform={`rotate(-90 ${cap ? 26 : 22} ${MT + plotH / 2})`} textAnchor="middle" fontFamily={SANS} fontSize={F.axis} fill={MUTED}>
        Energy flux density (W/m²)
      </text>

      {xTicks.map(([ha, lbl]) => (
        <g key={ha}>
          <line x1={xOf(ha)} x2={xOf(ha)} y1={plotBottom} y2={plotBottom + 6} stroke={INK} strokeWidth={1.3} />
          <text x={xOf(ha)} y={plotBottom + (cap ? 30 : 22)} textAnchor="middle" fontFamily={MONO} fontSize={F.tick} fill={MUTED}>{lbl}</text>
        </g>
      ))}
      <text x={ML + plotW / 2} y={H - (cap ? 12 : 10)} textAnchor="middle" fontFamily={SANS} fontSize={F.axis} fill={MUTED}>local solar time</text>

      <g clipPath="url(#sebGain)"><path d={fnrArea} fill="#4a7c59" opacity={0.14} /></g>
      <g clipPath="url(#sebLoss)"><path d={fnrArea} fill={BLUE} opacity={0.14} /></g>

      {!polarDay && !polarNight && (
        <g clipPath="url(#sebPlot)">
          <line x1={xOf(-haSS)} x2={xOf(-haSS)} y1={MT} y2={plotBottom} stroke={AMBER} strokeWidth={1.4} strokeDasharray="4 4" opacity={0.85} />
          <line x1={xOf(haSS)} x2={xOf(haSS)} y1={MT} y2={plotBottom} stroke={AMBER} strokeWidth={1.4} strokeDasharray="4 4" opacity={0.85} />
          <text x={xOf(-haSS)} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={F.note} fill={AMBER}>sunrise</text>
          <text x={xOf(haSS)} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={F.note} fill={AMBER}>sunset</text>
        </g>
      )}
      {polarDay && <text x={ML + plotW / 2} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={F.note} fontWeight={700} fill={AMBER}>midnight sun — the Sun never sets</text>}
      {polarNight && <text x={ML + plotW / 2} y={MT + 14} textAnchor="middle" fontFamily={SANS} fontSize={F.note} fontWeight={700} fill={MUTED}>polar night — the Sun never rises</text>}

      <g clipPath="url(#sebPlot)">
        {BUDGET_SERIES.map((s) => (
          <path key={s.key} d={lineOf(s.key)} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash || undefined} strokeLinejoin="round" />
        ))}
      </g>

      {labelSpecs.map((l) => {
        const v = surfaceBudgetAt(phiDeg, deltaDeg, l.ha, sc)[l.key];
        const y = clamp(yOf(v) + l.dy, MT + F.series + 4, plotBottom - 6);
        return (
          <text key={l.text} x={xOf(l.ha)} y={y} textAnchor={l.anchor} fontFamily={SANS} fontSize={F.series} fontWeight={700}
                fill={l.color} stroke={CARD} strokeWidth={cap ? 5 : 3.5} paintOrder="stroke" strokeLinejoin="round">
            {l.text}
          </text>
        );
      })}

      <g clipPath="url(#sebPlot)">
        <line x1={dotX} y1={MT} x2={dotX} y2={plotBottom} stroke={INK} strokeWidth={1} opacity={0.35} />
        {BUDGET_SERIES.map((s) => (
          <circle key={s.key} cx={dotX} cy={yOf(now[s.key])} r={s.key === 'fNR' ? (cap ? 8 : 6) : 3.2} fill={s.color} opacity={s.key === 'fNR' ? 1 : 0.8}
                  stroke={s.key === 'fNR' ? '#fff' : 'none'} strokeWidth={s.key === 'fNR' ? 2 : 0} />
        ))}
      </g>
      <text x={clamp(dotX, ML + 80, ML + plotW - 80)} y={clamp(yOf(now.fNR) - (cap ? 22 : 16), MT + F.read + 4, plotBottom - 8)}
            textAnchor="middle" fontFamily={MONO} fontSize={F.read} fontWeight={700} fill={INK}
            stroke={CARD} strokeWidth={cap ? 5 : 3.5} paintOrder="stroke" strokeLinejoin="round">
        F_NR = {now.fNR.toFixed(0)} W/m²
      </text>
    </svg>
  );
}

function BudgetReadout({ phiDeg, deltaDeg, hourOfDay, scenarioKey }) {
  const sc = SCENARIOS[scenarioKey] || SCENARIOS.desert;
  const haNow = (hourOfDay - 12) * 15;
  const now = surfaceBudgetAt(phiDeg, deltaDeg, haNow, sc);
  const mean = React.useMemo(() => surfaceBudgetDailyMean(phiDeg, deltaDeg, sc), [phiDeg, deltaDeg, scenarioKey]);
  const hh = String(Math.floor(hourOfDay)).padStart(2, '0');
  const mm = String(Math.floor((hourOfDay % 1) * 60)).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, height: '100%', minHeight: 0, overflow: 'auto' }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: INK }}>{sc.label}</div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginTop: -4 }}>lecture section {sc.section}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 10.5, letterSpacing: '0.05em', textTransform: 'uppercase', color: MUTED, marginTop: 6 }}>
        <span>term</span><span>{hh}:{mm} · 24 h mean</span>
      </div>
      <div>
        {BUDGET_SERIES.map((s) => (
          <div key={s.key} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
            borderTop: s.key === 'fNR' ? `1.5px solid ${INK}` : `1px solid ${CARD_BORDER}`,
          }}>
            <span style={{ width: 11, flexShrink: 0, fontFamily: MONO, fontSize: 13, color: MUTED }}>{s.sign}</span>
            <span style={{ width: 22, flexShrink: 0, borderTop: `${s.width}px ${s.dash ? 'dashed' : 'solid'} ${s.color}` }} />
            <span style={{ flex: 1, minWidth: 0, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: s.color }}>{s.text}</span>
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: s.key === 'fNR' ? INK : MUTED, fontVariantNumeric: 'tabular-nums' }}>
              {Math.abs(now[s.key]).toFixed(0)}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED, width: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
              {Math.abs(mean[s.key]).toFixed(0)}
            </span>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11.5, color: MUTED }}>
        All values are flux densities in W/m². The 24 h mean is a time average over the entire day, so it is not expected to match the instantaneous value at one moment; the sign column still shows the direction each term enters F_NR.
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <MiniStat label="Surface T now" value={`${now.tSurf.toFixed(1)}°C`} accent={sc.accent} />
        <MiniStat label="Mean F_NR" value={mean.fNR.toFixed(0)} sub="W/m², 24 h" accent={mean.fNR >= 0 ? '#4a7c59' : BLUE} />
      </div>

      <div style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.45, color: sc.accent, fontWeight: 600, marginTop: 4 }}>{sc.note}</div>

      <div style={{ fontFamily: SANS, fontSize: 11.5, lineHeight: 1.45, color: MUTED, marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${CARD_BORDER}` }}>
        Green shading = net radiative gain by the surface, blue = net loss. The turbulent and
        storage terms that dispose of F_NR (F_SH, F_LH, F_G) are covered in the lecture.
      </div>
    </div>
  );
}

const REAL_WORLD_EXAMPLES = {
  desert: {
    place: 'Sonoran Desert, Arizona, USA',
    context: '32°N · late spring / early summer · 14:00 local time',
    description: 'Clear desert air and high Sun give large F_solar. With albedo ~0.35, much of the incoming energy is absorbed, heating the ground and increasing F_IR↑. The surface gains energy strongly by day and loses it rapidly after sunset.',
  },
  oasis: {
    place: 'Irrigated oasis in a semiarid basin',
    context: '20–30°N · summer midday',
    description: 'Moist soil and vegetation use a larger share of absorbed energy for evaporation, so the surface stays cooler than dry bare ground. This lowers the daytime temperature and suppresses the peak in emitted longwave radiation.',
  },
  snow: {
    place: 'High-latitude snow field, Greenland or Svalbard',
    context: '70–80°N · spring / early summer',
    description: 'Snow has very high albedo, so most incoming solar energy is reflected. Even with long daylight, the absorbed shortwave is small, keeping the surface cold and F_NR weak or negative for much of the day.',
  },
  crop: {
    place: 'Temperate grassland, e.g. central Europe or the Great Plains',
    context: '40–55°N · summer afternoon',
    description: 'Grass absorbs moderate solar energy but transfers much of it to transpiration. This reduces surface heating and smooths the daily temperature cycle relative to dry bare soil.',
  },
  forest: {
    place: 'Boreal conifer forest, northern Canada or Scandinavia',
    context: '50–70°N · summer midday',
    description: 'Low albedo and a deep canopy absorb much of the incoming radiation, but the energy is spread through the vegetation and soil. The result is a more gradual diurnal cycle than for bare ground.',
  },
  urban: {
    place: 'Dense urban pavement, e.g. Phoenix or Tokyo',
    context: 'mid-latitude city · summer afternoon',
    description: 'Low-albedo asphalt and concrete absorb large amounts of solar radiation and store heat. The stored energy is released slowly after sunset, keeping F_IR↑ elevated and reinforcing the urban heat-island effect.',
  },
};

function RealWorldExamplePanel({ phiDeg, deltaDeg, hourOfDay, scenarioKey }) {
  const sc = SCENARIOS[scenarioKey] || SCENARIOS.desert;
  const example = REAL_WORLD_EXAMPLES[scenarioKey] || REAL_WORLD_EXAMPLES.desert;
  const haNow = (hourOfDay - 12) * 15;
  const now = surfaceBudgetAt(phiDeg, deltaDeg, haNow, sc);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: INK }}>{example.place}</div>
      <div style={{ fontFamily: SANS, fontSize: 11.5, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{example.context}</div>
      <div style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, color: INK }}>
        {example.description}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11.5, color: MUTED, paddingTop: 6, borderTop: `1px solid ${CARD_BORDER}` }}>
        Instantaneous state: F_NR ≈ {now.fNR.toFixed(0)} W/m². This is a flux density at one moment; the 24 h mean is a separate time average over the full day.
      </div>
    </div>
  );
}

// shared mean-daily-insolation helper (eq. 2.26), used by both the daily curve and the Fig. 2.11 heatmap
function meanInsolationWm2(phiDeg, deltaDeg) {
  const haSSrad = haSunsetRad(phiDeg, deltaDeg);
  const mean = (S0 / Math.PI) * (
    haSSrad * Math.sin(phiDeg * D2R) * Math.sin(deltaDeg * D2R) +
    Math.cos(phiDeg * D2R) * Math.cos(deltaDeg * D2R) * Math.sin(haSSrad)
  );
  return { mean, haSSrad };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const m = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}
function heatColor(t) {
  t = clamp(t, 0, 1);
  const stops = ['#f6f4ee', '#e3a458', '#8a3a1f'];
  return t <= 0.5 ? lerpColor(stops[0], stops[1], t / 0.5) : lerpColor(stops[1], stops[2], (t - 0.5) / 0.5);
}

function HeatmapPanel({ nday, phiDeg, showEquations = true }) {
  const W = 1780, H = 300;
  const ML = 74, MR = 120, MT = 34, MB = 46;
  const plotW = W - ML - MR, plotH = H - MT - MB;

  const dayStep = 7, latStep = 5;
  const days = [];
  for (let d = 1; d <= 365; d += dayStep) days.push(d);
  const lats = [];
  for (let l = -90; l <= 90; l += latStep) lats.push(l);

  const { grid, maxVal } = React.useMemo(() => {
    let max = 0;
    const g = lats.map((lat) => days.map((day) => {
      const delta = declinationDeg(day);
      const { mean } = meanInsolationWm2(lat, delta);
      if (mean > max) max = mean;
      return mean;
    }));
    return { grid: g, maxVal: max };
  }, []); // grid is independent of nday/phiDeg — computed once

  const xOf = (day) => ML + ((day - 1) / 364) * plotW;
  const yOf = (lat) => MT + (1 - (lat + 90) / 180) * plotH;
  const cellW = plotW / days.length + 0.6;
  const cellH = plotH / lats.length + 0.6;

  const monthTicks = [
    [1, 'Jan'], [60, 'Mar'], [121, 'May'], [182, 'Jul'], [244, 'Sep'], [305, 'Nov'], [365, 'Dec'],
  ];
  const latTicks = [-90, -66.5, -45, 0, 45, 66.5, 90];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <text x={16} y={18} fontFamily={SANS} fontSize={14} fill={MUTED}>{showEquations ? 'Fig. 2.11 analogue — mean daily insolation S̄h by day of year & latitude (eq. 2.26)' : 'Fig. 2.11 analogue — mean daily insolation S̄h by day of year & latitude'}</text>

      {grid.map((row, ri) => row.map((v, ci) => (
        <rect key={ri + '_' + ci} x={xOf(days[ci]) - cellW / 2} y={yOf(lats[ri]) - cellH / 2} width={cellW} height={cellH} fill={heatColor(v / maxVal)} />
      )))}

      {/* axes */}
      <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke={INK} strokeWidth={1.5} />
      <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke={INK} strokeWidth={1.5} />
      {monthTicks.map(([d, lbl]) => (
        <g key={d}>
          <line x1={xOf(d)} x2={xOf(d)} y1={H - MB} y2={H - MB + 6} stroke={INK} strokeWidth={1.2} />
          <text x={xOf(d)} y={H - MB + 22} textAnchor="middle" fontFamily={MONO} fontSize={12} fill={MUTED}>{lbl}</text>
        </g>
      ))}
      {latTicks.map((lat) => (
        <g key={lat}>
          <line x1={ML - 6} x2={ML} y1={yOf(lat)} y2={yOf(lat)} stroke={INK} strokeWidth={1.2} />
          <text x={ML - 12} y={yOf(lat) + 4} textAnchor="end" fontFamily={MONO} fontSize={12} fill={MUTED}>{lat}°</text>
        </g>
      ))}

      {/* current-position crosshair, synced to the animation */}
      <line x1={xOf(nday)} x2={xOf(nday)} y1={MT} y2={H - MB} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={ML} x2={W - MR} y1={yOf(phiDeg)} y2={yOf(phiDeg)} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
      <circle cx={xOf(nday)} cy={yOf(phiDeg)} r={6} fill={BLUE} stroke="#fff" strokeWidth={2} />

      {/* legend */}
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={W - MR + 24} y={MT + plotH - (i + 1) * (plotH / 40)} width={16} height={plotH / 40 + 0.5} fill={heatColor(i / 39)} />
      ))}
      <text x={W - MR + 46} y={MT + 6} fontFamily={MONO} fontSize={12} fill={MUTED}>{maxVal.toFixed(0)}</text>
      <text x={W - MR + 46} y={MT + plotH} fontFamily={MONO} fontSize={12} fill={MUTED}>0</text>
      <text x={W - MR + 46} y={MT + plotH / 2} fontFamily={SANS} fontSize={12} fill={MUTED}>W/m²</text>
      <text x={W - MR + 24} y={MT + plotH + 20} fontFamily={SANS} fontSize={11} fill={MUTED}>white = polar night</text>
    </svg>
  );
}

function ControlBar({
  showToaCurve, setShowToaCurve,
  showGeometry, setShowGeometry,
  showOrbitView, setShowOrbitView,
  exaggerateOrbit, setExaggerateOrbit,
  dayCycleSpeed, setDayCycleSpeed,
  showFig211, setShowFig211,
}) {
  const labelStyle = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 14, color: INK };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 22, background: CARD, border: `1px solid ${CARD_BORDER}`,
      borderRadius: 8, padding: '10px 18px', marginBottom: 14, flexWrap: 'wrap',
    }}>
      <label style={labelStyle}>
        <input type="checkbox" checked={showToaCurve} onChange={(e) => setShowToaCurve(e.target.checked)} />
        Show TOA curve
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={showGeometry} onChange={(e) => setShowGeometry(e.target.checked)} />
        Show geometry
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={showOrbitView} onChange={(e) => setShowOrbitView(e.target.checked)} />
        Show orbit view
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={exaggerateOrbit} onChange={(e) => setExaggerateOrbit(e.target.checked)} />
        Exaggerate orbit
      </label>
      <label style={labelStyle}>
        Day-cycle speed
        <input
          type="range" min={1} max={10} step={0.5} value={dayCycleSpeed}
          onChange={(e) => setDayCycleSpeed(parseFloat(e.target.value))}
          style={{ width: 120 }}
        />
        <span style={{ fontFamily: MONO, fontSize: 13, color: MUTED, width: 34 }}>{dayCycleSpeed}s</span>
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={showFig211} onChange={(e) => setShowFig211(e.target.checked)} />
        Show Fig. 2.11
      </label>
      <div style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 12.5, color: MUTED, whiteSpace: 'nowrap' }}>
        Ctrl/⌘ + scroll or +/− to zoom · Ctrl+0 resets
      </div>
    </div>
  );
}

function SiteBar({ presets, phiDeg, setPhiDeg, nday, deltaDeg, scenario, setScenario, showEquations }) {
  const sc = SCENARIOS[scenario] || SCENARIOS.desert;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {presets.map((p) => (
          <LatButton key={p.deg} label={p.label} deg={p.deg} active={phiDeg === p.deg} onClick={() => setPhiDeg(p.deg)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <MiniStat label="Date" value={`${calendarDate(nday).monthShort} ${calendarDate(nday).dayOfMonth}`} accent={BLUE} sub={`day ${nday}`} />
        <MiniStat label="Declination δ" value={`${deltaDeg.toFixed(1)}°`} accent={AMBER} sub={showEquations ? 'eq. 2.23' : 'axial tilt'} />
        <MiniStat label="Latitude φ" value={`${phiDeg}°`} accent={BLUE} sub="site preset" />
        <MiniStat label="Albedo α" value={sc.albedo.toFixed(2)} accent={sc.accent} sub="surface" />
        <MiniStat label="ε" value={sc.emissivity.toFixed(2)} accent={sc.accent} sub="emissivity" />
        <MiniStat label="F_IR↓" value={`${sc.irDownBase} W/m²`} accent={IR_RED} sub={`+${sc.irDownDayBump} daytime`} />
      </div>
    </div>
  );
}

function toBool(v, d) {
  if (v === undefined || v === null || v === '') return d;
  if (typeof v === 'string') return v !== 'false';
  return !!v;
}
function toNum(v, d) {
  const n = parseFloat(v);
  return isFinite(n) ? n : d;
}

function InsolationScene(props) {
  const time = useTime();
  const duration = 36.5;
  const [phiDeg, setPhiDeg] = React.useState(45);
  const [scenario, setScenario] = React.useState(props.scenario || 'desert');
  const [showToaCurve, setShowToaCurve] = React.useState(toBool(props.showToaCurve, true));
  const [showGeometry, setShowGeometry] = React.useState(toBool(props.showGeometry, true));
  const [showOrbitView, setShowOrbitView] = React.useState(toBool(props.showOrbitView, false));
  const [showFig211, setShowFig211] = React.useState(toBool(props.showFig211, false));
  const [exaggerateOrbit, setExaggerateOrbit] = React.useState(toBool(props.exaggerateOrbit, false));
  const [dayCycleSpeed, setDayCycleSpeed] = React.useState(toNum(props.dayCycleSpeed, 4));
  const showEquations = toBool(props.showEquations, true);

  const nday = clamp(Math.round(1 + (time / duration) * 364), 1, 365);
  const deltaDeg = declinationDeg(nday);
  const autoHour = ((time % dayCycleSpeed) / dayCycleSpeed) * 24;
  const [manualHour, setManualHour] = React.useState(null);
  const hourOfDay = manualHour == null ? autoHour : manualHour;

  const presets = [
    { label: 'Equator (0°)', deg: 0 },
    { label: 'Mid-lat. (30°N)', deg: 30 },
    { label: 'Temperate (45°N)', deg: 45 },
    { label: 'Arctic Circle (66.5°N)', deg: 66.5 },
    { label: 'North Pole (90°N)', deg: 90 },
  ];

  const anySecondary = showToaCurve || showGeometry || showOrbitView;

  return (
    <div style={{ position: 'absolute', inset: 0, background: PAPER, fontFamily: SANS, color: INK, display: 'flex', flexDirection: 'column', padding: '24px 28px 28px' }}>
      <div style={{ flex: '0 0 auto', marginBottom: 12 }}>
        <div style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700, lineHeight: 1.08 }}>
          The Local Energy Balance at the Surface
        </div>
        <div style={{ fontFamily: SANS, fontSize: 15, color: MUTED, marginTop: 6 }}>
          Oke 1987 Fig. 2.20 · local surface energy balance by land-cover type and time of day. The same solar geometry drives the fluxes shown here; the surface responds differently because of albedo, emissivity and thermal response.
        </div>
      </div>

      <ControlBar
        showToaCurve={showToaCurve} setShowToaCurve={setShowToaCurve}
        showGeometry={showGeometry} setShowGeometry={setShowGeometry}
        showOrbitView={showOrbitView} setShowOrbitView={setShowOrbitView}
        exaggerateOrbit={exaggerateOrbit} setExaggerateOrbit={setExaggerateOrbit}
        dayCycleSpeed={dayCycleSpeed} setDayCycleSpeed={setDayCycleSpeed}
        showFig211={showFig211} setShowFig211={setShowFig211}
      />

      <SiteBar
        presets={presets} phiDeg={phiDeg} setPhiDeg={setPhiDeg}
        nday={nday} deltaDeg={deltaDeg} scenario={scenario} setScenario={setScenario}
        showEquations={showEquations}
      />

      <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flex: '1000 1000 0', minHeight: 0, gap: 14 }}>
          <PanelFrame name="1 · Surface Energy Budget" style={{ flex: '1 1 0', minWidth: 0 }} bodyStyle={{ padding: 10, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {Object.keys(SCENARIOS).map((key) => (
                <ScenarioButton key={key} label={SCENARIOS[key].label} accent={SCENARIOS[key].accent} active={scenario === key} onClick={() => setScenario(key)} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <MiniStat label="Albedo α" value={SCENARIOS[scenario].albedo.toFixed(2)} accent={SCENARIOS[scenario].accent} />
              <MiniStat label="Emissivity ε" value={SCENARIOS[scenario].emissivity.toFixed(2)} accent={SCENARIOS[scenario].accent} />
              <MiniStat label="F_IR↓ base" value={`${SCENARIOS[scenario].irDownBase} W/m²`} accent={IR_RED} sub={`+${SCENARIOS[scenario].irDownDayBump} daytime`} />
              <MiniStat label="Surface T" value={`${SCENARIOS[scenario].tMean}°C`} accent={SCENARIOS[scenario].accent} sub={`±${SCENARIOS[scenario].tAmplitude}°C swing`} />
              <MiniStat label="Thermal lag" value={`${SCENARIOS[scenario].lagHr} h`} accent={SCENARIOS[scenario].accent} sub="after noon" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK }}>Time of day</span>
              <input type="range" min={0} max={24} step={0.1} value={hourOfDay} onChange={(e) => setManualHour(parseFloat(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontFamily: MONO, fontSize: 13, color: MUTED, width: 46 }}>
                {String(Math.floor(hourOfDay)).padStart(2, '0')}:{String(Math.floor((hourOfDay % 1) * 60)).padStart(2, '0')}
              </span>
              <button
                onClick={() => setManualHour(manualHour == null ? autoHour : null)}
                style={{
                  padding: '5px 10px', fontFamily: SANS, fontSize: 12, fontWeight: 600, borderRadius: 5, cursor: 'pointer',
                  color: manualHour == null ? '#fff' : INK,
                  background: manualHour == null ? BLUE : CARD,
                  border: `1px solid ${manualHour == null ? BLUE : CARD_BORDER}`,
                }}
              >
                {manualHour == null ? 'Auto ▶' : 'Paused — resume'}
              </button>
            </div>
            <div style={{ flex: '1 1 0', minHeight: 0 }}>
              <EnergyBudgetPanel phiDeg={phiDeg} deltaDeg={deltaDeg} hourOfDay={hourOfDay} scenarioKey={scenario} />
            </div>
          </PanelFrame>

          <PanelFrame name="1b · Instantaneous readout" style={{ flex: '0 0 330px', minWidth: 0 }} bodyStyle={{ padding: '12px 14px', minHeight: 0 }}>
            <BudgetReadout phiDeg={phiDeg} deltaDeg={deltaDeg} hourOfDay={hourOfDay} scenarioKey={scenario} />
          </PanelFrame>

          <PanelFrame name="1c · Real-world example" style={{ flex: '0 0 320px', minWidth: 0 }} bodyStyle={{ padding: '12px 14px', minHeight: 0 }}>
            <RealWorldExamplePanel phiDeg={phiDeg} deltaDeg={deltaDeg} hourOfDay={hourOfDay} scenarioKey={scenario} />
          </PanelFrame>
        </div>

        {anySecondary && (
          <div style={{ display: 'flex', flex: '520 520 0', minHeight: 0, gap: 14 }}>
            {showToaCurve && (
              <PanelFrame name="2 · Daily insolation at the top of the atmosphere" style={{ flex: '1 1 0', minWidth: 0 }} bodyStyle={{ padding: 16, minHeight: 0 }}>
                <CurvePanel phiDeg={phiDeg} deltaDeg={deltaDeg} hourOfDay={hourOfDay} showEquations={showEquations} />
              </PanelFrame>
            )}
            {showGeometry && (
              <PanelFrame name="3 · Solar geometry at the site" style={{ flex: '0 0 520px', minWidth: 0 }} bodyStyle={{ padding: 16, minHeight: 0 }}>
                <DiagramPanel phiDeg={phiDeg} deltaDeg={deltaDeg} />
              </PanelFrame>
            )}
            {showOrbitView && (
              <PanelFrame name="4 · Orbit view" style={{ flex: '0 0 520px', minWidth: 0 }} bodyStyle={{ padding: 0, minHeight: 0 }}>
                <OrbitPanel nday={nday} exaggerateOrbit={exaggerateOrbit} />
              </PanelFrame>
            )}
          </div>
        )}

        {showFig211 && (
          <div style={{ flex: '320 320 0', minHeight: 0 }}>
            <PanelFrame name="5 · Mean daily insolation by day & latitude (Fig. 2.11)" style={{ width: '100%', height: '100%' }} bodyStyle={{ padding: 12, minHeight: 0 }}>
              <HeatmapPanel nday={nday} phiDeg={phiDeg} showEquations={showEquations} />
            </PanelFrame>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { InsolationScene });
