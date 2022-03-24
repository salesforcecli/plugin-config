/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';

let testSession: TestSession;

describe('config list NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configListNUTs' },
    authStrategy: 'NONE',
  });

  describe('config list with no configs set', () => {
    it('lists no config entries correctly', () => {
      const { result } = execCmd('config list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([]);
    });

    it('lists no configs stdout', () => {
      const res = execCmd('config list').shellOutput;
      expect(res).to.include('No results found');
    });
  });

  describe('config list with singular result', () => {
    before(() => {
      execCmd('config set org-api-version=51.0 --global');
    });

    it('lists singular config correctly', () => {
      const { result } = execCmd('config list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'org-api-version',
          location: 'Global',
          value: '51.0',
          success: true,
        },
      ]);
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config set org-api-version=52.0 --json');
      const { result } = execCmd('config list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'org-api-version',
          location: 'Local',
          value: '52.0',
          success: true,
        },
      ]);
    });

    it('lists singular result correctly stdout', () => {
      const res: string = execCmd('config list').shellOutput.stdout;
      expect(res).to.include('List Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('Local');
      expect(res).to.include('52.0');
      execCmd('config unset org-api-version');
    });
  });

  describe('config list with multiple results', () => {
    beforeEach(() => {
      execCmd('config set org-api-version=51.0 --global');
      execCmd('config set org-max-query-limit=100 --global');
    });

    it('lists multiple results correctly JSON', () => {
      execCmd('config set disable-telemetry=false');
      const { result } = execCmd('config list --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'disable-telemetry',
          location: 'Local',
          value: 'false',
          success: true,
        },
        {
          name: 'org-api-version',
          location: 'Global',
          value: '51.0',
          success: true,
        },
        {
          name: 'org-max-query-limit',
          location: 'Global',
          value: '100',
          success: true,
        },
      ]);
    });

    it('lists multiple results correctly stdout', () => {
      execCmd('config set disable-telemetry=false');
      const res: string = execCmd('config list', { ensureExitCode: 0 }).shellOutput.stdout;
      expect(res).to.include('List Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('51.0');
      expect(res).to.include('org-max-query-limit');
      expect(res).to.include('100');
      expect(res).to.include('disable-telemetry');
      expect(res).to.include('false');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
