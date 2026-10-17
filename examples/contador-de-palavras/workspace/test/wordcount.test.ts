import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { run, type Io } from '../src/cli.ts';
import { count, topWords } from '../src/wordcount.ts';

describe('count', () => {
  it('CA-1: conta palavras, linhas e caracteres', () => {
    assert.deepEqual(count('olá mundo olá'), { words: 3, lines: 1, chars: 13 });
  });

  it('CA-1: quebra de linha no fim não conta como linha extra', () => {
    assert.deepEqual(count('um\ndois\n'), { words: 2, lines: 2, chars: 8 });
  });

  it('CA-3: palavras com acento e hífen contam como uma', () => {
    assert.equal(count('pé-de-moleque é ótimo').words, 3);
  });

  it('CA-5: texto vazio dá zero em tudo', () => {
    assert.deepEqual(count(''), { words: 0, lines: 0, chars: 0 });
  });
});

describe('topWords', () => {
  it('CA-2: agrupa sem diferenciar maiúsculas', () => {
    assert.deepEqual(topWords('Casa casa CASA rua', 1), [['casa', 3]]);
  });

  it('CA-2: empate fica em ordem alfabética', () => {
    assert.deepEqual(topWords('zebra abelha', 2), [['abelha', 1], ['zebra', 1]]);
  });
});

describe('cli', () => {
  const fakeIo = (files: Record<string, string>) => {
    const out: string[] = [];
    const err: string[] = [];
    const io: Io = {
      readFile: (path) => {
        const text = files[path];
        if (text === undefined) throw new Error('ENOENT');
        return text;
      },
      readStdin: () => '',
      out: (line) => out.push(line),
      err: (line) => err.push(line),
    };
    return { io, out, err };
  };

  it('CA-2: --top mostra as palavras mais frequentes depois das contagens', () => {
    const { io, out } = fakeIo({ 'a.txt': 'sol sol lua' });
    assert.equal(run(['a.txt', '--top', '1'], io), 0);
    assert.deepEqual(out, ['palavras: 3', 'linhas: 1', 'caracteres: 11', 'sol: 2']);
  });

  it('CA-4: arquivo inexistente sai com código 1 e explica o motivo', () => {
    const { io, err } = fakeIo({});
    assert.equal(run(['sumiu.txt'], io), 1);
    assert.deepEqual(err, ['arquivo não encontrado: sumiu.txt']);
  });
});
