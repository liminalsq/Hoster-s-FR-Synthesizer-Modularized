export const MAP_FORMANTS = 6;
export const ENGINE_FORMANTS = 3;
export const ROSENBERG_GAIN_BOOST = 1.7;
export const NOISE_GAIN_BOOST = 1.55;

export const phonemeMap = {
  a:   { f: [700, 1220, 2600, 3500, 4500, 5500], voiced: true },
  ax:   { f: [620, 1220, 2550, 3500, 4500, 5500], voiced: true },
  ae:  { f: [620, 1660, 2430, 3700, 4700, 5700], voiced: true, morphTo: [650, 1490, 2470, 3700, 4700, 5700] },
  aa:  { f: [900, 1300, 2650, 3550, 4500, 5500], voiced: true },
  e:   { f: [530, 1680, 2500, 3600, 4600, 5600], voiced: true, morphTo: [620, 1530, 2530, 3600, 4600, 5600] },
  i:   { f: [350, 2200, 2900, 3600, 4500, 5500], voiced: true },
  ee:  { f: [285, 2275, 2900, 3650, 4650, 5650], voiced: true },
  o:   { f: [400, 1000, 2600, 3400, 4400, 5400], voiced: true },
  u:   { f: [350, 1250, 2200, 3300, 4300, 5300], voiced: true},
  y:   { f: [300, 2000, 2800, 3600, 4600, 5600], voiced: true },
  w:   { f: [290, 610, 2150, 3300, 4300, 5300], voiced: true },
  r:   { f: [450, 1300, 1700, 3200, 4300, 5300], voiced: true },
  l:   { f: [310, 1050, 2880, 3500, 4500, 5500], voiced: true },

  h:  { f: [750,  1750, 3150, 3800, 4800, 5800], breathy: true, amp: 0.9, voiced: false, noiseAmp: 1 },
  s:  { f: [320, 1390, 5500, 5900, 6800, 7800], breathy: true, amp: 1.4, voiced: false, noiseAmp: 1 },
  z:  { f: [240, 1390, 5500, 5800, 6700, 7700], breathy: true, amp: 1.4, voiced: true,  noiseAmp: 0.185 },
  zh: { f: [270, 1840, 2750, 5800, 6700, 7700], breathy: true, amp: 1.4, voiced: true,  noiseAmp: 0.2 },
  t:  { f: [400,  1600, 2600, 4900, 5900, 6900], burst: true, amp: 0.9, voiced: false, noiseAmp: 1.4, morphs: false },
  d:  { f: [200,  1600, 2600, 3800, 4800, 5800], breathy: true, burst: true, amp: 0.55, voiced: true, short: true, noiseAmp: 0.2, morphs: false },
  dx:  { f: [200,  1600, 2600, 3800, 4800, 5800], breathy: true, burst: true, amp: 0.55, voiced: true, short: true, noiseAmp: 0.02, morphs: false },
  k:  { f: [300, 1990, 2850, 4100, 5100, 6100], burst: true, short: true, voiced: false, noiseAmp: 1 },
  g:  { f: [200,  1990, 2850, 3600, 4600, 5600], breathy: true, burst: true, voiced: true, short: true, noiseAmp: 0.3, morphs: false },
  gx:  { f: [200,  1990, 2850, 3600, 4600, 5600], breathy: true, burst: true, voiced: true, short: true, noiseAmp: 0.035, morphs: false },

  n:  { f: [270,  1340, 2470, 3400, 4400, 5400], voiced: true, nasal: true, noiseAmp: 1 },
  m:  { f: [270,  1270, 2130, 3300, 4300, 5300], voiced: true, nasal: true, noiseAmp: 1 },
  b:  { f: [200,  1100, 2150, 3400, 4400, 5400], breathy: true, burst: true, voiced: true, short: true, noiseAmp: 0.35, morphs: false },
  bx:  { f: [200,  1100, 2150, 3400, 4400, 5400], breathy: true, burst: true, voiced: true, short: true, noiseAmp: 0.035, morphs: false },
  p:  { f: [400,  1100, 2150, 3600, 4600, 5600], burst: true, short: true, voiced: false, noiseAmp: 1 },
  f:  { f: [1150, 2950, 4950, 5900, 6800, 7800], breathy: true, voiced: false, noiseAmp: 1 },
  v:  { f: [220,  1100, 2080, 4200, 5200, 6200], breathy: true, voiced: true, noiseAmp: 0.225, amp: 0.575 },
  th: { f: [1150, 2150, 3450, 4500, 5500, 6500], breathy: true, voiced: false, noiseAmp: 1 },
  dh: { f: [270,  1290, 2540, 3800, 4800, 5800], breathy: true, voiced: true, noiseAmp: 0.25, amp: 0.55 },
  sh: { f: [2450, 3050, 3950, 4900, 5900, 6900], breathy: true, voiced: false, noiseAmp: 1 },
  ch: { f: [350, 1800, 2820, 5400, 6400, 7400], breathy: true, burst: true, voiced: false, noiseAmp: 1, usePinkNoise: true },
  uh: { f: [450,  1100,  2350, 3500, 4500, 5500], voiced: true },

  er: { f: [550, 1200, 2450, 3300, 4300, 5300], morphTo: [450, 1300, 1700, 3200, 4300, 5300], voiced: true },
  jh:  { f: [260, 1800, 2820, 3600, 4600, 5600], voiced: true, breathy: true, amp: 0.8, noiseAmp: 0.15 },
  ng: { f: [200, 850,  1950, 3300, 4300, 5300], voiced: true, nasal: true },

  oy: { f: [400, 1000, 2600, 3400, 4400, 5400], morphTo: [350, 2200, 2900, 3600, 4500, 5500], voiced: true },
  ow: { f: [400, 1000, 2600, 3400, 4400, 5400], morphTo: [290, 610, 2150, 3300, 4300, 5300], voiced: true },
  ou: { f: [400, 1000, 2600, 3400, 4400, 5400], morphTo: [325, 700,  2530, 3300, 4300, 5300], voiced: true },
  ol: { f: [400, 1000, 2600, 3400, 4400, 5400], morphTo: [310, 1050, 2880, 3500, 4500, 5500], voiced: true },
  or: { f: [400, 1000, 2600, 3400, 4400, 5400], morphTo: [450, 1300, 1700, 3200, 4300, 5300], voiced: true },

  ay: { f: [650, 1250, 2550, 3500, 4500, 5500], morphTo: [350, 2200, 2900, 3600, 4500, 5500], voiced: true },
  aw: { f: [650, 1250, 2550, 3500, 4500, 5500], morphTo: [400, 1000, 2600, 3400, 4400, 5400], voiced: true },
  ar: { f: [700, 1220, 2600, 3500, 4500, 5500], morphTo: [450, 1300, 1700, 3200, 4300, 5300], voiced: true },
  al: { f: [650, 1250, 2550, 3500, 4500, 5500], morphTo: [310, 1050, 2880, 3500, 4500, 5500], voiced: true },
  ao: { f: [650, 990, 2570, 3500, 4500, 5500], morphTo: [630, 1040, 2600, 3500, 4500, 5500], voiced: true },
  aee:{ f: [600, 1250, 2550, 3500, 4500, 5500], morphTo: [285, 2275, 2900, 3650, 4650, 5650], voiced: true },

  ew: { f: [300, 2000, 2800, 3600, 4600, 5600], morphTo: [325, 700,  2530, 3300, 4300, 5300], voiced: true },
  eu: { f: [300, 2000, 2800, 3600, 4600, 5600], morphTo: [325, 700,  2530, 3300, 4300, 5300], voiced: true },
  ey: { f: [530, 1680, 2500, 3600, 4600, 5600], morphTo: [300, 2000, 2800, 3600, 4600, 5600], voiced: true },
  el: { f: [530, 1680, 2500, 3600, 4600, 5600], morphTo: [310, 1050, 2880, 3500, 4500, 5500], voiced: true },
  ex: { f: [500, 1700, 2300, 3600, 4600, 5600], voiced: true },

  uw: { f: [350, 1250, 2200, 3300, 4300, 5300], morphTo: [320, 900, 2200, 3300, 4300, 5300], voiced: true },
  ul: { f: [350, 1250, 2200, 3300, 4300, 5300], morphTo: [310, 1050, 2880, 3500, 4500, 5500], voiced: true },
  ur: { f: [350, 1250, 2200, 3300, 4300, 5300], morphTo: [420, 1300, 1700, 3200, 4300, 5300], voiced: true },

  iw: { f: [300, 2000, 2800, 3600, 4600, 5600], morphTo: [325, 700,  2530, 3300, 4300, 5300], voiced: true },
  il: { f: [300, 2000, 2800, 3600, 4600, 5600], morphTo: [310, 1050, 2880, 3500, 4500, 5500], voiced: true },
  ir: { f: [300, 2000, 2800, 3600, 4600, 5600], morphTo: [420, 1300, 1700, 3200, 4300, 5300], voiced: true },
  iy: { f: [300, 2000, 2800, 3600, 4600, 5600], morphTo: [285, 2275, 2900, 3650, 4650, 5650], voiced: true },

  ih: { f: [400, 1800, 2570, 3600, 4600, 5600], morphTo: [470, 1600, 2600, 3600, 4500, 5500], voiced: true },

  rest: { f: [0, 0, 0, 0, 0, 0], voiced: false, burst: false, short: false, breathy: false }
};

