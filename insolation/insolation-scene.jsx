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

// calendar date from day-of-year (non-leap), for a human-readable month readout
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function calendarDate(nday) {
  let d = clamp(Math.round(nday), 1, 365), m = 0;
  while (d > MONTH_LENGTHS[m]) { d -= MONTH_LENGTHS[m]; m++; }
  return { month: MONTH_NAMES[m], monthShort: MONTH_NAMES[m].slice(0, 3), dayOfMonth: d };
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
          {Math.hypot(m.x - earthX, m.y - earthY) > 62 && (
            <text x={m.x} y={m.y - 10} textAnchor="middle" fontFamily={SANS} fontSize={11} fill={MUTED}>{m.label}</text>
          )}
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
  const cx = 285, cy = 310, R = 185;
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

  // Sun direction is FIXED horizontal (from the right): the Sun never moves in this frame.
  // Earth is drawn tilted by -delta instead — the projection of its fixed axis onto the
  // Sun-Earth line at this orbital position.
  const rayLines = [-160, -110, -60, 0, 60, 110, 160].map((offset) => {
    const hits = Math.abs(offset) < R;
    return {
      startX: cx + 350, startY: cy + offset,
      endX: hits ? cx + Math.sqrt(R * R - offset * offset) + 3 : cx - 250,
      endY: cy + offset,
    };
  });
  const sunCx = cx + 392, sunCy = cy;

  // night side: terminator is perpendicular to the (now fixed, horizontal) sun direction
  const nightPath = arcPath(cx, cy, R, 90, 270) + ` L ${cx} ${cy} Z`;
  const [nightLabelX, nightLabelY] = polar(cx, cy, R * 0.55, 180);
  const [dayLabelX, dayLabelY] = polar(cx, cy, R * 0.86, 0);
  // observer's on-screen position once Earth is tilted
  const [pScrX, pScrY] = polar(cx, cy, R, phiDeg - deltaDeg);

  return (
    <svg viewBox="0 0 740 600" width="100%" height="100%">
      {/* sun rays — always horizontal */}
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

      {/* Sun-Earth line — the fixed reference direction */}
      <line
        x1={cx - 230} y1={cy} x2={cx + 230} y2={cy}
        stroke={AMBER} strokeWidth={1.5} strokeDasharray="5 4"
      />

      {/* Earth circle */}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={2} />
      {/* night-side shading — no direct radiation reaches this half */}
      <clipPath id="earthClip"><circle cx={cx} cy={cy} r={R} /></clipPath>
      <path d={nightPath} fill="#2b3140" opacity={0.55} clipPath="url(#earthClip)" />
      <text x={nightLabelX} y={nightLabelY} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={700} fill="#e8e6df">night</text>
      <text x={dayLabelX} y={dayLabelY} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={700} fill={INK}>day</text>

      {/* everything fixed to the solid Earth rotates together with the tilt */}
      <g transform={`rotate(${deltaDeg} ${cx} ${cy})`}>
        {/* equator */}
        <line x1={cx - R - 30} y1={cy} x2={cx + R + 30} y2={cy} stroke={LINE} strokeWidth={1.5} />
        <text x={cx - R - 36} y={cy + 5} textAnchor="end" fontFamily={SANS} fontSize={13} fill={MUTED}>equator</text>
        {/* axis — fixed direction in space, tilted relative to the Sun line */}
        <line x1={cx} y1={cy - R - 46} x2={cx} y2={cy + R + 46} stroke={INK} strokeWidth={2} />
        <circle cx={cx} cy={cy - R - 46} r={3} fill={INK} />
        <text x={cx + 10} y={cy - R - 58} fontFamily={SANS} fontSize={13} fill={MUTED}>axis</text>

        {/* radius to observer P */}
        <line x1={cx} y1={cy} x2={px} y2={py} stroke={INK} strokeWidth={1.5} />
        {/* horizon tangent at P */}
        <line x1={tx} y1={ty} x2={tx2} y2={ty2} stroke={BLUE} strokeWidth={1.5} />
        {/* zenith normal at P */}
        <line x1={px} y1={py} x2={zx} y2={zy} stroke={BLUE} strokeWidth={1.5} strokeDasharray="4 3" />
        <circle cx={px} cy={py} r={5} fill={BLUE} />

        {/* angle phi at O between equator and OP */}
        <path d={arcPath(cx, cy, 46, 0, phiDeg)} fill="none" stroke={INK} strokeWidth={1.3} />
      </g>

      {/* phi and observer labels, upright in screen space */}
      {/* observer label — offset perpendicular to the zenith direction, so it never
          lands on the θs label that radiates along the zenith/Sun-line bisector */}
      {(() => {
        const [lx, ly] = polar(pScrX, pScrY, 34, (phiDeg - deltaDeg) + 95);
        return <text x={lx} y={ly} textAnchor="middle" fontFamily={SANS} fontSize={13} fontWeight={700} fill={BLUE}>observer</text>;
      })()}
      {Math.abs(phiDeg) >= 10 && (() => {
        const [lx, ly] = polar(cx, cy, 42, phiDeg / 2 - deltaDeg);
        return <text x={lx} y={ly + 5} textAnchor="middle" fontFamily={SERIF} fontSize={17} fontStyle="italic" fill={INK}>φ</text>;
      })()}

      {/* angle delta between the tilted equator and the fixed Sun line */}
      <path d={arcPath(cx, cy, 92, -deltaDeg, 0)} fill="none" stroke={AMBER} strokeWidth={1.3} />
      {(() => {
        const [lx, ly] = polar(cx, cy, 88, -deltaDeg / 2);
        return <text x={lx} y={ly + 5} textAnchor="middle" fontFamily={SERIF} fontSize={17} fontStyle="italic" fill={AMBER}>δ</text>;
      })()}

      {sunUpAtNoon && (
        <>
          <path d={arcPath(pScrX, pScrY, 34, phiDeg - deltaDeg, 0)} fill="none" stroke="#7a6a3f" strokeWidth={1.3} />
          {(() => {
            const [lx, ly] = polar(pScrX, pScrY, 62, (phiDeg - deltaDeg) / 2);
            return <text x={lx + 14} y={ly + 12} fontFamily={SERIF} fontSize={16} fontStyle="italic" fill="#7a6a3f">θs (noon)</text>;
          })()}
        </>
      )}

      <text x={20} y={26} fontFamily={SANS} fontSize={14} fill={MUTED}>Sun-referenced view at local solar noon — the Sun stays put; Earth&rsquo;s tilt is what turns</text>
      <text x={20} y={46} fontFamily={SANS} fontSize={12} fill={MUTED}>The axis does not nod: it holds a fixed direction in space, and we are viewing it from a different point in the orbit.</text>
    </svg>
  );
}

