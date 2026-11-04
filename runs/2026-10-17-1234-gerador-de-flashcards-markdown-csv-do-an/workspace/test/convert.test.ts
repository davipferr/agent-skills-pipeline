import { test } from "node:test";
import assert from "node:assert/strict";
import { convert } from "../src/convert.ts";

test("gera cabeçalho do Anki e um card por linha (CA-1)", () => {
  const { csv } = convert("hola :: olá\ngato :: gato\n", "espanhol");
  assert.equal(
    csv,
    "#separator:Comma\n#html:false\n#deck:espanhol\nhola,olá\ngato,gato\n",
  );
});

test("ignora títulos, parágrafos e linhas em branco sem avisar (CA-4)", () => {
  const markdown = "# Verbos\n\nAnotações soltas sobre o tema.\n\nser :: to be\n";
  const { cards, warnings } = convert(markdown, "ingles");
  assert.deepEqual(cards, [{ question: "ser", answer: "to be", line: 5 }]);
  assert.deepEqual(warnings, []);
});

test("remove marcadores de lista e espaços em volta (CA-5)", () => {
  const markdown = "- hola :: olá\n* perro::cachorro\n1.   casa   ::   casa  \n";
  const { csv } = convert(markdown, "espanhol");
  assert.equal(
    csv,
    "#separator:Comma\n#html:false\n#deck:espanhol\nhola,olá\nperro,cachorro\ncasa,casa\n",
  );
});

test("divide no primeiro :: e a resposta pode conter :: (CA-6)", () => {
  const { cards } = convert("separador do C++ :: usa :: entre namespaces\n", "cpp");
  assert.deepEqual(cards, [
    { question: "separador do C++", answer: "usa :: entre namespaces", line: 1 },
  ]);
});

test("aceita CRLF sem deixar \r e preserva acentos (CA-12)", () => {
  const { csv } = convert("¿Cómo estás? :: Como você está?\r\nhola :: olá\r\n", "espanhol");
  assert.equal(
    csv,
    "#separator:Comma\n#html:false\n#deck:espanhol\n¿Cómo estás?,Como você está?\nhola,olá\n",
  );
});

test("ignora linhas dentro de blocos de código e volta a ler depois (CA-7)", () => {
  const markdown = [
    "antes :: before",
    "```cpp",
    "std::cout << x;",
    "pergunta :: dentro do bloco",
    "```",
    "depois :: after",
    "",
  ].join("\n");
  const { cards, warnings } = convert(markdown, "cpp");
  assert.deepEqual(cards, [
    { question: "antes", answer: "before", line: 1 },
    { question: "depois", answer: "after", line: 6 },
  ]);
  assert.deepEqual(warnings, []);
});

test("lado vazio vira aviso com a linha e fica fora do CSV (CA-8)", () => {
  const markdown = "hola :: olá\n\npergunta ::\n\n:: resposta\ngato :: gato\n";
  const { csv, warnings } = convert(markdown, "espanhol");
  assert.equal(
    csv,
    "#separator:Comma\n#html:false\n#deck:espanhol\nhola,olá\ngato,gato\n",
  );
  assert.deepEqual(
    warnings.map((w) => w.line),
    [3, 5],
  );
  for (const w of warnings) assert.ok(w.message.length > 0);
});

test("pergunta repetida: fica a primeira e a repetida vira aviso (CA-9)", () => {
  const markdown = "# Saudações\nhola :: olá\n\n\n\n\nhola :: oi\n";
  const { csv, warnings } = convert(markdown, "espanhol");
  assert.equal(csv, "#separator:Comma\n#html:false\n#deck:espanhol\nhola,olá\n");
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0]!.line, 7);
});

test("campos com vírgula ou aspas vão entre aspas, com aspas duplicadas (CA-10)", () => {
  const markdown = 'diga "oi", por favor :: say "hi", please\nsó vírgula, aqui :: simples\n';
  const { csv } = convert(markdown, "frases");
  assert.equal(
    csv,
    "#separator:Comma\n#html:false\n#deck:frases\n" +
      '"diga ""oi"", por favor","say ""hi"", please"\n' +
      '"só vírgula, aqui",simples\n',
  );
});

test("Markdown e HTML passam literalmente, sem conversão (CA-11)", () => {
  const { csv } = convert("**ser** :: <b>to be</b>\n", "ingles");
  assert.equal(csv, "#separator:Comma\n#html:false\n#deck:ingles\n**ser**,<b>to be</b>\n");
});
