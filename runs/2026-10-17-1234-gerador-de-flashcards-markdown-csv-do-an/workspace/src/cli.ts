import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { convert } from "./convert.ts";

export type Io = { stdout(text: string): void; stderr(text: string): void };

const processIo: Io = {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
};

export async function run(args: string[], io: Io = processIo): Promise<number> {
  const parsed = parseArgs(args);
  if (parsed === undefined) {
    io.stderr(`${USAGE}\n`);
    return 2;
  }
  const { input } = parsed;
  let { output } = parsed;
  const deck = basename(input, extname(input));
  output ??= join(dirname(input), `${deck}.csv`);
  if (samePath(input, output)) {
    io.stderr(`erro: a saída ${output} é o próprio arquivo de entrada\n`);
    return 1;
  }

  let markdown: string;
  try {
    markdown = await readFile(input, "utf8");
  } catch (error) {
    io.stderr(`erro: não foi possível ler ${input}: ${describe(error)}\n`);
    return 1;
  }
  const { csv, cards, warnings } = convert(markdown, deck);
  for (const w of warnings) io.stderr(`aviso: linha ${w.line}: ${w.message}\n`);
  if (cards.length === 0) {
    io.stderr(`erro: nenhum card válido em ${input}; nada foi gravado\n`);
    return 1;
  }

  try {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, csv, "utf8");
  } catch (error) {
    io.stderr(`erro: não foi possível gravar ${output}: ${describe(error)}\n`);
    return 1;
  }
  const count = warnings.length === 1 ? "1 aviso" : `${warnings.length} avisos`;
  io.stdout(`${cards.length} cards → ${output} (${count})\n`);
  return 0;
}

const USAGE = "uso: flashcards <entrada.md> [-o <saida.csv>]";

function parseArgs(args: string[]): { input: string; output?: string } | undefined {
  let input: string | undefined;
  let output: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "-o") {
      const value = args[++i];
      if (value === undefined || output !== undefined) return undefined;
      output = value;
    } else if (arg.startsWith("-") || input !== undefined) {
      return undefined;
    } else {
      input = arg;
    }
  }
  if (input === undefined) return undefined;
  return output === undefined ? { input } : { input, output };
}

function samePath(a: string, b: string): boolean {
  const normalize = (p: string) =>
    process.platform === "win32" ? resolve(p).toLowerCase() : resolve(p);
  return normalize(a) === normalize(b);
}

function describe(error: unknown): string {
  const code = (error as NodeJS.ErrnoException).code;
  if (code === "ENOENT") return "arquivo não encontrado";
  return error instanceof Error ? error.message : String(error);
}