function CurvePanel({ phiDeg, deltaDeg, hourOfDay }) {
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
      <text x={16} y={18} fontFamily={SANS} fontSize={14} fill={MUTED}>Sh = S₀ cos θs — instantaneous insolation over the day</text>
      <text x={16} y={38} fontFamily={SANS} fontSize={12} fill={MUTED}>eqs. 2.20–2.21 (curve) · 2.24 (sunrise/sunset) · 2.25 (day length) · 2.26 (mean)</text>

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
          <text x={xOf(ha)} y={H - MB + 24} textAnchor="middle" fontFamily={MONO} fontSize={13} fill={MUTED}>{lbl}</text>
        </g>
      ))}
      <text x={W / 2} y={H - 16} textAnchor="middle" fontFamily={SANS} fontSize={14} fill={MUTED}>local solar time</text>

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

function HeatmapPanel({ nday, phiDeg }) {
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
      <text x={16} y={18} fontFamily={SANS} fontSize={14} fill={MUTED}>Fig. 2.11 analogue — mean daily insolation S̄h by day of year &amp; latitude (eq. 2.26)</text>

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

function AnnualTotalPanel({ phiDeg }) {
  const W = 860, H = 300;
  const ML = 84, MR = 24, MT = 34, MB = 46;
  const plotW = W - ML - MR, plotH = H - MT - MB;

  const lats = [];
  for (let l = -90; l <= 90; l += 1) lats.push(l);

  const { curve, maxVal } = React.useMemo(() => {
    let max = 0;
    const c = lats.map((lat) => {
      let total = 0;
      for (let day = 1; day <= 365; day++) {
        const delta = declinationDeg(day);
        total += meanInsolationWm2(lat, delta).mean;
      }
      const annualMeanWm2 = total / 365;
      if (annualMeanWm2 > max) max = annualMeanWm2;
      return annualMeanWm2;
    });
    return { curve: c, maxVal: max };
  }, []);

  const xOf = (lat) => ML + ((lat + 90) / 180) * plotW;
  const yOf = (v) => MT + (1 - v / maxVal) * plotH;

  const linePath = 'M ' + lats.map((lat, i) => `${xOf(lat)} ${yOf(curve[i])}`).join(' L ');
  const areaPath = linePath + ` L ${xOf(90)} ${yOf(0)} L ${xOf(-90)} ${yOf(0)} Z`;

  const currentVal = curve[Math.round(clamp(phiDeg, -90, 90)) + 90];
  const latTicks = [-90, -66.5, -45, 0, 45, 66.5, 90];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <text x={16} y={18} fontFamily={SANS} fontSize={14} fill={MUTED}>Annual-mean insolation by latitude — yearly average of S̄h (eq. 2.26)</text>

      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={ML} x2={W - MR} y1={MT + f * plotH} y2={MT + f * plotH} stroke={LINE} strokeWidth={1} opacity={0.6} />
      ))}
      <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke={INK} strokeWidth={1.5} />
      <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke={INK} strokeWidth={1.5} />

      {[0, 0.5, 1].map((f) => (
        <text key={f} x={ML - 12} y={MT + (1 - f) * plotH + 5} textAnchor="end" fontFamily={MONO} fontSize={13} fill={MUTED}>
          {Math.round(f * maxVal)}
        </text>
      ))}
      <text x={26} y={MT + plotH / 2} transform={`rotate(-90 26 ${MT + plotH / 2})`} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={MUTED}>
        W/m²
      </text>

      {latTicks.map((lat) => (
        <g key={lat}>
          <line x1={xOf(lat)} x2={xOf(lat)} y1={H - MB} y2={H - MB + 6} stroke={INK} strokeWidth={1.2} />
          <text x={xOf(lat)} y={H - MB + 22} textAnchor="middle" fontFamily={MONO} fontSize={12} fill={MUTED}>{lat}°</text>
        </g>
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontFamily={SANS} fontSize={13} fill={MUTED}>latitude</text>

      <path d={areaPath} fill={BLUE} opacity={0.12} />
      <path d={linePath} fill="none" stroke={BLUE} strokeWidth={3} />

      <line x1={xOf(phiDeg)} x2={xOf(phiDeg)} y1={MT} y2={H - MB} stroke={AMBER} strokeWidth={1.5} strokeDasharray="4 4" />
      <circle cx={xOf(phiDeg)} cy={yOf(currentVal)} r={6} fill={AMBER} stroke="#fff" strokeWidth={2} />
      <text x={xOf(phiDeg)} y={yOf(currentVal) - 12} textAnchor="middle" fontFamily={MONO} fontSize={13} fontWeight={700} fill={AMBER}>
        {currentVal.toFixed(0)}
      </text>
    </svg>
  );
}

// Sun position in local horizon coordinates from hour angle H (deg, +afternoon), δ and φ.
// Returns altitude (deg above horizon) and azimuth (deg clockwise from North: 0=N,90=E,180=S,270=W).
function sunAltAz(phiDeg, deltaDeg, Hdeg) {
  const phi = phiDeg * D2R, del = deltaDeg * D2R, H = Hdeg * D2R;
  const up = Math.sin(del) * Math.sin(phi) + Math.cos(del) * Math.cos(H) * Math.cos(phi); // = cos θs
  const east = -Math.cos(del) * Math.sin(H);
  const north = Math.sin(del) * Math.cos(phi) - Math.cos(del) * Math.cos(H) * Math.sin(phi);
  const alt = Math.asin(clamp(up, -1, 1)) / D2R;
  let az = Math.atan2(east, north) / D2R;
  if (az < 0) az += 360;
  return { alt, az };
}

function SunPathPanel({ phiDeg, deltaDeg, hourOfDay }) {
  const W = 520, H = 520;
  const cx = W / 2, cy = H / 2, R = 205;
  // polar projection: r ∝ zenith distance (center = overhead/zenith, edge = horizon)
  const project = (alt, az) => {
    const r = R * (90 - alt) / 90;
    const a = az * D2R;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  };

  // build the sun's track for a given declination (only the above-horizon portion)
  const trackPath = (del) => {
    let d = '', pen = false;
    for (let Hd = -180; Hd <= 180; Hd += 1.5) {
      const { alt, az } = sunAltAz(phiDeg, del, Hd);
      if (alt >= 0) {
        const [x, y] = project(alt, az);
        d += (pen ? ' L ' : ' M ') + x.toFixed(1) + ' ' + y.toFixed(1);
        pen = true;
      } else pen = false;
    }
    return d;
  };

  const refTracks = [
    { del: 23.45, label: 'summer solstice', color: '#d19a4e' },
    { del: 0, label: 'equinox', color: '#9a9483' },
    { del: -23.45, label: 'winter solstice', color: '#7d8ba0' },
  ];

  const altRings = [0, 20, 40, 60, 80];
  const compass = [['N', 0], ['E', 90], ['S', 180], ['W', 270]];

  // hour-of-day labels placed along the current track
  const hourMarks = [];
  for (let h = 4; h <= 20; h += 2) {
    const { alt, az } = sunAltAz(phiDeg, deltaDeg, (h - 12) * 15);
    if (alt >= 0) {
      const [x, y] = project(alt, az);
      hourMarks.push({ h, x, y });
    }
  }

  const Hnow = (hourOfDay - 12) * 15;
  const now = sunAltAz(phiDeg, deltaDeg, Hnow);
  const nowUp = now.alt >= 0;
  const [nx, ny] = project(Math.max(now.alt, 0), now.az);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {/* horizon disk */}
      <circle cx={cx} cy={cy} r={R} fill="#f4f7fa" stroke={INK} strokeWidth={1.5} />
      {/* altitude rings */}
      {altRings.map((alt) => {
        const rr = R * (90 - alt) / 90;
        return (
          <g key={alt}>
            <circle cx={cx} cy={cy} r={rr} fill="none" stroke={LINE} strokeWidth={1} opacity={0.7} />
            {alt > 0 && <text x={cx + 4} y={cy - rr + 13} fontFamily={MONO} fontSize={11} fill={MUTED}>{alt}°</text>}
          </g>
        );
      })}
      {/* azimuth spokes every 30° */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = i * 30 * D2R;
        return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.sin(a)} y2={cy - R * Math.cos(a)} stroke={LINE} strokeWidth={0.6} opacity={0.5} />;
      })}
      {/* compass labels */}
      {compass.map(([lbl, az]) => {
        const a = az * D2R;
        return (
          <text key={lbl} x={cx + (R + 16) * Math.sin(a)} y={cy - (R + 16) * Math.cos(a) + 5}
            textAnchor="middle" fontFamily={SANS} fontSize={15} fontWeight={700} fill={INK}>{lbl}</text>
        );
      })}

      {/* faint seasonal reference tracks */}
      {refTracks.map((t) => (
        <path key={t.label} d={trackPath(t.del)} fill="none" stroke={t.color} strokeWidth={1.5}
          strokeDasharray={t.del === deltaDeg ? undefined : '5 4'} opacity={0.65} />
      ))}

      {/* current-day track (bold) */}
      <path d={trackPath(deltaDeg)} fill="none" stroke={BLUE} strokeWidth={3.5} />

      {/* hour labels on current track */}
      {hourMarks.map((m) => (
        <g key={m.h}>
          <circle cx={m.x} cy={m.y} r={2.6} fill={BLUE} />
          <text x={m.x} y={m.y - 7} textAnchor="middle" fontFamily={MONO} fontSize={10.5} fill={BLUE}>{m.h}h</text>
        </g>
      ))}

      {/* moving sun */}
      {nowUp && (
        <>
          {[0, 45, 90, 135].map((a) => {
            const [x1, y1] = polar(nx, ny, 10, a);
            const [x2, y2] = polar(nx, ny, 15, a);
            return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AMBER} strokeWidth={1.6} />;
          })}
          {[0, 45, 90, 135].map((a) => {
            const [x1, y1] = polar(nx, ny, 10, a + 180);
            const [x2, y2] = polar(nx, ny, 15, a + 180);
            return <line key={'b' + a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AMBER} strokeWidth={1.6} />;
          })}
          <circle cx={nx} cy={ny} r={8} fill={AMBER} stroke="#fff" strokeWidth={2} />
        </>
      )}

      <text x={16} y={22} fontFamily={SANS} fontSize={14} fill={MUTED}>Sun path across the sky vault (after Oke, Fig. A1.2)</text>
      <text x={16} y={H - 14} fontFamily={SANS} fontSize={12} fill={MUTED}>
        {nowUp ? `alt ${now.alt.toFixed(0)}° · az ${now.az.toFixed(0)}°` : 'Sun below horizon'} · centre = zenith, edge = horizon
      </text>
    </svg>
  );
}

