const sharp = require("sharp");
const path = require("path");

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#FAF9F7"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="8" height="${height}" fill="#C8501A"/>

  <!-- Inner card border -->
  <rect x="60" y="60" width="${width - 120}" height="${height - 120}"
        fill="none" stroke="#E5E0D8" stroke-width="1"/>

  <!-- Logo -->
  <text x="120" y="272"
        font-family="Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="96" font-weight="700" letter-spacing="-3">
    <tspan fill="#1A1A1A">Ramen</tspan><tspan fill="#C8501A">Hire</tspan>
  </text>

  <!-- Divider -->
  <rect x="120" y="302" width="64" height="4" fill="#C8501A"/>

  <!-- Tagline -->
  <text x="120" y="368"
        font-family="Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="38" font-weight="400" fill="#1A1A1A" letter-spacing="-0.5">
    Jobs at Bootstrapped, Profitable Startups
  </text>

  <!-- Subline -->
  <text x="120" y="420"
        font-family="Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="28" font-weight="400" fill="#6B6560">
    No VC pressure. No layoff roulette. Just calm companies hiring great people.
  </text>

  <!-- Domain badge -->
  <rect x="120" y="494" width="212" height="44" rx="8" fill="#1A1A1A"/>
  <text x="226" y="522"
        font-family="Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="22" font-weight="600" fill="#FAF9F7"
        text-anchor="middle">
    ramenhire.com
  </text>

  <!-- Bootstrapped badge -->
  <rect x="348" y="494" width="234" height="44" rx="8"
        fill="none" stroke="#5C7A5C" stroke-width="1.5"/>
  <text x="465" y="522"
        font-family="Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="22" font-weight="500" fill="#5C7A5C"
        text-anchor="middle">
    Bootstrapped Only ✓
  </text>

</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(__dirname, "../public/og-image.png"))
  .then(() => console.log("✓ public/og-image.png generated (1200×630)"))
  .catch((err) => { console.error("Error:", err); process.exit(1); });
