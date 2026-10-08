import { useMemo, useState } from "react";
import "./ColorTheory.css";

const PRESET_COLORS = [
  { name: "Ivory", hex: "#F4EEE2" },
  { name: "Camel", hex: "#C8A165" },
  { name: "Navy", hex: "#1E3E74" },
  { name: "Burgundy", hex: "#6B2130" },
  { name: "Emerald", hex: "#2F6B4F" },
  { name: "Charcoal", hex: "#2E2E2E" },
];

const WHEEL_INNER = 0.42;

const HUE_NAMES = [
  [16, "Red"],
  [40, "Vermilion"],
  [56, "Amber"],
  [70, "Yellow"],
  [90, "Chartreuse"],
  [150, "Green"],
  [176, "Teal"],
  [196, "Cyan"],
  [216, "Azure"],
  [246, "Blue"],
  [266, "Indigo"],
  [292, "Violet"],
  [330, "Magenta"],
  [346, "Pink"],
  [360, "Red"],
];

function parseHex(value) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return "#" + raw.toUpperCase();
  return null;
}

function hexToHsl(hex) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }
  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex({ h, s, l }) {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n) =>
    Math.round(255 * (lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  const toHex = (channel) => channel.toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

function luminance(hex) {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => {
    const c = parseInt(value.slice(offset, offset + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function describeColor({ h, s, l }) {
  if (s <= 10) {
    if (l <= 18) return "Charcoal";
    if (l <= 40) return "Slate";
    if (l <= 66) return "Dove Grey";
    if (l <= 88) return "Silver";
    return "Ivory";
  }
  const base = HUE_NAMES.find(([max]) => h < max)?.[1] ?? "Red";
  let modifier = "";
  if (l <= 32) modifier = "Deep ";
  else if (l <= 44) modifier = "Smoky ";
  else if (l >= 86) modifier = "Washed ";
  else if (l >= 74) modifier = "Pale ";
  return modifier + base;
}

function recommendPair(hsl) {
  if (hsl.s <= 10) {
    const light = hsl.l >= 55;
    return {
      hsl: { h: light ? 222 : 16, s: light ? 55 : 62, l: light ? 38 : 46 },
      relation: "Neutral Contrast",
    };
  }
  return {
    hsl: {
      h: (hsl.h + 180) % 360,
      s: Math.min(100, Math.max(45, hsl.s)),
      l: Math.min(66, Math.max(34, hsl.l)),
    },
    relation: "Complementary",
  };
}

function buildReason(selected, pair) {
  const selName = describeColor(selected);
  const pairName = describeColor(pair);
  const selHex = hslToHex(selected);
  const pairHex = hslToHex(pair);
  const selectedIsAnchor = luminance(selHex) < luminance(pairHex);
  const anchorName = selectedIsAnchor ? selName : pairName;
  const accentName = selectedIsAnchor ? pairName : selName;

  if (pair.relation === "Neutral Contrast") {
    return {
      reason: `${selName} is a neutral, so it absorbs light instead of competing with it. We counter it with ${pairName} — a saturated anchor that gives the outfit a focal point without clashing. Keep the ${selName.toLowerCase()} pieces as your base layer and repeat ${pairName.toLowerCase()} once at the edges (knitwear, shoes, bag) so the contrast reads considered rather than loud.`,
      ratio: `70% ${anchorName} · 30% ${accentName}`,
    };
  }

  return {
    reason: `${selName} and ${pairName} sit directly opposite each other — 180° apart on the color wheel. Opposing hues stimulate the eye equally and cancel into balance, so the pairing reads as intentional contrast instead of a clash. ${anchorName} carries the deeper visual weight here, so let it lead the outfit (coat, trousers, dress) and echo ${accentName.toLowerCase()} in a single accent piece to sharpen the look.`,
    ratio: `70% ${anchorName} · 30% ${accentName}`,
  };
}

function markerPosition({ h, s }) {
  const radius = WHEEL_INNER + (1 - WHEEL_INNER) * (s / 100);
  const rad = (h * Math.PI) / 180;
  return {
    left: `${50 + radius * 50 * Math.sin(rad)}%`,
    top: `${50 - radius * 50 * Math.cos(rad)}%`,
  };
}

function ColorTheory() {
  const [hsl, setHsl] = useState(() => hexToHsl("#1E3E74"));
  const [hexDraft, setHexDraft] = useState("#1E3E74");

  const hex = hslToHex(hsl);
  const [prevHex, setPrevHex] = useState(hex);
  if (prevHex !== hex) {
    setPrevHex(hex);
    setHexDraft(hex);
  }

  const pair = useMemo(() => recommendPair(hsl), [hsl]);
  const pairHex = hslToHex(pair.hsl);

  const info = useMemo(
    () => buildReason(describeColor(hsl), describeColor(pair.hsl)),
    [hsl, pair]
  );
  const selectedName = useMemo(() => describeColor(hsl), [hsl]);
  const pairName = useMemo(() => describeColor(pair.hsl), [pair]);

  const handleWheelPick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    const distance = Math.hypot(dx, dy);
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const h = Math.round((angle + 360) % 360);
    const s = Math.round(
      Math.min(100, Math.max(0, ((distance - WHEEL_INNER) / (1 - WHEEL_INNER)) * 100))
    );
    setHsl((prev) => ({ ...prev, h, s }));
  };

  const handleWheelKey = (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    setHsl((prev) => ({
      ...prev,
      h:
        event.key === "ArrowLeft"
          ? (prev.h + 355) % 360
          : event.key === "ArrowRight"
            ? (prev.h + 5) % 360
            : prev.h,
      s:
        event.key === "ArrowUp"
          ? Math.min(100, prev.s + 5)
          : event.key === "ArrowDown"
            ? Math.max(0, prev.s - 5)
            : prev.s,
    }));
  };

  const handleHexInput = (value) => {
    setHexDraft(value);
    const parsed = parseHex(value);
    if (parsed) setHsl(hexToHsl(parsed));
  };

  return (
    <section className="ct" aria-label="Color Theory Styling Guide">
      <div className="ct__header">
        <span className="ct__kicker">COLOR THEORY STUDIO</span>
        <h2 className="ct__title">Pair Colors Like a Stylist</h2>
        <p className="ct__subtitle">
          Choose a color from the wheel or enter your own — Attirely returns its
          contrasting counterpart and the reasoning behind the pairing.
        </p>
      </div>

      <div className="ct__body">
        {/* Controls */}
        <div className="ct__controls">
          <div
            className="ct-wheel"
            role="button"
            tabIndex={0}
            onClick={handleWheelPick}
            onKeyDown={handleWheelKey}
            aria-label="Color wheel — click or use arrow keys to choose hue and saturation"
          >
            <span className="ct-wheel__disc" />
            <span className="ct-wheel__sat" />
            <span className="ct-wheel__hub" style={{ background: hex }} />
            <span
              className="ct-marker ct-marker--selected"
              style={markerPosition(hsl)}
            />
            <span
              className="ct-marker ct-marker--pair"
              style={markerPosition(pair.hsl)}
            />
          </div>

          <div className="ct-legend">
            <span className="ct-legend__item">
              <i className="ct-dot ct-dot--selected" /> Your color
            </span>
            <span className="ct-legend__item">
              <i className="ct-dot ct-dot--pair" /> Recommended pair
            </span>
          </div>

          <div className="ct-field">
            <label className="ct-field__label" htmlFor="ct-hex">
              Enter a color
            </label>
            <div className="ct-field__row">
              <input
                id="ct-hex"
                className="ct-hex-input"
                value={hexDraft}
                onChange={(event) => handleHexInput(event.target.value)}
                spellCheck={false}
                maxLength={7}
                placeholder="#1E3E74"
              />
              <label className="ct-picker" style={{ background: hex }}>
                <input
                  type="color"
                  value={hex}
                  onChange={(event) => setHsl(hexToHsl(event.target.value))}
                  aria-label="Open system color picker"
                />
              </label>
            </div>
          </div>

          <div className="ct-field">
            <span className="ct-field__label">
              <span>Depth</span>
              <span>{hsl.l}%</span>
            </span>
            <input
              type="range"
              className="ct-slider"
              min="12"
              max="88"
              value={hsl.l}
              onChange={(event) =>
                setHsl((prev) => ({ ...prev, l: Number(event.target.value) }))
              }
              aria-label="Color lightness"
            />
          </div>

          <div className="ct-field">
            <span className="ct-field__label">Try a preset</span>
            <div className="ct-presets">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  className={`ct-preset ${
                    hex === preset.hex.toUpperCase() ? "ct-preset--active" : ""
                  }`}
                  style={{ background: preset.hex }}
                  onClick={() => setHsl(hexToHsl(preset.hex))}
                  aria-label={`Use ${preset.name}`}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation panel */}
        <aside className="ct-panel" aria-live="polite">
          <div className="ct-panel__badge">
            <span>RECOMMENDED PAIR</span>
            <span className="ct-panel__relation">{pair.relation}</span>
          </div>

          <div className="ct-swatches">
            <div className="ct-swatch">
              <span className="ct-swatch__chip" style={{ background: hex }} />
              <span className="ct-swatch__role">Your color</span>
              <strong className="ct-swatch__name">{selectedName}</strong>
              <span className="ct-swatch__hex">{hex}</span>
            </div>
            <span className="ct-swatches__arrow" aria-hidden="true">
              →
            </span>
            <div className="ct-swatch">
              <span
                className="ct-swatch__chip ct-swatch__chip--pair"
                style={{ background: pairHex }}
              />
              <span className="ct-swatch__role">Pair with</span>
              <strong className="ct-swatch__name">{pairName}</strong>
              <span className="ct-swatch__hex">{pairHex}</span>
            </div>
          </div>

          <div className="ct-notes">
            <div className="ct-note">
              <span className="ct-note__label">Why they work:</span>
              <p className="ct-note__text">{info.reason}</p>
            </div>
            <div className="ct-note ct-note--row">
              <span className="ct-note__label">Wear the ratio:</span>
              <span className="ct-note__value">{info.ratio}</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ColorTheory;
