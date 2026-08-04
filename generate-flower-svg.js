const fs = require('fs');

const PI = Math.PI;
const r = (deg) => (deg * PI) / 180;
const pt = (cx, cy, radius, angleDeg) => [
  cx + radius * Math.cos(r(angleDeg)),
  cy + radius * Math.sin(r(angleDeg)),
];
const f = (n) => n.toFixed(3);

/**
 * Generate one elliptical petal rotated around the center.
 * Each petal is an elongated oval:
 *   - starts at rBase from center  (petal base)
 *   - extends to rTip from center  (petal tip)
 *   - is halfWidth wide (perpendicular to petal axis)
 */
function petalPath(cx, cy, angleDeg, rBase, rTip, halfWidth) {
  const rad = r(angleDeg);
  const perp = r(angleDeg + 90);

  // Base midpoint on inner ring
  const bx = cx + rBase * Math.cos(rad);
  const by = cy + rBase * Math.sin(rad);

  // Tip of the petal
  const tx = cx + rTip * Math.cos(rad);
  const ty = cy + rTip * Math.sin(rad);

  // Left and right base corners
  const lbx = bx + halfWidth * Math.cos(perp);
  const lby = by + halfWidth * Math.sin(perp);
  const rbx = bx - halfWidth * Math.cos(perp);
  const rby = by - halfWidth * Math.sin(perp);

  // Control points – cubic bezier to make a smooth rounded petal
  // Left side: from left-base to tip
  const lc1x = lbx + (rTip - rBase) * 0.55 * Math.cos(rad) + halfWidth * 0.15 * Math.cos(perp);
  const lc1y = lby + (rTip - rBase) * 0.55 * Math.sin(rad) + halfWidth * 0.15 * Math.sin(perp);
  const lc2x = tx + halfWidth * 0.35 * Math.cos(perp);
  const lc2y = ty + halfWidth * 0.35 * Math.sin(perp);

  // Right side: from tip to right-base
  const rc1x = tx - halfWidth * 0.35 * Math.cos(perp);
  const rc1y = ty - halfWidth * 0.35 * Math.sin(perp);
  const rc2x = rbx + (rTip - rBase) * 0.55 * Math.cos(rad) - halfWidth * 0.15 * Math.cos(perp);
  const rc2y = rby + (rTip - rBase) * 0.55 * Math.sin(rad) - halfWidth * 0.15 * Math.sin(perp);

  return (
    `M ${f(lbx)} ${f(lby)} ` +
    `C ${f(lc1x)} ${f(lc1y)} ${f(lc2x)} ${f(lc2y)} ${f(tx)} ${f(ty)} ` +
    `C ${f(rc1x)} ${f(rc1y)} ${f(rc2x)} ${f(rc2y)} ${f(rbx)} ${f(rby)} ` +
    `Z`
  );
}

function genLayer(count, rBase, rTip, halfWidth, fill, stroke, strokeW, offset = 0) {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i + offset;
    const d = petalPath(50, 50, angle, rBase, rTip, halfWidth);
    paths.push(`    <path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" stroke-linejoin="round" />`);
  }
  return paths.join('\n');
}

// ── Layers (matching gerbera daisy: full ring of long petals, then shorter inner ones) ──
const outerPetals = genLayer(36, 13, 48, 4.2, '#FFFFFF',     '#DEDAD3', 0.35, 0);
const midPetals   = genLayer(36, 11, 40, 3.6, '#F9F7F3',     '#E0DAD0', 0.30, 5);
const innerPetals = genLayer(24, 10, 30, 3.0, '#F4F0E8',     '#D8D2C5', 0.30, 7.5);

// ── Stamen dots ring ──
const stamenRing1 = [];
for (let i = 0; i < 24; i++) {
  const a = r((360 / 24) * i);
  const cx = f(50 + 11.5 * Math.cos(a));
  const cy = f(50 + 11.5 * Math.sin(a));
  stamenRing1.push(`    <circle cx="${cx}" cy="${cy}" r="1.05" fill="#B8860B" />`);
}
const stamenRing2 = [];
for (let i = 0; i < 18; i++) {
  const a = r((360 / 18) * i + 10);
  const cx = f(50 + 8.5 * Math.cos(a));
  const cy = f(50 + 8.5 * Math.sin(a));
  stamenRing2.push(`    <circle cx="${cx}" cy="${cy}" r="0.9" fill="#C9980E" opacity="0.85" />`);
}

const svg = `<svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Subtle radial shadow under petals -->
    <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="#1E3A22" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#1E3A22" stop-opacity="0" />
    </radialGradient>
    <!-- Center golden gradient -->
    <radialGradient id="centerGrad" cx="40%" cy="38%" r="65%">
      <stop offset="0%"   stop-color="#FFF0A0" />
      <stop offset="45%"  stop-color="#D9A321" />
      <stop offset="100%" stop-color="#7A5C0A" />
    </radialGradient>
    <!-- Subtle petal gloss -->
    <radialGradient id="glossGrad" cx="40%" cy="30%" r="60%">
      <stop offset="0%"  stop-color="#FFFFFF" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Outer petal layer (36 petals) -->
  <g>
${outerPetals}
  </g>

  <!-- Mid petal layer offset (36 petals) -->
  <g>
${midPetals}
  </g>

  <!-- Inner transition petal layer (24 petals) -->
  <g>
${innerPetals}
  </g>

  <!-- Soft radial shadow over petal bases -->
  <circle cx="50" cy="50" r="20" fill="url(#shadowGrad)" />

  <!-- Center disk: outer ring -->
  <circle cx="50" cy="50" r="14" fill="#A07010" />

  <!-- Stamen outer ring -->
${stamenRing1.join('\n')}

  <!-- Stamen inner ring -->
${stamenRing2.join('\n')}

  <!-- Center core -->
  <circle cx="50" cy="50" r="6.5" fill="url(#centerGrad)" />
  <circle cx="50" cy="50" r="4.5" fill="#3D1F00" />

  <!-- Gloss highlight on center -->
  <circle cx="48" cy="47" r="2.2" fill="#FFFFFF" opacity="0.25" />
</svg>`;

fs.writeFileSync('public/jasmine.svg', svg);
console.log('Generated: public/jasmine.svg (' + svg.length + ' bytes)');
