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
      expect(res.replace(/\n/g, '').replace(/\s{2,}/g, ' ')).to.include(
        'You must provide one or more configuration variables to unset. Run "sf config list" to see the configuration variables you\'ve previously set.'
      );
    });
  });

  describe('config unset with singular result', () => {
    beforeEach(() => {
      execCmd('config set org-api-version=51.0 --global');
    });

    it('lists singular config correctly', () => {
      const { result } = execCmd('config unset org-api-version --json', { ensureExitCode: 0 }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'org-api-version',
          success: true,
        },
      ]);
    });

    it('lists singular result correctly stdout', () => {
      const res = execCmd('config unset org-api-version').shellOutput.stdout;
      expect(res).to.include('Unset Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('Name');
      expect(res).to.include('Success');
      expect(res).to.include('true');
    });
  });

  describe('config unset with multiple results', () => {
    beforeEach(() => {
      execCmd('config set org-api-version=51.0 --global');
      execCmd('config set org-max-query-limit=100 --global');
    });

    it('unsets multiple configs correctly JSON', () => {
      execCmd('config set disable-telemetry=false');
      const { result } = execCmd('config unset disable-telemetry org-api-version org-max-query-limit --json', {
        ensureExitCode: 0,
      }).jsonOutput;
      expect(result).to.deep.equal([
        {
          name: 'disable-telemetry',
          success: true,
        },
        {
          name: 'org-api-version',
          success: true,
        },
        {
          name: 'org-max-query-limit',
          success: true,
        },
      ]);
    });

    it('lists multiple results correctly stdout', () => {
      execCmd('config set disable-telemetry=false');
      const res = execCmd('config unset disable-telemetry org-api-version org-max-query-limit', {
        ensureExitCode: 0,
      }).shellOutput.stdout;
      expect(res).to.include('Unset Config');
      expect(res).to.include('org-api-version');
      expect(res).to.include('org-max-query-limit');
      expect(res).to.include('disable-telemetry');
    });
  });
});

after(async () => {
  await testSession?.clean();
});
