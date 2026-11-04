export type Card = { question: string; answer: string; line: number };
export type Warning = { line: number; message: string };
export type ConvertResult = { csv: string; cards: Card[]; warnings: Warning[] };

const BULLET = /^\s*(?:[-*]|\d+\.)\s+/;

export function convert(markdown: string, deck: string): ConvertResult {
  const cards: Card[] = [];
  const warnings: Warning[] = [];
  const seen = new Map<string, number>();
  let inCodeBlock = false;
  markdown.split("\n").forEach((raw, index) => {
    if (raw.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock || !raw.includes("::")) return;
    const text = raw.replace(BULLET, "");
    const sep = text.indexOf("::");
    const question = text.slice(0, sep).trim();
    const answer = text.slice(sep + 2).trim();
    const line = index + 1;
    if (question === "" || answer === "") {
      const side = question === "" ? "pergunta" : "resposta";
      warnings.push({ line, message: `${side} vazia, linha ignorada` });
      return;
    }
    const first = seen.get(question);
    if (first !== undefined) {
      warnings.push({ line, message: `pergunta repetida (já está na linha ${first}), linha ignorada` });
      return;
    }
    seen.set(question, line);
    cards.push({ question, answer, line });
  });
  const header = ["#separator:Comma", "#html:false", `#deck:${deck}`];
  const rows = cards.map((card) => `${csvField(card.question)},${csvField(card.answer)}`);
  return { csv: [...header, ...rows].join("\n") + "\n", cards, warnings };
}

function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
