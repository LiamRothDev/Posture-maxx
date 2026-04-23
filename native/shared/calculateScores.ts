// Pure function — no React, no DOM, no RN. Portable 1:1 with web prototype.
// Input: { side, front, back } each = Keypoint[33] | null (BlazePose schema).
// Output: { overall: Grade | null, zones: [...] }

import type {
  ComputedScores,
  Grade,
  Keypoint,
  KeypointArray,
  PoseResults,
  ScoreZone,
} from './types';

export const LM = {
  NOSE: 0,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

const visible = (p: Keypoint | undefined, t = 0.3): p is Keypoint =>
  !!p && (p.visibility ?? 1) >= t;

const mid = (a: Keypoint, b: Keypoint) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const angleFromVertical = (a: Keypoint, b: Keypoint) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  return Math.abs((Math.atan2(Math.abs(dx), Math.abs(dy)) * 180) / Math.PI);
};

const angleAt = (a: Keypoint, b: Keypoint, c: Keypoint) => {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (!m1 || !m2) return 180;
  return (Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180) / Math.PI;
};

const gradeFromBands = (val: number | null, bands: [number, number, number, number]): Grade | null => {
  if (val == null || isNaN(val)) return null;
  if (val < bands[0]) return 'A';
  if (val < bands[1]) return 'B';
  if (val < bands[2]) return 'C';
  if (val < bands[3]) return 'D';
  return 'F';
};

const median = (xs: (Grade | null)[]): Grade | null => {
  const clean = xs.filter((x): x is Grade => x != null);
  if (!clean.length) return null;
  const rank = { A: 0, B: 1, C: 2, D: 3, F: 4 } as const;
  const sorted = [...clean].sort((a, b) => rank[a] - rank[b]);
  return sorted[Math.floor(sorted.length / 2)];
};

const pick = (arr: KeypointArray, idx: number) => arr[idx];

export function calculateScores({ side, front, back }: PoseResults): ComputedScores {
  const zones: ScoreZone[] = [];

  // 1. Head forward — side: ear→shoulder vs vertical
  let headAngle: number | null = null, headGrade: Grade | null = null;
  if (side) {
    const ear = visible(pick(side, LM.LEFT_EAR)) ? pick(side, LM.LEFT_EAR)
              : visible(pick(side, LM.RIGHT_EAR)) ? pick(side, LM.RIGHT_EAR) : null;
    const shoulder = visible(pick(side, LM.LEFT_SHOULDER)) ? pick(side, LM.LEFT_SHOULDER)
                   : visible(pick(side, LM.RIGHT_SHOULDER)) ? pick(side, LM.RIGHT_SHOULDER) : null;
    if (ear && shoulder) {
      headAngle = angleFromVertical(shoulder, ear);
      headGrade = gradeFromBands(headAngle, [5, 10, 15, 20]);
    }
  }
  zones.push({ key: 'head', score: headGrade, angleDeg: headAngle });

  // 2. Shoulders — front: height diff / shoulder width (%)
  let shDiff: number | null = null, shGrade: Grade | null = null;
  if (front) {
    const l = pick(front, LM.LEFT_SHOULDER);
    const r = pick(front, LM.RIGHT_SHOULDER);
    if (visible(l) && visible(r)) {
      const width = Math.abs(l.x - r.x);
      if (width > 0.02) {
        shDiff = (Math.abs(l.y - r.y) / width) * 100;
        shGrade = gradeFromBands(shDiff, [1.5, 3, 5, 8]);
      }
    }
  }
  zones.push({ key: 'shoulders', score: shGrade, angleDeg: shDiff });

  // 3. Spine — back: shoulder-mid → hip-mid vs vertical
  let spAngle: number | null = null, spGrade: Grade | null = null;
  if (back) {
    const ls = pick(back, LM.LEFT_SHOULDER), rs = pick(back, LM.RIGHT_SHOULDER);
    const lh = pick(back, LM.LEFT_HIP), rh = pick(back, LM.RIGHT_HIP);
    if (visible(ls) && visible(rs) && visible(lh) && visible(rh)) {
      spAngle = angleFromVertical(mid(lh, rh), mid(ls, rs));
      spGrade = gradeFromBands(spAngle, [3, 6, 10, 15]);
    }
  }
  zones.push({ key: 'spine', score: spGrade, angleDeg: spAngle });

  // 4. Pelvis — front: hip height diff / hip width (%)
  let pvDiff: number | null = null, pvGrade: Grade | null = null;
  if (front) {
    const l = pick(front, LM.LEFT_HIP), r = pick(front, LM.RIGHT_HIP);
    if (visible(l) && visible(r)) {
      const width = Math.abs(l.x - r.x);
      if (width > 0.02) {
        pvDiff = (Math.abs(l.y - r.y) / width) * 100;
        pvGrade = gradeFromBands(pvDiff, [1, 2, 4, 7]);
      }
    }
  }
  zones.push({ key: 'pelvis', score: pvGrade, angleDeg: pvDiff });

  // 5. Knees — side: hip-knee-ankle, deviation from 180°
  let knAngle: number | null = null, knGrade: Grade | null = null;
  if (side) {
    const hip = visible(pick(side, LM.LEFT_HIP)) ? pick(side, LM.LEFT_HIP)
              : visible(pick(side, LM.RIGHT_HIP)) ? pick(side, LM.RIGHT_HIP) : null;
    const knee = visible(pick(side, LM.LEFT_KNEE)) ? pick(side, LM.LEFT_KNEE)
               : visible(pick(side, LM.RIGHT_KNEE)) ? pick(side, LM.RIGHT_KNEE) : null;
    const ankle = visible(pick(side, LM.LEFT_ANKLE)) ? pick(side, LM.LEFT_ANKLE)
                : visible(pick(side, LM.RIGHT_ANKLE)) ? pick(side, LM.RIGHT_ANKLE) : null;
    if (hip && knee && ankle) {
      knAngle = Math.abs(180 - angleAt(hip, knee, ankle));
      knGrade = gradeFromBands(knAngle, [5, 10, 15, 20]);
    }
  }
  zones.push({ key: 'knees', score: knGrade, angleDeg: knAngle });

  const overall = median(zones.map((z) => z.score));
  return { overall, zones };
}