function EquationsPanel() {
  const eqStyle = { display: 'flex', gap: 14, alignItems: 'baseline', padding: '6px 0', borderBottom: `1px solid ${CARD_BORDER}` };
  const numStyle = { fontFamily: SANS, fontSize: 12, color: MUTED, width: 46, flexShrink: 0 };
  const texStyle = { fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: INK };
  const eqs = [
    ['2.19', 'λt = v + ϖ + 180°', 'true solar longitude, from true anomaly v and perihelion longitude ϖ'],
    ['2.20', 'Sh = S₀ (r̄/r)² cos θs', 'instantaneous insolation on a horizontal surface'],
    ['2.21', 'cos θs = sinφ sinδ + cosφ cosδ cos h', 'cosine of the solar zenith distance'],
    ['2.23', 'δ = 23.45° sin[360°(NDAY−80)/365]', 'solar declination (simplified)'],
    ['2.24', 'cos h₀ = −tanφ tanδ', 'hour angle at sunrise/sunset'],
    ['2.25', 'LOD = (24/π) h₀', 'day length, from the sunset hour angle h₀'],
    ['2.26', 'S̄h = (S₀/π)[h₀ sinφ sinδ + cosφ cosδ sin h₀]', 'mean daily insolation'],
  ];
  return (
    <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: '14px 20px', marginTop: 16 }}>
      <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 6 }}>
        Equations — Goosse et al., §2.1.3
      </div>
      {eqs.map(([n, tex, desc]) => (
        <div key={n} style={eqStyle}>
          <span style={numStyle}>({n})</span>
          <span style={texStyle}>{tex}</span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>— {desc}</span>
        </div>
      ))}
    </div>
  );
}

