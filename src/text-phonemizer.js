import { arpabetMap } from "./phonemes.js";

const CMUDICT_URL = "https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict";

export function createTextPhonemizer({ getPersonalDict, shouldUseCMUDict }) {
  let cmuDict = null;

  async function loadCMUDict(url = CMUDICT_URL) {
    if (cmuDict) return cmuDict;
    const response = await fetch(url);
    if (!response.ok) throw new Error("failed to fetch CMUdict: " + response.status);
    const text = await response.text();
    const map = new Map();
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.startsWith(";;;")) continue;
      const match = line.match(/^([A-Z'()]+)\s+(.*)$/);
      if (!match) continue;
      const wordRaw = match[1].replace(/\(\d+\)$/, "");
      const word = wordRaw.toLowerCase();
      const arpabet = match[2].trim().split(/\s+/);
      if (!map.has(word)) map.set(word, arpabet);
    }
    cmuDict = map;
    return cmuDict;
  }

  function arpabetToKeys(arpabet) {
    const phonemes = [];
    for (let token of arpabet) {
      token = token.replace(/\d+$/, "");
      const mapped = arpabetMap[token];
      if (mapped) phonemes.push(...mapped);
      else phonemes.push(token.toLowerCase());
    }
    return phonemes;
  }

  async function textToPhonemes(word) {
    if (!word || !word.trim()) return [];
    const normalizedWord = word.toLowerCase().replace(/[^a-z']/g, "");
    if (normalizedWord.length === 0) return [];

    const personalDict = getPersonalDict();
    if (personalDict[normalizedWord]) {
      return personalDict[normalizedWord].slice();
    }

    if (shouldUseCMUDict()) {
      try {
        await loadCMUDict();
        if (cmuDict && cmuDict.has(normalizedWord)) {
          return arpabetToKeys(cmuDict.get(normalizedWord).slice());
        }
      } catch (error) {
        console.warn("CMUdict load/lookup failed:", error);
      }
    }

    const multigraphRules = [
      ["tion", ["sh","uh","n"]], ["tch", ["ch"]], ["ch", ["ch"]], ["sh", ["sh"]],
      ["ph", ["f"]], ["ng", ["ng"]], ["jh", ["jh"]], ["qu", ["k","w"]], ["wh", ["w"]],
      ["kn", ["n"]], ["wr", ["r"]], ["ee", ["ee"]], ["ea", ["ee"]],
      ["ai", ["aa"]], ["ay", ["aa"]], ["oa", ["o"]], ["oo", ["u"]],
      ["ow", ["o"]], ["oy", ["oy"]], ["au", ["aw"]], ["ough", ["o"]]
    ];
    multigraphRules.sort((a, b) => b[0].length - a[0].length);

    const single = {
      a:"a", b:"b", c:"c", d:"d", e:"e", f:"f", g:"g", h:"h",
      i:"i", j:"j", k:"k", l:"l", m:"m", n:"n", o:"o", p:"p",
      q:"q", r:"r", s:"s", t:"t", u:"u", v:"v", w:"w", x:"x", y:"y", z:"z"
    };

    const phonemes = [];
    let index = 0;
    while (index < normalizedWord.length) {
      let matched = false;
      for (const [pattern, mappedPhonemes] of multigraphRules) {
        if (normalizedWord.startsWith(pattern, index)) {
          phonemes.push(...mappedPhonemes);
          index += pattern.length;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      if (normalizedWord[index] === "'") { index++; continue; }
      const character = normalizedWord[index];
      if (character === "c") {
        const next = normalizedWord[index + 1] || "";
        phonemes.push(...("eiy".includes(next) ? ["s"] : ["k"]));
        index++;
        continue;
      }
      if (character === "g") {
        const next = normalizedWord[index + 1] || "";
        phonemes.push(...("eiy".includes(next) ? ["j"] : ["g"]));
        index++;
        continue;
      }
      if (character === "x") {
        phonemes.push("k", "s");
        index++;
        continue;
      }
      if (single[character]) phonemes.push(single[character]);
      else phonemes.push(character);
      index++;
    }
    return phonemes;
  }

  return { loadCMUDict, textToPhonemes };
}
