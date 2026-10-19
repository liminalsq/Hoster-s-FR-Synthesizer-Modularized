export function resolvePortamento(value, fallbackSeconds = 0.08, noteDuration = 0) {
  const normalizePortamento = (candidate, fallbackNoteDuration) => {
    if (candidate == null || candidate === "") {
      return Number.isFinite(fallbackSeconds) ? Math.max(0, Number(fallbackSeconds)) : 0;
    }
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (/^auto$/i.test(trimmed)) return Math.max(0, fallbackNoteDuration * 0.5);
      const parsed = parseFloat(trimmed);
      if (Number.isFinite(parsed)) return Math.max(0, parsed);
      return Number.isFinite(fallbackSeconds) ? Math.max(0, Number(fallbackSeconds)) : 0;
    }
    const parsed = Number(candidate);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
    return Number.isFinite(fallbackSeconds) ? Math.max(0, Number(fallbackSeconds)) : 0;
  };
  return normalizePortamento(value, noteDuration);
}

export function getPortamentoStartPitch(previous, current) {
  if (!previous || !current || !previous.pitchIsNote || !current.pitchIsNote) {
    return previous && current && !previous.pitchIsNote && !current.pitchIsNote && previous.pitch - current.pitch >= 50
      ? current.pitch - 10
      : previous?.pitch;
  }
  const downwardSemitones = 12 * Math.log2(previous.pitch / current.pitch);
  return downwardSemitones >= 4
    ? current.pitch * Math.pow(2, -1 / 12)
    : previous.pitch;
}

export function noteToFreq(note) {
  const A4 = 440;
  const semitoneMap = {
    C: -9, "C#": -8, Db: -8,
    D: -7, "D#": -6, Eb: -6,
    E: -5, F: -4, "F#": -3, Gb: -3,
    G: -2, "G#": -1, Ab: -1,
    A: 0, "A#": 1, Bb: 1, B: 2,
  };
  const match = /^([A-Ga-g])([#b]?)(\d)$/.exec(note);
  if (!match) return parseFloat(note);
  const [, base, accidental, octave] = match;
  const name = base.toUpperCase() + (accidental || "");
  const semitones = semitoneMap[name] ?? 0;
  const semitonesFromA4 = (parseInt(octave) - 4) * 12 + semitones;
  return A4 * Math.pow(2, semitonesFromA4 / 12);
}
