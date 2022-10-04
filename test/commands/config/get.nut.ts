/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { expect } from '@salesforce/command/lib/test';

let testSession: TestSession;

describe('config:get NUTs', async () => {
  testSession = await TestSession.create({
    project: { name: 'configGetNUTs' },
  });

  describe('config:get errors', () => {
    it('attempt to config get without keys', () => {
      const res = execCmd('config:get --json', {
        ensureExitCode: 1,
      }).jsonOutput;
      expect(res.stack).to.include('NoConfigKeysFound');
      expect(res.name).to.include('NoConfigKeysFound');
      expect(res.exitCode).to.equal(1);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(res.commandName).to.include('Get');
    });

    it('attempt to config get without keys stdout', () => {
      const res: string = execCmd('config:get').shellOutput.stderr;
      expect(res).to.include('Please provide config name(s) to get.');
    });
  });

  describe('config:get with singular result', () => {
    before(() => {
      execCmd('config:set apiVersion=51.0 --global');
    });

    it('gets singular config correctly', () => {
      const res = execCmd('config:get apiVersion --json', { ensureExitCode: 0 });
      // the path variable will change machine to machine, ensure it has the config file and then delete it
      expect(res.jsonOutput.result[0].path).to.include('config.json');
      expect(res.jsonOutput.result[0].key).to.include('apiVersion');
      expect(res.jsonOutput.result[0].location).to.include('Global');
      expect(res.jsonOutput.result[0].value).to.include('51.0');
      expect(res.jsonOutput.status).to.equal(0);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(res.jsonOutput.warnings).to.include('apiVersion configuration overridden at "51.0"');
    });

    it('properly overwrites config values, with local > global', () => {
      execCmd('config:set apiVersion=52.0');
      const res = execCmd('config:get apiVersion --json', { ensureExitCode: 0 });
      // the path variable will change machine to machine, ensure it has the config file and then delete it
      expect(res.jsonOutput.result[0].path).to.include('config.json');
      delete res.jsonOutput.result[0].path;
      expect(res.jsonOutput).to.deep.equal({
        result: [
          {
            deprecated: false,
            key: 'apiVersion',
            location: 'Local',
            value: '52.0',
          },
        ],
        status: 0,
        warnings: ['apiVersion configuration overridden at "52.0"'],
      });
    });

    it('gets singular result correctly stdout', () => {
      const res: string = execCmd('config:get apiVersion').shellOutput.stdout;
      expect(res).to.include('Get Config');
      expect(res).to.include('apiVersion');
      expect(res).to.include('52.0');
    });
  });

  describe('config:get with multiple results', () => {
    beforeEach(() => {
      execCmd('config:set apiVersion=51.0 --global');
      execCmd('config:set maxQueryLimit=100 --global');
    });

    it('gets multiple results correctly', () => {
      execCmd('config:set restDeploy=false');
      execCmd('config:set apiVersion=51.0');
      const res = execCmd<{ result: { path: string } }>('config:get apiVersion maxQueryLimit restDeploy --json', {
        ensureExitCode: 0,
      });
      Object.values(res.jsonOutput.result).forEach((result) => {
        expect(result.path).to.include('config.json');
        delete result.path;
      });

      expect(res.jsonOutput.result).to.deep.equal([
        {
          deprecated: false,
          key: 'apiVersion',
          location: 'Local',
          value: '51.0',
        },
        {
          deprecated: false,
          key: 'maxQueryLimit',
          location: 'Global',
          value: '100',
        },
        {
          deprecated: false,
          key: 'restDeploy',
          location: 'Local',
          value: 'false',
        },
      ]);
    });

    it('gets multiple results correctly stdout', () => {
      const res: string = execCmd('config:get  apiVersion maxQueryLimit restDeploy').shellOutput.stdout;
      expect(res).to.include('=== Get Config');
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
