// Pure Fisher-Yates (Knuth) Shuffle & Romaji / Japanese Answer Verification Engine

/**
 * Pure Fisher-Yates Shuffle (Knuth Shuffle)
 * Guarantees uniform O(n) unbiased permutation for:
 * 1. Sampling questions from the Question Pool
 * 2. Randomizing question sequence (1..50 / 1..100)
 * 3. Randomizing multiple choice options (A, B, C, D)
 */
export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Normalizes user input for Essay / Active Recall typing mode.
 * Case-insensitive, strips punctuation and extra spaces, and normalizes common Hepburn/Kunrei-shiki equivalents.
 */
export function normalizeRomaji(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[.,!?'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ō/g, 'ou')
    .replace(/ū/g, 'uu')
    .replace(/ā/g, 'aa')
    .replace(/ī/g, 'ii')
    .replace(/ē/g, 'ee');
}

/**
 * Generates phonetic variants so standard Japanese typing variations are accepted seamlessly
 * (e.g., shi/si, chi/ti, tsu/tu, fu/hu, sha/sya, cha/tya, ja/jya/zya, wo/o).
 */
export function expandRomajiVariants(baseRomaji: string): string[] {
  const norm = normalizeRomaji(baseRomaji);
  const variants = new Set<string>([norm, norm.replace(/\s+/g, '')]);

  const replacements: Array<[RegExp, string]> = [
    [/shi/g, 'si'],
    [/si/g, 'shi'],
    [/chi/g, 'ti'],
    [/ti/g, 'chi'],
    [/tsu/g, 'tu'],
    [/tu/g, 'tsu'],
    [/fu/g, 'hu'],
    [/hu/g, 'fu'],
    [/sha/g, 'sya'],
    [/shu/g, 'syu'],
    [/sho/g, 'syo'],
    [/cha/g, 'tya'],
    [/chu/g, 'tyu'],
    [/cho/g, 'tyo'],
    [/ja/g, 'jya'],
    [/ju/g, 'jyu'],
    [/jo/g, 'jyo'],
    [/ja/g, 'zya'],
    [/ju/g, 'zyu'],
    [/jo/g, 'zyo'],
    [/ji/g, 'zi'],
    [/wo/g, 'o'],
    [/tch/g, 'cch'],
  ];

  for (const [pattern, replacement] of replacements) {
    for (const current of Array.from(variants)) {
      const modified = current.replace(pattern, replacement);
      variants.add(modified);
      variants.add(modified.replace(/\s+/g, ''));
    }
  }

  return Array.from(variants);
}

/**
 * Verifies if the user's typed answer matches any of the accepted answers
 * (supports Romaji variations, Kana direct input, or Indonesian meaning).
 */
export function checkEssayAnswer(userInput: string, acceptedAnswers: string[]): boolean {
  const cleanedUser = normalizeRomaji(userInput);
  if (!cleanedUser) return false;
  const cleanedUserNoSpace = cleanedUser.replace(/\s+/g, '');

  for (const accepted of acceptedAnswers) {
    const variants = expandRomajiVariants(accepted);
    if (variants.includes(cleanedUser) || variants.includes(cleanedUserNoSpace)) {
      return true;
    }
  }

  return false;
}
