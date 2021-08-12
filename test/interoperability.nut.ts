/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { SfdxPropertyKeys, fs, OrgConfigProperties } from '@salesforce/core';
import { env } from '@salesforce/kit';
import { AnyJson, ensureString } from '@salesforce/ts-types';
import { expect } from 'chai';
import { exec } from 'shelljs';
import { ConfigResponses, Msg } from '../src/config';

let testSession: TestSession;

describe('Interoperability NUTs', async () => {
  ensureString(env.getString('TESTKIT_AUTH_URL'), 'TESTKIT_AUTH_URL must be set in the environment');
  env.setString('TESTKIT_EXECUTABLE_PATH', path.join(process.cwd(), 'bin', 'dev'));

  const ORG_ALIAS = 'my-org';

  before(async () => {
    testSession = await TestSession.create({
      project: { name: 'interoperabilityNUTs' },
      setupCommands: [`sfdx force:org:create -f config/project-scratch-def.json -a ${ORG_ALIAS}`],
    });
  });

  async function readConfig(folder: '.sf' | '.sfdx'): Promise<AnyJson> {
    const filename = folder === '.sf' ? 'config.json' : 'sfdx-config.json';
    return fs.readJson(path.join(testSession.project.dir, folder, filename));
  }

  async function configShouldHave(folder: '.sf' | '.sfdx', key: string, value: AnyJson) {
    const config = await readConfig(folder);
    expect(config).to.have.property(key);
    expect(config[key]).to.equal(value);
  }

  async function configShouldNotHave(folder: '.sf' | '.sfdx', key: string) {
    const config = await readConfig(folder);
    expect(config).to.not.have.property(key);
  }

  beforeEach(() => {
    execCmd('config unset target-org target-dev-hub apiVersion', { ensureExitCode: 0 });
  });

  describe('sf config set', () => {
    it('should set target-org in .sf and defaultusername in .sfdx', async () => {
      const result = execCmd<ConfigResponses>(`config set target-org ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME, ORG_ALIAS);
      await configShouldHave('.sf', OrgConfigProperties.TARGET_ORG, ORG_ALIAS);
    });

    it('should set target-dev-hub in .sf and defaultdevhubusername in .sfdx', async () => {
      const result = execCmd<ConfigResponses>(`config set target-dev-hub ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, ORG_ALIAS);
      await configShouldHave('.sf', OrgConfigProperties.TARGET_DEV_HUB, ORG_ALIAS);
    });

    it('should set apiVersion in .sf and in .sfdx', async () => {
      const apiVersion = '52.0';
      const result = execCmd<ConfigResponses>(`config set apiVersion ${apiVersion} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: SfdxPropertyKeys.API_VERSION, value: apiVersion, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldHave('.sfdx', SfdxPropertyKeys.API_VERSION, apiVersion);
      await configShouldHave('.sf', SfdxPropertyKeys.API_VERSION, apiVersion);
    });

    it('should fail to set defaultusername', async () => {
      const result = execCmd<ConfigResponses>(`config set defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should fail to set defaultdevhubusername', async () => {
      const result = execCmd<ConfigResponses>(`config set defaultdevhubusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);
    });
  });

  describe('sf config list', () => {
    it('should list target-org when defaultusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultusername=${ORG_ALIAS}`, { silent: true });
      const result = execCmd<ConfigResponses>('config list --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true, location: 'Local' }];
      expect(result).to.deep.equal(expected);
    });

    it('should list target-dev-hub when defaultdevhubusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      const result = execCmd<ConfigResponses>('config list --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true, location: 'Local' },
      ];
      expect(result).to.deep.equal(expected);
    });
  });

  describe('sf config get', () => {
    it('should get target-org when defaultusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultusername=${ORG_ALIAS}`, { silent: true });
      const result = execCmd<Msg>('config get target-org --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true, location: 'Local' }];
      expect(result).to.deep.equal(expected);
    });

    it('should get target-dev-hub when defaultdevhubusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      const result = execCmd<Msg>('config get target-dev-hub --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [
        {
          name: OrgConfigProperties.TARGET_DEV_HUB,
          value: ORG_ALIAS,
          success: true,
          location: 'Local',
        },
      ];
      expect(result).to.deep.equal(expected);
    });

    it('should fail to get defaultusername', async () => {
      const result = execCmd<ConfigResponses>(`config get defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should fail to get defaultdevhubusername', async () => {
      const result = execCmd<ConfigResponses>(`config get defaultdevhubusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);
    });
  });

  describe('sf config unset', () => {
    it('should unset target-org in .sf and defaultusername in .sfdx', async () => {
      exec(`sfdx config:set defaultusername=${ORG_ALIAS}`, { silent: true });
      const result = execCmd<ConfigResponses>('config unset target-org --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldNotHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME);
      await configShouldNotHave('.sf', OrgConfigProperties.TARGET_ORG);
    });

    it('should set target-dev-hub in .sf and defaultdevhubusername in .sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      const result = execCmd<ConfigResponses>('config unset target-dev-hub --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_DEV_HUB, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldNotHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);
      await configShouldNotHave('.sf', OrgConfigProperties.TARGET_DEV_HUB);
    });

    it('should set apiVersion in .sf and in .sfdx', async () => {
      exec('sfdx config:set apiVersion=52.0', { silent: true });
      const result = execCmd<ConfigResponses>('config unset apiVersion --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: SfdxPropertyKeys.API_VERSION, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldNotHave('.sfdx', SfdxPropertyKeys.API_VERSION);
      await configShouldNotHave('.sf', SfdxPropertyKeys.API_VERSION);
    });

    it('should fail to unset defaultusername', async () => {
      const result = execCmd<ConfigResponses>(`config unset defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should fail to unset defaultdevhubusername', async () => {
      const result = execCmd<ConfigResponses>(`config unset defaultdevhubusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);
    });
  });
});

after(async () => {
  await testSession?.clean();
});
