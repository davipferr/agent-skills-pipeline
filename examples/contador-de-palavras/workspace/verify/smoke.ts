// npm run smoke
//
// Usa o comando como um usuário: grava arquivos de verdade, roda `node src/cli.ts`
// e confere a saída e o código de saída. Sai com 1 se algo divergir.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cli = join(import.meta.dirname, '..', 'src', 'cli.ts');
const dir = mkdtempSync(join(tmpdir(), 'smoke-'));
let failures = 0;

function check(name: string, args: string[], expected: { out?: string; err?: string; code: number }, stdin?: string) {
  const r = spawnSync(process.execPath, [cli, ...args], { input: stdin, encoding: 'utf8' });
  const ok =
    r.status === expected.code &&
    (expected.out === undefined || r.stdout.trim() === expected.out) &&
    (expected.err === undefined || r.stderr.trim() === expected.err);
  console.log(`${ok ? '✔' : '✘'} ${name}`);
  if (!ok) {
    failures++;
    console.log(`    código ${r.status} (esperado ${expected.code})\n    stdout: ${JSON.stringify(r.stdout)}\n    stderr: ${JSON.stringify(r.stderr)}`);
  }
}

const file = (name: string, content: string) => {
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
};

try {
  check('conta um arquivo (CA-1)', [file('a.txt', 'olá mundo olá')], { out: 'palavras: 3\nlinhas: 1\ncaracteres: 13', code: 0 });
  check('--top junta maiúsculas (CA-2)', [file('b.txt', 'Casa casa CASA rua'), '--top', '1'], { out: 'palavras: 4\nlinhas: 1\ncaracteres: 18\ncasa: 3', code: 0 });
  check('hífen no meio é uma palavra (CA-3)', [file('c.txt', 'pé-de-moleque é ótimo')], { out: 'palavras: 3\nlinhas: 1\ncaracteres: 21', code: 0 });
  const missing = join(dir, 'nao existe.txt');
  check('arquivo inexistente (CA-4)', [missing], { err: `arquivo não encontrado: ${missing}`, code: 1 });
  check('texto vazio (CA-5)', [file('vazio.txt', '')], { out: 'palavras: 0\nlinhas: 0\ncaracteres: 0', code: 0 });
  check('lê do stdin', [], { out: 'palavras: 2\nlinhas: 1\ncaracteres: 9', code: 0 }, 'oi mundo\n');
  check('CRLF conta as linhas certas', [file('crlf.txt', 'um\r\ndois\r\n')], { out: 'palavras: 2\nlinhas: 2\ncaracteres: 10', code: 0 });
  check('--top inválido', [file('d.txt', 'a'), '--top', '0'], { err: '--top precisa ser um inteiro maior que zero', code: 1 });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(failures === 0 ? '\nfumaça: tudo certo' : `\nfumaça: ${failures} falha(s)`);
process.exitCode = failures === 0 ? 0 : 1;
