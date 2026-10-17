export interface Counts {
  words: number;
  lines: number;
  chars: number;
}

// Letras e números de qualquer idioma; hífen e apóstrofo só no meio da palavra.
const WORD = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;

export function words(text: string): string[] {
  return text.match(WORD) ?? [];
}

export function count(text: string): Counts {
  const lines = text === '' ? 0 : text.split(/\r?\n/).length - (/\r?\n$/.test(text) ? 1 : 0);
  return { words: words(text).length, lines, chars: [...text].length };
}

/** As `n` palavras mais frequentes, sem diferenciar maiúsculas; empate em ordem alfabética. */
export function topWords(text: string, n: number): [string, number][] {
  const freq = new Map<string, number>();
  for (const word of words(text)) {
    const key = word.toLocaleLowerCase('pt-BR');
    freq.set(key, (freq.get(key) ?? 0) + 1);
  }
  return [...freq]
    .sort(([a, ca], [b, cb]) => cb - ca || a.localeCompare(b, 'pt-BR'))
    .slice(0, n);
}