// "Same arrow, four places": Earth's rotation axis keeps ONE fixed direction in space.
// The seasons come from where Earth sits in the orbit relative to that fixed arrow.
function AxialParallelismInset() {
  const W = 520, H = 272;
  const ox = W / 2, oy = H / 2 - 4;
  const ax = 190, by = 56;           // orbit ellipse semi-axes (oblique view)
  const AXIS_TILT = 23.45;           // fixed screen direction of the axis, degrees from vertical
  const er = 17;

  const positions = [
    { a: 180, label: 'June solstice', sub: 'N pole tips sunward', place: 'below' },
    { a: 270, label: 'September equinox', sub: null, place: 'below' },
    { a: 0, label: 'December solstice', sub: 'N pole tips away', place: 'below' },
    { a: 90, label: 'March equinox', sub: null, place: 'above' },
  ].map((p) => {
    const r = p.a * D2R;
    return { ...p, x: ox + ax * Math.cos(r), y: oy - by * Math.sin(r) };
  });

  // axis endpoints: identical direction at every position (that is the whole point)
  const AXIS_LEN = er + 16;
  const axisEnd = (x, y, sign) => [
    x + sign * AXIS_LEN * Math.sin(AXIS_TILT * D2R),
    y - sign * AXIS_LEN * Math.cos(AXIS_TILT * D2R),
  ];
  // equator sits perpendicular to the axis
  const equatorEnd = (x, y, sign) => [
    x + sign * er * 0.94 * Math.cos(AXIS_TILT * D2R),
    y + sign * er * 0.94 * Math.sin(AXIS_TILT * D2R),
  ];
  // explicit arrowhead at the north end (drawn, not a marker, so orientation is exact)
  const arrowHead = (x, y) => {
    const [tx, ty] = axisEnd(x, y, 1);
    const dx = Math.sin(AXIS_TILT * D2R), dy = -Math.cos(AXIS_TILT * D2R);
    const bx = tx - dx * 9, by2 = ty - dy * 9;
    const px = -dy * 4.2, py = dx * 4.2;
    return `M ${tx} ${ty} L ${bx + px} ${by2 + py} L ${bx - px} ${by2 - py} Z`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <text x={10} y={15} fontFamily={SANS} fontSize={13} fill={MUTED}>
        Same arrow, four places — the axis never changes direction
      </text>

      <ellipse cx={ox} cy={oy} rx={ax} ry={by} fill="none" stroke={LINE} strokeWidth={1.3} strokeDasharray="4 4" />

      <circle cx={ox} cy={oy} r={11} fill="none" stroke={AMBER} strokeWidth={2} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const [x1, y1] = polar(ox, oy, 13, a);
        const [x2, y2] = polar(ox, oy, 18, a);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AMBER} strokeWidth={1.6} />;
      })}

      {positions.map((p, i) => {
        const [nx, ny] = axisEnd(p.x, p.y, 1);
        const [sx, sy] = axisEnd(p.x, p.y, -1);
        const [e1x, e1y] = equatorEnd(p.x, p.y, 1);
        const [e2x, e2y] = equatorEnd(p.x, p.y, -1);
        const titleY = p.place === 'above' ? p.y - er - 26 : p.y + er + 24;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={er} fill="#eef3f8" stroke={INK} strokeWidth={1.4} />
            <line x1={e2x} y1={e2y} x2={e1x} y2={e1y} stroke={MUTED} strokeWidth={1} strokeDasharray="3 2" />
            <line x1={sx} y1={sy} x2={nx} y2={ny} stroke={INK} strokeWidth={2} />
            <path d={arrowHead(p.x, p.y)} fill={INK} />
            <text x={p.x} y={titleY}
              textAnchor="middle" fontFamily={SANS} fontSize={11.5} fontWeight={700} fill={INK}>{p.label}</text>
            {p.sub && (
              <text x={p.x} y={titleY + 14}
                textAnchor="middle" fontFamily={SANS} fontSize={10.5} fill={MUTED}>{p.sub}</text>
            )}
          </g>
        );
      })}

      <text x={W / 2} y={H - 6} textAnchor="middle" fontFamily={SANS} fontSize={11} fill={MUTED}>
        ▲ = North-pole end of the rotation axis &middot; dashed line = equator &middot; Sun at the focus
      </text>
    </svg>
  );
}

