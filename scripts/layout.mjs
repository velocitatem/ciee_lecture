/**
 * impress.js step layouts (data-x/y/z, rotate-*). Units: px / degrees.
 * @see https://github.com/impress/impress.js/blob/master/DOCUMENTATION.md
 */

function round(n) {
  return Math.round(n * 100) / 100;
}

/** @param {Record<string, string | number>} attrs */
export function formatDataAttrs(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
}

/**
 * @param {string | undefined} overrideFromComment
 * @returns {Record<string, string>}
 */
function parseImpressComment(overrideFromComment) {
  if (!overrideFromComment?.trim()) return {};
  const out = {};
  const re = /(data-[a-z0-9-]+)\s*=\s*"([^"]*)"/gi;
  let m;
  while ((m = re.exec(overrideFromComment)) !== null) {
    out[m[1]] = m[2];
  }
  return out;
}

/**
 * @param {Record<string, string | number>} base
 * @param {Record<string, string>} overrides
 */
function mergeAttrs(base, overrides) {
  const o = { ...base };
  for (const [k, v] of Object.entries(overrides)) {
    o[k] = v;
  }
  return o;
}

/**
 * @param {object} meta
 * @param {number} index
 * @param {number} total
 */
export function computeStepAttrs(meta, index, total, commentOverride) {
  const layout = meta.layout ?? "depth-tilt";
  const n = Math.max(total, 1);
  const i = index;

  const opts = meta.layoutOptions ?? {};

  let base = {};

  switch (layout) {
    case "linear": {
      const w = meta.stepWidth;
      base = {
        "data-x": i * w,
        "data-y": 0,
        "data-z": 0,
        "data-rotate-x": 0,
        "data-rotate-y": 0,
        "data-rotate": 0,
        "data-scale": 1,
      };
      break;
    }
    case "depth-tilt": {
      const w = meta.stepWidth;
      const zStep = Number(opts.zStep ?? 90);
      const ry = Number(opts.rotateYPerStep ?? 5);
      const rz = Number(opts.rotateZPerStep ?? 0);
      base = {
        "data-x": i * w,
        "data-y": 0,
        "data-z": -i * zStep,
        "data-rotate-x": 0,
        "data-rotate-y": i * ry,
        "data-rotate": i * rz,
        "data-scale": 1,
      };
      break;
    }
    case "helix": {
      const turns = Number(opts.turns ?? 1.25);
      const radius = Number(opts.radius ?? 2200);
      const yStep = Number(opts.verticalSpread ?? 350);
      const angle = (i / Math.max(n - 1, 1)) * turns * 2 * Math.PI;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + radius * 0.35;
      const y = (i - (n - 1) / 2) * yStep;
      base = {
        "data-x": round(x),
        "data-y": round(y),
        "data-z": round(z),
        "data-rotate-x": 0,
        "data-rotate-y": round((angle * 180) / Math.PI),
        "data-rotate": 0,
        "data-scale": 1,
      };
      break;
    }
    case "orbit": {
      const radius = Number(opts.radius ?? 2600);
      const arc = Number(opts.arcDegrees ?? 110);
      const t = n <= 1 ? 0.5 : i / (n - 1);
      const angle = (t - 0.5) * ((arc * Math.PI) / 180);
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + radius;
      const y = Number(opts.y ?? 0);
      base = {
        "data-x": round(x),
        "data-y": y,
        "data-z": round(z),
        "data-rotate-x": 0,
        "data-rotate-y": round((-angle * 180) / Math.PI),
        "data-rotate": 0,
        "data-scale": 1,
      };
      break;
    }
    case "zoom-stack": {
      const w = meta.stepWidth;
      const zStep = Number(opts.zStep ?? 500);
      const scaleStep = Number(opts.scaleStep ?? 0.08);
      const s = Math.max(0.35, 1 - i * scaleStep);
      base = {
        "data-x": i * w * 0.15,
        "data-y": 0,
        "data-z": -i * zStep,
        "data-rotate-x": 0,
        "data-rotate-y": i * Number(opts.rotateYPerStep ?? 12),
        "data-rotate": 0,
        "data-scale": round(s),
      };
      break;
    }
    default: {
      const w = meta.stepWidth;
      base = {
        "data-x": i * w,
        "data-y": 0,
        "data-z": 0,
        "data-rotate-x": 0,
        "data-rotate-y": 0,
        "data-rotate": 0,
        "data-scale": 1,
      };
    }
  }

  const fromComment = parseImpressComment(commentOverride);
  return formatDataAttrs(mergeAttrs(base, fromComment));
}
