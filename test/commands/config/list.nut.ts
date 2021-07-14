/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from '@salesforce/command/lib/test';

let testSession: TestSession;

describe('config list NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configListNUTs' },
    authStrategy: 'NONE',
  });

  describe('config list with no configs set', () => {
    it('lists no config entries correctly', () => {
      const res = execCmd('config list --json', { ensureExitCode: 0 });
      expect(res.jsonOutput).to.deep.equal([]);
    });

    it('lists no configs stdout', () => {
      const res = execCmd('config list').shellOutput;
      expect(res).to.include('No results found');
    });
  });

  describe('config list with singular result', () => {
    before(() => {
      execCmd('config set apiVersion=51.0 --global');
    });

    it('lists singular config correctly', () => {
      const res = execCmd('config list --json', { ensureExitCode: 0 });
      expect(res.jsonOutput).to.deep.equal([
        {
          name: 'apiVersion',
          location: 'Global',
          value: '51.0',
          success: true,
        },
      ]);
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config set apiVersion=52.0 --json');
      const res = execCmd('config list --json', { ensureExitCode: 0 });
      expect(res.jsonOutput).to.deep.equal([
        {
          name: 'apiVersion',
          location: 'Local',
          value: '52.0',
          success: true,
        },
      ]);
    });

    it('lists singular result correctly stdout', () => {
      const res: string = execCmd('config list').shellOutput.stdout;
      expect(res).to.include('List Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('Local');
      expect(res).to.include('52.0');
      execCmd('config unset apiVersion');
    });
  });

  describe('config list with multiple results', () => {
    beforeEach(() => {
      execCmd('config set apiVersion=51.0 --global');
      execCmd('config set maxQueryLimit=100 --global');
    });

    it('lists multiple results correctly JSON', () => {
      execCmd('config set restDeploy=false');
      const res = execCmd('config list --json', { ensureExitCode: 0 });
      expect(res.jsonOutput).to.deep.equal([
        {
          name: 'apiVersion',
          location: 'Global',
          value: '51.0',
          success: true,
        },
        {
          name: 'maxQueryLimit',
          location: 'Global',
          value: '100',
          success: true,
        },
        {
          name: 'restDeploy',
          location: 'Local',
          value: 'false',
          success: true,
        },
      ]);
    });

    it('lists multiple results correctly stdout', () => {
      execCmd('config set restDeploy=false');
      const res: string = execCmd('config list', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res).to.include('List Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('51.0');
      expect(res).to.include('maxQueryLimit');
      expect(res).to.include('100');
      expect(res).to.include('restDeploy');
      expect(res).to.include('false');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
