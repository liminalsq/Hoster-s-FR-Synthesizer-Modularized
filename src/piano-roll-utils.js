export const BRACKET_SETTING_DEFAULTS = {
  fs: "", vf: "", vd: "", vde: "", vfa: "", vfao: "", slide: "", fmorph: "", portamento: ""
};

export const CONSONANT_PHONEMES = new Set([
  "h","s","z","t","d","k","g","b","p","f","v","th","dh","sh","ch",
  "j","ng","r","l",
]);

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export function parsePianoRollFromText(text, bpm, gridType, stepsPerBeat) {
  const beatLen = 60 / bpm;
  const regex = /(\[[^\]]*\])?\s*([a-zA-Z']+)\s*<\s*([^>]+)\s*>/gi;
  const notes = [];
  let currentPitchName = "C4";
  let currentSettings = { ...BRACKET_SETTING_DEFAULTS };
  let match;
  let startBeat = 0;
  while ((match = regex.exec(text)) !== null) {
    const bracketText = match[1] || "";
    const phoneme = match[2].toLowerCase();
    const fields = match[3].split(",").map(field => field.trim());
    if (/\breset\b/i.test(bracketText)) currentSettings = { ...BRACKET_SETTING_DEFAULTS };
    const settingMatches = /\b(fs|vf|vd|vde|vdae|vfa|vfao|sl|slide|fm|fmorph|port|portamento|pt)\s*(?::|=)?\s*(auto|-?(?:\d+(?:\.\d*)?|\.\d+))/gi;
    let settingMatch;
    while ((settingMatch = settingMatches.exec(bracketText)) !== null) {
      let settingName = settingMatch[1].toLowerCase();
      if (settingName === "vdae") settingName = "vde";
      if (settingName === "sl") settingName = "slide";
      if (settingName === "fm") settingName = "fmorph";
      if (settingName === "port" || settingName === "pt") settingName = "portamento";
      currentSettings[settingName] = settingMatch[2];
    }
    const hasExplicitPitch = fields.length > 1;
    if (hasExplicitPitch) currentPitchName = fields[0];
    const pitchRaw = currentPitchName;
    const units = parseFloat(hasExplicitPitch ? fields[1] : fields[0]);
    if (!Number.isFinite(units)) continue;

    let durSec = 0;
    if (gridType === "beats") durSec = units * beatLen;
    else if (gridType === "steps") durSec = (units / stepsPerBeat) * beatLen;
    else if (gridType === "seconds") durSec = units;
    else durSec = units * beatLen;

    const durBeats = durSec / beatLen;
    const midiNote = pitchNameToMidi(pitchRaw);

    if (phoneme !== "rest" && midiNote !== null) {
      notes.push({
        phoneme,
        pitchName: pitchRaw,
        midiNote,
        startBeat,
        durBeats,
        bracketSettings: { ...currentSettings }
      });
    }
    startBeat += durBeats;
  }
  return notes;
}

export function pitchNameToMidi(name) {
  const match = /^([A-Ga-g])([#b]?)(\d)$/.exec(name);
  if (!match) return null;
  const [, base, accidental, octave] = match;
  const semitoneOffsets = { C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11 };
  const key = base.toUpperCase() + accidental;
  const semitone = semitoneOffsets[key];
  if (semitone === undefined) return null;
  return (parseInt(octave) + 1) * 12 + semitone;
}

export function midiToNoteName(midi) {
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return `${name}${octave}`;
}

export function getMidiRange(notes) {
  if (notes.length === 0) return { min: 48, max: 84 };
  let min = 127, max = 0;
  for (const note of notes) {
    if (note.midiNote < min) min = note.midiNote;
    if (note.midiNote > max) max = note.midiNote;
  }
  min = Math.max(0, min - 4);
  max = Math.min(127, max + 4);
  if (max - min < 24) max = min + 24;
  return { min, max };
}

export function getTotalBeats(notes) {
  let max = 4;
  for (const note of notes) {
    const end = note.startBeat + note.durBeats;
    if (end > max) max = end;
  }
  return max + 2;
}

export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}
