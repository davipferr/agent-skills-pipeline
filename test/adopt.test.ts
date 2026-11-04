import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { installPaths, isSkillsFolder, skillsFor, snapshot } from '../scripts/lib/adopt.ts';

function withFolder(run: (dir: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), 'adopt-'));
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('adopt: o que instalar', () => {
  it('a eval-skill só vai para este repositório', () => {
    const all = ['eval-skill', 'investigate', 'run-pipeline'];
    assert.deepEqual(skillsFor(all, false), ['investigate', 'run-pipeline']);
    assert.deepEqual(skillsFor(all, true), all);
  });

  it('cada skill entra na pasta de cada agente', () => {
    assert.deepEqual(installPaths(['a']), ['.claude/skills/a/', '.agents/skills/a/']);
  });

  it('reconhece uma pasta que já é de skills', () => {
    assert.ok(isSkillsFolder('C:\\Users\\eu\\.claude\\skills'));
    assert.ok(isSkillsFolder('/home/eu/.agents/skills/'));
    assert.ok(isSkillsFolder('/home/eu/.claude'));
    assert.equal(isSkillsFolder('/home/eu/projeto'), false);
  });

  it('duas pastas iguais têm o mesmo retrato, e um arquivo a mais muda o retrato', () => {
    withFolder((dir) => {
      for (const name of ['a', 'b']) {
        mkdirSync(join(dir, name, 'sub'), { recursive: true });
        writeFileSync(join(dir, name, 'sub', 'x.md'), 'igual');
      }
      assert.equal(snapshot(join(dir, 'a')), snapshot(join(dir, 'b')));
      writeFileSync(join(dir, 'b', 'y.md'), 'novo');
      assert.notEqual(snapshot(join(dir, 'a')), snapshot(join(dir, 'b')));
    });
  });
});

// O script de verdade, em pastas de mentira fora deste repositório.
describe('adopt (script)', () => {
  const script = fileURLToPath(new URL('../scripts/adopt.ts', import.meta.url));
  const adopt = (home: string, ...args: string[]) =>
    spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...process.env, INIT_CWD: '', HOME: home, USERPROFILE: home } });
  const skill = (dir: string, agentDir: string, name: string) => join(dir, agentDir, 'skills', name, 'SKILL.md');

  it('sem pasta, instala na pasta do usuário, sem a eval-skill, e pode rodar de novo', () => {
    withFolder((home) => {
      const dry = adopt(home, '--dry-run');
      assert.equal(dry.status, 0, dry.stderr);
      assert.equal(existsSync(join(home, '.claude')), false, 'o dry-run gravou algo');

      for (let run = 0; run < 2; run++) {
        const result = adopt(home);
        assert.equal(result.status, 0, result.stderr);
      }
      for (const agentDir of ['.claude', '.agents']) {
        for (const name of ['run-pipeline', 'problem-solver', 'investigate']) {
          assert.ok(existsSync(skill(home, agentDir, name)), `faltou ${agentDir}/${name}`);
        }
        assert.equal(existsSync(skill(home, agentDir, 'eval-skill')), false);
      }
    });
  });

  it('com uma pasta, instala só nela', () => {
    withFolder((home) => {
      const project = join(home, 'projeto');
      mkdirSync(project);
      assert.equal(adopt(home, project).status, 0);
      assert.ok(existsSync(skill(project, '.claude', 'run-pipeline')));
      assert.equal(existsSync(join(home, '.claude')), false);
    });
  });

  it('não mexe nas outras skills da pasta', () => {
    withFolder((home) => {
      mkdirSync(join(home, '.claude', 'skills', 'minha'), { recursive: true });
      writeFileSync(skill(home, '.claude', 'minha'), 'minha skill');
      assert.equal(adopt(home).status, 0);
      assert.equal(readFileSync(skill(home, '.claude', 'minha'), 'utf8'), 'minha skill');
    });
  });

  it('só troca uma skill com outro conteúdo usando --force', () => {
    withFolder((home) => {
      mkdirSync(join(home, '.claude', 'skills', 'investigate'), { recursive: true });
      writeFileSync(skill(home, '.claude', 'investigate'), 'outra versão');

      const refused = adopt(home);
      assert.equal(refused.status, 1);
      assert.match(refused.stderr, /--force/);
      assert.equal(readFileSync(skill(home, '.claude', 'investigate'), 'utf8'), 'outra versão');
      assert.equal(existsSync(skill(home, '.claude', 'run-pipeline')), false, 'gravou parte das skills antes de recusar');

      assert.equal(adopt(home, '--force').status, 0);
      assert.notEqual(readFileSync(skill(home, '.claude', 'investigate'), 'utf8'), 'outra versão');
    });
  });

  it('recusa a própria pasta de skills e explica o comando certo', () => {
    withFolder((home) => {
      const folder = join(home, '.claude', 'skills');
      mkdirSync(folder, { recursive: true });
      const result = adopt(home, folder);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /npm run adopt/);
    });
  });
});
