// npm run smoke
//
// Usa o comando como um usuário: grava arquivos .md de verdade, roda
// `node bin/flashcards.ts` e confere o CSV gravado, as mensagens e o código de saída.
// Sai com 1 se algo divergir.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const bin = join(import.meta.dirname, "..", "bin", "flashcards.ts");
const dir = mkdtempSync(join(tmpdir(), "smoke-"));
const HEADER = "#separator:Comma\n#html:false\n";
let failures = 0;

type Expected = { code: number; out?: string; err?: string; csv?: [path: string, content: string]; absent?: string };

function check(name: string, args: string[], expected: Expected) {
  const r = spawnSync(process.execPath, [bin, ...args], { cwd: dir, encoding: "utf8" });
  const problems: string[] = [];
  if (r.status !== expected.code) problems.push(`código ${r.status} (esperado ${expected.code})`);
  if (expected.out !== undefined && r.stdout.trim() !== expected.out) problems.push(`stdout: ${JSON.stringify(r.stdout)}`);
  if (expected.err !== undefined && r.stderr.trim() !== expected.err) problems.push(`stderr: ${JSON.stringify(r.stderr)}`);
  if (expected.csv) {
    const [path, content] = expected.csv;
    const actual = existsSync(join(dir, path)) ? readFileSync(join(dir, path), "utf8") : "(não existe)";
    if (actual !== content) problems.push(`${path}: ${JSON.stringify(actual)}`);
  }
  if (expected.absent && existsSync(join(dir, expected.absent))) problems.push(`${expected.absent} não deveria existir`);
  console.log(`${problems.length === 0 ? "✔" : "✘"} ${name}`);
  for (const p of problems) console.log(`    ${p}`);
  failures += problems.length === 0 ? 0 : 1;
}

const file = (name: string, content: string) => writeFileSync(join(dir, name), content);

try {
  file("espanhol.md", "# Saudações\n\n- hola :: olá\n- gato :: gato\n");
  check("converte e grava ao lado (CA-1, CA-2, CA-14)", ["espanhol.md"], {
    code: 0,
    out: "2 cards → espanhol.csv (0 avisos)",
    csv: ["espanhol.csv", `${HEADER}#deck:espanhol\nhola,olá\ngato,gato\n`],
  });

  check("-o com espaço no caminho cria a pasta e mantém o deck (CA-3)", ["espanhol.md", "-o", "minha saida/cards.csv"], {
    code: 0,
    csv: ["minha saida/cards.csv", `${HEADER}#deck:espanhol\nhola,olá\ngato,gato\n`],
  });

  file("misto.md", "1.   casa   ::   casa  \nseparador do C++ :: usa :: entre namespaces\n```\nstd::cout << x;\n```\n**ser** :: <b>to be</b>\n");
  check("marcadores, primeiro ::, bloco de código e texto literal (CA-5, CA-6, CA-7, CA-11)", ["misto.md"], {
    code: 0,
    err: "",
    csv: ["misto.csv", `${HEADER}#deck:misto\ncasa,casa\nseparador do C++,usa :: entre namespaces\n**ser**,<b>to be</b>\n`],
  });

  file("avisos.md", "hola :: olá\nperro :: cachorro\npergunta ::\ngato :: gato\n:: resposta\nhola :: oi\n");
  check("lado vazio e pergunta repetida viram aviso (CA-8, CA-9, CA-14)", ["avisos.md"], {
    code: 0,
    err: [
      "aviso: linha 3: resposta vazia, linha ignorada",
      "aviso: linha 5: pergunta vazia, linha ignorada",
      "aviso: linha 6: pergunta repetida (já está na linha 1), linha ignorada",
    ].join("\n"),
    out: "3 cards → avisos.csv (3 avisos)",
  });

  file("aspas.md", 'diga "oi", por favor :: say "hi", please\n');
  check("escapa vírgula e aspas (CA-10)", ["aspas.md"], {
    code: 0,
    csv: ["aspas.csv", `${HEADER}#deck:aspas\n"diga ""oi"", por favor","say ""hi"", please"\n`],
  });

  file("crlf.md", "¿Cómo estás? :: Como você está?\r\n");
  check("UTF-8 com CRLF preserva acentos e não deixa \\r (CA-12)", ["crlf.md"], {
    code: 0,
    csv: ["crlf.csv", `${HEADER}#deck:crlf\n¿Cómo estás?,Como você está?\n`],
  });

  file("vazio.md", "# só um título\n\ntexto sem cards\n");
  check("sem cards válidos não grava nada (CA-13)", ["vazio.md"], {
    code: 1,
    err: "erro: nenhum card válido em vazio.md; nada foi gravado",
    absent: "vazio.csv",
  });

  check("arquivo inexistente (CA-15)", ["nao existe.md"], { code: 1, err: "erro: não foi possível ler nao existe.md: arquivo não encontrado" });

  check("-o igual à entrada é recusado (CA-17)", ["espanhol.md", "-o", "./espanhol.md"], {
    code: 1,
    err: "erro: a saída ./espanhol.md é o próprio arquivo de entrada",
  });

  check("uso inválido sai com 2", [], { code: 2, err: "uso: flashcards <entrada.md> [-o <saida.csv>]" });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(failures === 0 ? "\nfumaça: tudo certo" : `\nfumaça: ${failures} falha(s)`);
process.exitCode = failures === 0 ? 0 : 1;
