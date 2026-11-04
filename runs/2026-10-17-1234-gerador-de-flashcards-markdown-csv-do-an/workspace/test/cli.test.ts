import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { run } from "../src/cli.ts";
import { convert } from "../src/convert.ts";

async function tempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), "flashcards-"));
}

function captureIo() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    io: { stdout: (t: string) => out.push(t), stderr: (t: string) => err.push(t) },
    stdout: () => out.join(""),
    stderr: () => err.join(""),
  };
}

test("sem -o grava ao lado do .md com o mesmo nome, sobrescrevendo (CA-2, CA-16)", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  const csvPath = join(dir, "espanhol.csv");
  const markdown = "hola :: olá\ngato :: gato\n";
  await writeFile(md, markdown, "utf8");
  await writeFile(csvPath, "conteúdo antigo", "utf8");

  const { io, stdout } = captureIo();
  const code = await run([md], io);

  assert.equal(code, 0);
  const written = await readFile(csvPath, "utf8");
  assert.equal(
    written,
    "#separator:Comma\n#html:false\n#deck:espanhol\nhola,olá\ngato,gato\n",
  );
  assert.equal(written, convert(markdown, "espanhol").csv);
  assert.equal(stdout(), `2 cards → ${csvPath} (0 avisos)\n`);
});

test("bin/flashcards.ts roda pelo node e devolve o código de saída do run", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  await writeFile(md, "hola :: olá\n", "utf8");
  const bin = join(import.meta.dirname, "..", "bin", "flashcards.ts");

  const { stdout } = await promisify(execFile)(process.execPath, [bin, md]);

  assert.match(stdout, /^1 cards → .*espanhol\.csv \(0 avisos\)\n$/);
  assert.ok(existsSync(join(dir, "espanhol.csv")));
});

test("lê .md UTF-8 com CRLF e grava CSV UTF-8 com os mesmos bytes nos acentos (CA-12)", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  await writeFile(md, Buffer.from("¿Cómo estás? :: Como você está?\r\n", "utf8"));

  const code = await run([md], captureIo().io);

  assert.equal(code, 0);
  const bytes = await readFile(join(dir, "espanhol.csv"));
  const expected = Buffer.from(
    "#separator:Comma\n#html:false\n#deck:espanhol\n¿Cómo estás?,Como você está?\n",
    "utf8",
  );
  assert.deepEqual(bytes, expected);
});

test("avisos saem antes do resumo, que conta 1 aviso no singular, e o código é 0 (CA-14)", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  const csvPath = join(dir, "espanhol.csv");
  await writeFile(md, "hola :: olá\npergunta ::\ngato :: gato\nperro :: cachorro\n", "utf8");

  const events: string[] = [];
  const code = await run([md], {
    stdout: (t) => events.push(`out:${t}`),
    stderr: (t) => events.push(`err:${t}`),
  });

  assert.equal(code, 0);
  assert.deepEqual(events, [
    "err:aviso: linha 2: resposta vazia, linha ignorada\n",
    `out:3 cards → ${csvPath} (1 aviso)\n`,
  ]);
});

test("sem avisos o resumo diz 0 avisos (CA-14)", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  await writeFile(md, "hola :: olá\ngato :: gato\nperro :: cachorro\n", "utf8");

  const { io, stdout, stderr } = captureIo();
  const code = await run([md], io);

  assert.equal(code, 0);
  assert.equal(stderr(), "");
  assert.equal(stdout(), `3 cards → ${join(dir, "espanhol.csv")} (0 avisos)\n`);
});

test("-o grava no caminho dado, criando a pasta, e o deck continua vindo do .md (CA-3)", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  const out = join(dir, "saida", "cards.csv");
  await writeFile(md, "hola :: olá\n", "utf8");

  const { io, stdout } = captureIo();
  const code = await run([md, "-o", out], io);

  assert.equal(code, 0);
  assert.equal(
    await readFile(out, "utf8"),
    "#separator:Comma\n#html:false\n#deck:espanhol\nhola,olá\n",
  );
  assert.equal(existsSync(join(dir, "espanhol.csv")), false);
  assert.equal(stdout(), `1 cards → ${out} (0 avisos)\n`);
});

for (const [caso, markdown] of [
  ["vazio", ""],
  ["só texto", "# Título\nnada de cards aqui\n"],
  ["só linhas inválidas", "pergunta ::\n:: resposta\n"],
] as const) {
  test(`sem cards válidos (${caso}): não grava, avisa erro e sai com código ≠ 0 (CA-13)`, async () => {
    const dir = await tempDir();
    const md = join(dir, "espanhol.md");
    const csvPath = join(dir, "espanhol.csv");
    await writeFile(md, markdown, "utf8");
    await writeFile(csvPath, "csv antigo", "utf8");

    const { io, stdout, stderr } = captureIo();
    const code = await run([md], io);

    assert.notEqual(code, 0);
    assert.equal(await readFile(csvPath, "utf8"), "csv antigo");
    assert.match(stderr(), /erro: .*nenhum card/);
    assert.equal(stdout(), "");
  });
}

test("arquivo de entrada inexistente: erro citando o caminho e código ≠ 0 (CA-15)", async () => {
  const dir = await tempDir();
  const md = join(dir, "nao-existe.md");

  const { io, stdout, stderr } = captureIo();
  const code = await run([md], io);

  assert.notEqual(code, 0);
  assert.match(stderr(), /^erro: /);
  assert.ok(stderr().includes(md));
  assert.equal(stdout(), "");
  assert.equal(existsSync(join(dir, "nao-existe.csv")), false);
});

for (const [caso, args] of [
  ["sem entrada", []],
  ["-o sem valor", ["notas.md", "-o"]],
  ["argumento desconhecido", ["notas.md", "--tags"]],
  ["duas entradas", ["a.md", "b.md"]],
] as const) {
  test(`uso inválido (${caso}): mensagem de uso e código 2`, async () => {
    const { io, stdout, stderr } = captureIo();
    const code = await run([...args], io);
    assert.equal(code, 2);
    assert.match(stderr(), /uso: flashcards <entrada\.md> \[-o <saida\.csv>\]/);
    assert.equal(stdout(), "");
  });
}

test("falha ao gravar o CSV: erro citando o caminho e código 1", async () => {
  const dir = await tempDir();
  const md = join(dir, "espanhol.md");
  await writeFile(md, "hola :: olá\n", "utf8");
  const out = join(md, "cards.csv"); // pasta "espanhol.md" é um arquivo: não dá para criar

  const { io, stdout, stderr } = captureIo();
  const code = await run([md, "-o", out], io);

  assert.equal(code, 1);
  assert.match(stderr(), /^erro: /);
  assert.ok(stderr().includes(out));
  assert.equal(stdout(), "");
});

for (const [caso, saida] of [
  ["mesmo caminho", (md: string) => md],
  ["caminho relativo equivalente", (md: string) => join(md, "..", ".", "espanhol.md")],
] as const) {
  test(`-o igual à entrada (${caso}): não toca no .md, erro citando o caminho e código ≠ 0 (CA-17)`, async () => {
    const dir = await tempDir();
    const md = join(dir, "espanhol.md");
    await writeFile(md, "hola :: olá\n", "utf8");
    const out = saida(md);

    const { io, stdout, stderr } = captureIo();
    const code = await run([md, "-o", out], io);

    assert.notEqual(code, 0);
    assert.equal(await readFile(md, "utf8"), "hola :: olá\n");
    assert.match(stderr(), /^erro: /);
    assert.ok(stderr().includes(out));
    assert.equal(stdout(), "");
  });
}
