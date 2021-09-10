/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

let testSession: TestSession;

describe('config unset NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configUnsetNUTs' },
    authStrategy: 'NONE',
  });

  describe('config unset without keys', () => {
    it('errors when attempting to unset nothing', () => {
      const result = execCmd('config unset --json', { ensureExitCode: 1 }).jsonOutput;
      expect(result.name).to.equal('NoConfigKeysFoundError');
      expect(result.status).to.equal(1);
    });

    it('prints error message', () => {
      const res = execCmd('config unset').shellOutput.stderr;
      expect(res).to.include('Please provide config name(s) to unset.');
    });
  });

  describe('config unset with singular result', () => {
    beforeEach(() => {
      execCmd('config set apiVersion=51.0 --global');
    });

    it('lists singular config correctly', () => {
      const { result } = execCmd('config unset apiVersion --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'apiVersion',
          success: true,
        },
      ]);
    });

    it('lists singular result correctly stdout', () => {
      const res = execCmd('config unset apiVersion').shellOutput.stdout;
      expect(res).to.include('Unset Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('Name');
      expect(res).to.include('Success');
      expect(res).to.include('true');
    });
  });

  describe('config unset with multiple results', () => {
    beforeEach(() => {
      execCmd('config set apiVersion=51.0 --global');
      execCmd('config set maxQueryLimit=100 --global');
    });

    it('unsets multiple configs correctly JSON', () => {
      execCmd('config set restDeploy=false');
      const { result } = execCmd('config unset restDeploy apiVersion maxQueryLimit --json', {
        ensureExitCode: 0,
      }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'restDeploy',
          success: true,
        },
        {
          name: 'apiVersion',
          success: true,
        },
        {
          name: 'maxQueryLimit',
          success: true,
        },
      ]);
    });

    it('lists multiple results correctly stdout', () => {
      execCmd('config set restDeploy=false');
      const res = execCmd('config unset restDeploy apiVersion maxQueryLimit', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res).to.include('Unset Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('maxQueryLimit');
      expect(res).to.include('restDeploy');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
