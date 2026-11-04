import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { installPaths, missingLines, skillsFor, withExcludeLines } from '../scripts/lib/adopt.ts';

describe('adopt: o que instalar', () => {
  it('a eval-skill só vai para este repositório', () => {
    const all = ['eval-skill', 'investigate', 'run-pipeline'];
    assert.deepEqual(skillsFor(all, false), ['investigate', 'run-pipeline']);
    assert.deepEqual(skillsFor(all, true), all);
  });

  it('cada skill entra na pasta de cada agente', () => {
    assert.deepEqual(installPaths(['a']), ['.claude/skills/a/', '.agents/skills/a/']);
  });
});

describe('adopt: .git/info/exclude', () => {
  it('só acrescenta o que falta e mantém o que já estava lá', () => {
    const before = '# meu\n.claude/skills/a/\n';
    const lines = missingLines(before, ['.claude/skills/a/', '.agents/skills/a/']);
    assert.deepEqual(lines, ['.agents/skills/a/']);
    const after = withExcludeLines(before, lines);
    assert.ok(after.startsWith(before.trimEnd()));
    assert.ok(after.endsWith('.agents/skills/a/\n'));
    assert.equal(withExcludeLines(before, []), before);
  });
});

// O script de verdade, num repositório de mentira fora deste.
describe('adopt (script)', () => {
  const script = fileURLToPath(new URL('../scripts/adopt.ts', import.meta.url));
  const adopt = (dir: string, ...args: string[]) => spawnSync(process.execPath, [script, dir, ...args], { encoding: 'utf8', env: { ...process.env, INIT_CWD: '' } });
  const git = (dir: string, ...args: string[]) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' });

  function withRepo(run: (dir: string) => void) {
    const dir = mkdtempSync(join(tmpdir(), 'adopt-'));
    try {
      git(dir, 'init', '-q');
      writeFileSync(join(dir, 'app.txt'), 'código do projeto\n');
      git(dir, 'add', '.');
      git(dir, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'início');
      run(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('instala para os agentes sem nada aparecer no git do projeto, e pode rodar de novo', () => {
    withRepo((dir) => {
      const dry = adopt(dir, '--dry-run');
      assert.equal(dry.status, 0, dry.stderr);
      assert.equal(existsSync(join(dir, '.claude')), false, 'o dry-run gravou algo');

      for (let run = 0; run < 2; run++) {
        const result = adopt(dir);
        assert.equal(result.status, 0, result.stderr);
      }
      for (const agentDir of ['.claude', '.agents']) {
        for (const skill of ['run-pipeline', 'problem-solver', 'investigate']) {
          assert.ok(existsSync(join(dir, agentDir, 'skills', skill, 'SKILL.md')), `faltou ${agentDir}/${skill}`);
        }
        assert.equal(existsSync(join(dir, agentDir, 'skills', 'eval-skill')), false);
      }
      assert.equal(git(dir, 'status', '--porcelain', '--untracked-files=all').stdout, '');
      const exclude = readFileSync(join(dir, '.git', 'info', 'exclude'), 'utf8');
      assert.equal(exclude.split('.claude/skills/run-pipeline/').length, 2, 'repetiu linha no exclude');
    });
  });

  it('chamado de uma subpasta, instala na raiz do repositório', () => {
    withRepo((dir) => {
      mkdirSync(join(dir, 'src', 'api'), { recursive: true });
      const result = adopt(join(dir, 'src', 'api'));
      assert.equal(result.status, 0, result.stderr);
      assert.ok(existsSync(join(dir, '.claude', 'skills', 'run-pipeline', 'SKILL.md')));
      assert.equal(existsSync(join(dir, 'src', 'api', '.claude')), false);
      assert.equal(git(dir, 'status', '--porcelain', '--untracked-files=all').stdout, '');
    });
  });

  it('funciona num git worktree, onde .git é um arquivo', () => {
    withRepo((dir) => {
      const tree = `${dir}-worktree`;
      try {
        assert.equal(git(dir, 'worktree', 'add', '-q', '-b', 'outra', tree).status, 0);
        const result = adopt(tree);
        assert.equal(result.status, 0, result.stderr);
        assert.ok(existsSync(join(tree, '.agents', 'skills', 'investigate', 'SKILL.md')));
        assert.equal(git(tree, 'status', '--porcelain', '--untracked-files=all').stdout, '');
      } finally {
        rmSync(tree, { recursive: true, force: true });
      }
    });
  });

  it('não sobrescreve uma skill que o projeto já tinha', () => {
    withRepo((dir) => {
      mkdirSync(join(dir, '.claude', 'skills', 'investigate'), { recursive: true });
      writeFileSync(join(dir, '.claude', 'skills', 'investigate', 'SKILL.md'), 'do projeto');

      assert.equal(adopt(dir).status, 1, 'sobrescreveu uma skill solta');
      git(dir, 'add', '.');
      assert.equal(adopt(dir).status, 1, 'sobrescreveu uma skill versionada');
      assert.equal(readFileSync(join(dir, '.claude', 'skills', 'investigate', 'SKILL.md'), 'utf8'), 'do projeto');
    });
  });

  it('avisa quando o .gitignore do projeto derruba o exclude', () => {
    withRepo((dir) => {
      writeFileSync(join(dir, '.gitignore'), '!.claude/\n!.claude/**\n');
      const result = adopt(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /enxergando as skills/);
    });
  });

  it('recusa uma pasta que não é repositório git', () => {
    const dir = mkdtempSync(join(tmpdir(), 'adopt-'));
    try {
      assert.equal(adopt(dir).status, 1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
