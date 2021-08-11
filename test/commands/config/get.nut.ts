/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from 'chai';
import { ConfigResponses } from '../../../src/config';

let testSession: TestSession;

describe('config get NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configGetNUTs' },
    authStrategy: 'NONE',
  });

  describe('config get errors', () => {
    it('attempt to config get without keys', () => {
      const res = execCmd<{ error: { name: string; exitCode: number } }>('config get --json', {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(res.error.name).to.include('NoConfigKeysFound');
      expect(res.error.exitCode).to.equal(1);
    });

    it('attempt to config get without keys stdout', () => {
      const res = execCmd('config get').shellOutput.stderr;
      expect(res).to.include('Please provide config name(s) to get.');
    });
  });

  describe('config get with singular result', () => {
    before(() => {
      execCmd('config set apiVersion=51.0 --global');
    });

    it('gets singular config correctly', () => {
      const res = execCmd<ConfigResponses>('config get apiVersion --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      expect(res[0].name).to.equal('apiVersion');
      expect(res[0].location).to.equal('Global');
      expect(res[0].value).to.equal('51.0');
      expect(res[0].success).to.be.true;
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config set apiVersion=52.0');
      const res = execCmd<ConfigResponses>('config get apiVersion --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      expect(res).to.deep.equal([
        {
          name: 'apiVersion',
          location: 'Local',
          value: '52.0',
          success: true,
        },
      ]);
    });

    it('gets singular result correctly stdout', () => {
      const res = execCmd('config get apiVersion').shellOutput.stdout;
      expect(res).to.include('Get Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('52.0');
    });
  });

  describe('config get with multiple results', () => {
    beforeEach(() => {
      execCmd('config set apiVersion=51.0 --global');
      execCmd('config set maxQueryLimit=100 --global');
    });

    it('gets multiple results correctly', () => {
      execCmd('config set restDeploy=false');
      execCmd('config set apiVersion=51.0');
      const res = execCmd<ConfigResponses>('config get apiVersion maxQueryLimit restDeploy --json', {
        ensureExitCode: 0,
        cli: 'sf',
      });

      expect(res.jsonOutput).to.deep.equal([
        {
          name: 'apiVersion',
          location: 'Local',
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

    it('gets multiple results correctly stdout', () => {
      const res = execCmd('config get apiVersion maxQueryLimit restDeploy').shellOutput.stdout;
      expect(res).to.include('Get Config');
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
