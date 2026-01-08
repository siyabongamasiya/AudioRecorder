export function seededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
  };
}

export function generatePeaks(seed: string, bars = 40) {
  const rand = seededRandom(seed);
  const arr: number[] = [];
  for (let i = 0; i < bars; i++) {
    arr.push(0.05 + rand() * 0.95);
  }
  return arr;
}