export const arpabetMap = {
  "AA":["aa"],"AE":["a"],"AH":["uh"],"AO":["o"],"AW":["aw"],
  "AY":["aa"],"EH":["e"],"ER":["er"],"EY":["ee"],"IH":["I"],
  "IY":["ee"],"OW":["o"],"OY":["oy"],"UH":["uh"],"UW":["u"],
  "B":["b"],"CH":["ch"],"D":["d"],"DH":["th"],"F":["f"],"G":["g"],
  "HH":["h"],"JH":["jh"],"K":["k"],"L":["l"],"M":["m"],"N":["n"],
  "NG":["ng"],"P":["p"],"R":["r"],"S":["s"],"SH":["sh"],"T":["t"],
  "TH":["th"],"V":["v"],"W":["w"],"Y":["y"],"Z":["z"],"ZH":["z"]
};

export const DYNAMIC_CONSONANTS = new Set([
  "h", "n", "m", "s", "z", "t", "d", "r", "l", "b", "p", "k", "g",
  "f", "v", "w", "y", "th", "dh", "sh", "ch", "jh", "ng", "dx", "gx", "bx",
  "zh",
]);
export const DYNAMIC_STOPS = new Set(["t", "p", "d", "b", "k", "g", "dx", "bx", "gx"]);
