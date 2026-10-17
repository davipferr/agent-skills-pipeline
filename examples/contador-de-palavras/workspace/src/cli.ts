import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { count, topWords } from './wordcount.ts';

export interface Io {
  readFile(path: string): string;
  readStdin(): string;
  out(line: string): void;
  err(line: string): void;
}

/** Roda o comando e devolve o código de saída. Separado do processo para dar para testar. */
export function run(argv: string[], io: Io): number {
  const { positionals, values } = parseArgs({ args: argv, allowPositionals: true, options: { top: { type: 'string' } } });
  const [file] = positionals;

  let text: string;
  try {
    text = file ? io.readFile(file) : io.readStdin();
  } catch {
    io.err(`arquivo não encontrado: ${file}`);
    return 1;
  }

  const { words, lines, chars } = count(text);
  io.out(`palavras: ${words}`);
  io.out(`linhas: ${lines}`);
  io.out(`caracteres: ${chars}`);

  if (values.top !== undefined) {
    const n = Number(values.top);
    if (!Number.isInteger(n) || n < 1) {
      io.err('--top precisa ser um inteiro maior que zero');
      return 1;
    }
    for (const [word, freq] of topWords(text, n)) io.out(`${word}: ${freq}`);
  }
  return 0;
}

// Só roda quando chamado direto (`node src/cli.ts`), não quando importado pelos testes.
if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  process.exitCode = run(process.argv.slice(2), {
    readFile: (path) => readFileSync(path, 'utf8'),
    readStdin: () => readFileSync(0, 'utf8'),
    out: (line) => console.log(line),
    err: (line) => console.error(line),
  });
}