function ControlBar({ showOrbitView, setShowOrbitView, exaggerateOrbit, setExaggerateOrbit, dayCycleSpeed, setDayCycleSpeed, showFig211, setShowFig211, showAnnualTotal, setShowAnnualTotal, showEquations, setShowEquations, showSkyPath, setShowSkyPath }) {
  const labelStyle = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 14, color: INK };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 22, background: CARD, border: `1px solid ${CARD_BORDER}`,
      borderRadius: 8, padding: '10px 18px', marginBottom: 14,
    }}>
      <label style={labelStyle}>
        <input type="checkbox" checked={showOrbitView} onChange={(e) => setShowOrbitView(e.target.checked)} />
        Show orbit view
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={showSkyPath} onChange={(e) => setShowSkyPath(e.target.checked)} />
        Show sun-path (sky view)
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={exaggerateOrbit} onChange={(e) => setExaggerateOrbit(e.target.checked)} />
        Exaggerate orbit shape
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
        Show Fig. 2.11 heatmap
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={showAnnualTotal} onChange={(e) => setShowAnnualTotal(e.target.checked)} />
        Show annual total by latitude
      </label>
      <label style={labelStyle}>
        <input type="checkbox" checked={showEquations} onChange={(e) => setShowEquations(e.target.checked)} />
        Show equations
      </label>
      <span style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginLeft: 'auto' }}>Ctrl/⌘ + scroll or +/− to zoom · Ctrl+0 resets</span>
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
  const [showOrbitView, setShowOrbitView] = React.useState(toBool(props.showOrbitView, true));
  const [exaggerateOrbit, setExaggerateOrbit] = React.useState(toBool(props.exaggerateOrbit, false));
  const [dayCycleSpeed, setDayCycleSpeed] = React.useState(toNum(props.dayCycleSpeed, 4));
  const [showFig211, setShowFig211] = React.useState(toBool(props.showFig211, true));
  const [showAnnualTotal, setShowAnnualTotal] = React.useState(toBool(props.showAnnualTotal, true));
  const [showEquations, setShowEquations] = React.useState(toBool(props.showEquations, false));
  const [showSkyPath, setShowSkyPath] = React.useState(toBool(props.showSkyPath, true));

  const nday = clamp(Math.round(1 + (time / duration) * 364), 1, 365);
  const deltaDeg = declinationDeg(nday);
  const hourOfDay = ((time % dayCycleSpeed) / dayCycleSpeed) * 24;

  const presets = [
    { label: 'Equator (0°)', deg: 0 },
    { label: 'Mid-lat. (30°N)', deg: 30 },
    { label: 'Temperate (45°N)', deg: 45 },
    { label: 'Arctic Circle (66.5°N)', deg: 66.5 },
    { label: 'North Pole (90°N)', deg: 90 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: PAPER, fontFamily: SANS, color: INK, padding: '30px 60px' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 700, lineHeight: 1.1 }}>
          Present-Day Insolation at the Top of the Atmosphere
        </div>
        <div style={{ fontFamily: SANS, fontSize: 15, color: MUTED, marginTop: 4 }}>
          §2.1.3 · Goosse, Barriat, Lefebvre, Loutre &amp; Zunz (2010) — Earth orbits the fixed Sun (eqs. 2.14–2.19); the resulting zenith angle drives sunrise/sunset, day length &amp; daily insolation (eqs. 2.21–2.26). Drag the timeline below to scrub the day of year.
        </div>
      </div>

      <ControlBar
        showOrbitView={showOrbitView} setShowOrbitView={setShowOrbitView}
        exaggerateOrbit={exaggerateOrbit} setExaggerateOrbit={setExaggerateOrbit}
        dayCycleSpeed={dayCycleSpeed} setDayCycleSpeed={setDayCycleSpeed}
        showFig211={showFig211} setShowFig211={setShowFig211}
        showAnnualTotal={showAnnualTotal} setShowAnnualTotal={setShowAnnualTotal}
        showEquations={showEquations} setShowEquations={setShowEquations}
        showSkyPath={showSkyPath} setShowSkyPath={setShowSkyPath}
      />

      <div style={{ display: 'flex', gap: 24, height: 850 }}>
        {showOrbitView && (
          <div style={{ flex: '0 0 560px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 16, height: 470 }}>
              <OrbitPanel nday={nday} exaggerateOrbit={exaggerateOrbit} />
            </div>
            <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 12, height: 250 }}>
              <AxialParallelismInset />
            </div>
            <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: '12px 16px', fontFamily: SANS, fontSize: 14, color: MUTED }}>
              {calendarDate(nday).month} — {seasonLabel(nday)} — the season is set by the fixed tilt of Earth's axis relative to its orbital position, not by any motion of the Sun.
            </div>
          </div>
        )}

        {/* geometry column */}
        <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 16, height: 470 }}>
            <DiagramPanel phiDeg={phiDeg} deltaDeg={deltaDeg} />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {presets.map((p) => (
              <LatButton key={p.deg} label={p.label} deg={p.deg} active={phiDeg === p.deg} onClick={() => setPhiDeg(p.deg)} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <StatCard label="Date" value={`${calendarDate(nday).monthShort} ${calendarDate(nday).dayOfMonth}`} sub={`day ${nday} of 365`} />
            <StatCard label="Declination δ" value={`${deltaDeg.toFixed(1)}°`} accent={AMBER} sub="eq. 2.23" />
            <StatCard label="Latitude φ" value={`${phiDeg}°N`} accent={BLUE} sub="pick a preset" />
          </div>
        </div>

        {/* curve column */}
        <div style={{ flex: '1 1 0', background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 16 }}>
          <CurvePanel phiDeg={phiDeg} deltaDeg={deltaDeg} hourOfDay={hourOfDay} />
        </div>
      </div>

      {showSkyPath && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <div style={{ flex: '0 0 560px', background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 16, height: 560 }}>
            <SunPathPanel phiDeg={phiDeg} deltaDeg={deltaDeg} hourOfDay={hourOfDay} />
          </div>
          <div style={{ flex: 1, background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700 }}>Where the Sun is in the sky</div>
            <div style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.5, textWrap: 'pretty' }}>
              A polar (stereographic) projection of the sky dome for latitude {phiDeg}°N. The centre is the zenith (Sun directly overhead), the outer circle is the horizon, and the compass runs N–E–S–W around the edge. The Sun&rsquo;s altitude and azimuth come from the same declination δ and hour angle h that drive the insolation curve, so the amber Sun tracks in lockstep with the animation.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 14, color: INK }}>
                <span style={{ width: 28, borderTop: `3.5px solid ${BLUE}` }}></span> current day&rsquo;s track (δ = {deltaDeg.toFixed(1)}°)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 14, color: INK }}>
                <span style={{ width: 28, borderTop: '2px dashed #d19a4e' }}></span> summer solstice
                <span style={{ width: 28, borderTop: '2px dashed #9a9483' }}></span> equinox
                <span style={{ width: 28, borderTop: '2px dashed #7d8ba0' }}></span> winter solstice
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: SANS, fontSize: 14, color: INK }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: AMBER, display: 'inline-block' }}></span> Sun now — higher tracks (nearer the centre) mean a smaller zenith angle θs and stronger insolation.
              </div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 'auto' }}>
              At Northern-Hemisphere latitudes the whole track bows toward the south; only within the tropics does the midday Sun ever pass overhead (through the centre).
            </div>
          </div>
        </div>
      )}

      {(showFig211 || showAnnualTotal) && (
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {showFig211 && (
            <div style={{ flex: showAnnualTotal ? '1 1 0' : '1 1 100%', background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 16, height: 320 }}>
              <HeatmapPanel nday={nday} phiDeg={phiDeg} />
            </div>
          )}
          {showAnnualTotal && (
            <div style={{ flex: showFig211 ? '0 0 460px' : '1 1 100%', background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: 16, height: 320 }}>
              <AnnualTotalPanel phiDeg={phiDeg} />
            </div>
          )}
        </div>
      )}
      {showEquations && <EquationsPanel />}
    </div>
  );
}

Object.assign(window, { InsolationScene });
