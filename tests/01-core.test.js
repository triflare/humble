/* global Scratch */
/**
 * Unit tests for src/01-core.js
 *
 * The Scratch global mock must be installed before the core module is imported,
 * because 01-core.js calls Scratch.extensions.register() at module load time.
 * The mock captures the registered instance so the class methods can be tested.
 */

import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { installScratchMock } from './helpers/mock-scratch.js';

const { mock, restore } = installScratchMock();
let extension;
mock.extensions.register = instance => {
  extension = instance;
};

// Top-level await: load the core module so registration fires.
await import('../src/01-core.js');

after(() => restore());

describe('Humble extension registration', () => {
  it('registers an extension instance with Scratch', () => {
    assert.ok(extension, 'Scratch.extensions.register should have been called');
  });
});

describe('Humble extension environment variable API', () => {
  it('stores and retrieves environment variable values', () => {
    extension.setEnv({ NAME: 'HOME', VALUE: '/home/user' });
    assert.equal(extension.getEnv({ NAME: 'HOME' }), '/home/user');
  });

  it('overwrites existing variables with new values', () => {
    extension.setEnv({ NAME: 'PATH', VALUE: '/usr/bin' });
    extension.setEnv({ NAME: 'PATH', VALUE: '/usr/local/bin' });
    assert.equal(extension.getEnv({ NAME: 'PATH' }), '/usr/local/bin');
  });

  it('returns an empty string for unknown variables', () => {
    assert.equal(extension.getEnv({ NAME: 'UNKNOWN_VAR' }), '');
  });

  it('does not store variables with an empty name', () => {
    extension.setEnv({ NAME: '', VALUE: 'ignored' });
    assert.equal(extension.getEnv({ NAME: '' }), '');
  });

  it('removes variables when requested', () => {
    extension.setEnv({ NAME: 'TEMP', VALUE: '123' });
    extension.removeEnv({ NAME: 'TEMP' });
    assert.equal(extension.getEnv({ NAME: 'TEMP' }), '');
  });

  it('does not throw when removing a missing variable', () => {
    assert.doesNotThrow(() => extension.removeEnv({ NAME: 'MISSING' }));
  });
});

describe('Humble extension variable resolution', () => {
  it('resolves $VAR expressions in a string', () => {
    extension.setEnv({ NAME: 'HOME', VALUE: '/home/user' });
    assert.equal(extension.resolveString({ TEXT: '$HOME/path' }), '/home/user/path');
  });

  it('resolves ${' + 'VAR} expressions in a string', () => {
    extension.setEnv({ NAME: 'PROJECT', VALUE: 'humble' });
    assert.equal(
      extension.resolveString({ TEXT: '${' + 'PROJECT}/README.md' }),
      'humble/README.md'
    );
  });

  it('resolves multiple variables and mixed syntax', () => {
    extension.setEnv({ NAME: 'HOME', VALUE: '/home/user' });
    extension.setEnv({ NAME: 'PROJECT', VALUE: 'humble' });
    assert.equal(
      extension.resolveString({ TEXT: 'Path: $HOME/' + '${' + 'PROJECT}/src' }),
      'Path: /home/user/humble/src'
    );
  });

  it('replaces unknown variables with an empty string', () => {
    assert.equal(extension.resolveString({ TEXT: '$UNKNOWN ' + '${' + 'MISSING}' }), ' ');
  });
});

describe('Humble extension metadata', () => {
  it('returns getInfo metadata with expected id and name', () => {
    const info = extension.getInfo();
    assert.equal(info.id, 'tfHumble');
    assert.equal(info.name, 'Humble');
  });

  it('exposes the expected block opcodes', () => {
    const opcodes = extension
      .getInfo()
      .blocks.map(b => b.opcode)
      .filter(Boolean);
    assert.deepEqual(opcodes, ['setEnv', 'removeEnv', 'getEnv', 'resolveString']);
  });

  it('declares a reporter block for resolveString', () => {
    const { blocks } = extension.getInfo();
    const block = blocks.find(b => b.opcode === 'resolveString');
    assert.ok(block, 'expected resolveString block to exist');
    assert.equal(block.blockType, Scratch.BlockType.REPORTER);
  });
});
