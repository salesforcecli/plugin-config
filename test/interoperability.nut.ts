/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as path from 'path';
import { readJson, writeJson } from 'fs-extra';
import { execCmd, TestSession } from '@salesforce/cli-plugins-testkit';
import { SfdxPropertyKeys, OrgConfigProperties } from '@salesforce/core';
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
    return readJson(path.join(testSession.project.dir, folder, filename)) as Promise<AnyJson>;
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
    execCmd('config unset target-org target-dev-hub org-api-version', { ensureExitCode: 0 });
  });

  describe('sf config set', () => {
    it('should set target-org in .sf and defaultusername in .sfdx', async () => {
      const { result } = execCmd<ConfigResponses>(`config set target-org ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME, ORG_ALIAS);
      await configShouldHave('.sf', OrgConfigProperties.TARGET_ORG, ORG_ALIAS);
    });

    it('should set target-dev-hub in .sf and defaultdevhubusername in .sfdx', async () => {
      const { result } = execCmd<ConfigResponses>(`config set target-dev-hub ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, ORG_ALIAS);
      await configShouldHave('.sf', OrgConfigProperties.TARGET_DEV_HUB, ORG_ALIAS);
    });

    it('should fail to set defaultusername', async () => {
      const { result } = execCmd<ConfigResponses>(`config set defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should fail to set defaultdevhubusername', async () => {
      const { result } = execCmd<ConfigResponses>(`config set defaultdevhubusername ${ORG_ALIAS} --json`, {
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
      const { result } = execCmd<ConfigResponses>('config list --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true, location: 'Local' }];
      expect(result).to.deep.equal(expected);
    });

    it('should list target-dev-hub when defaultdevhubusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      const { result } = execCmd<ConfigResponses>('config list --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true, location: 'Local' },
      ];
      expect(result).to.deep.equal(expected);
    });
  });

  describe('sf config get', () => {
    it('should get target-org when defaultusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultusername=${ORG_ALIAS}`, { silent: true });
      const { result } = execCmd<Msg>('config get target-org --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true, location: 'Local' }];
      expect(result).to.deep.equal(expected);
    });

    it('should get target-dev-hub when defaultdevhubusername is set by sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      const { result } = execCmd<Msg>('config get target-dev-hub --json', { ensureExitCode: 0, cli: 'sf' }).jsonOutput;
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
      const { result } = execCmd<ConfigResponses>(`config get defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should fail to get defaultdevhubusername', async () => {
      const { result } = execCmd<ConfigResponses>(`config get defaultdevhubusername ${ORG_ALIAS} --json`, {
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
      const { result } = execCmd<ConfigResponses>('config unset target-org --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldNotHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME);
      await configShouldNotHave('.sf', OrgConfigProperties.TARGET_ORG);
    });

    it('should unset target-dev-hub in .sf and defaultdevhubusername in .sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      const { result } = execCmd<ConfigResponses>('config unset target-dev-hub --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_DEV_HUB, success: true }];
      expect(result).to.deep.equal(expected);

      await configShouldNotHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);
      await configShouldNotHave('.sf', OrgConfigProperties.TARGET_DEV_HUB);
    });

    it('should fail to unset defaultusername', async () => {
      const { result } = execCmd<ConfigResponses>(`config unset defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should fail to unset defaultdevhubusername', async () => {
      const { result } = execCmd<ConfigResponses>(`config unset defaultdevhubusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 1,
        cli: 'sf',
      }).jsonOutput;
      expect(result[0].success).to.be.false;
      expect(result[0].name).to.equal(SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);
    });
  });

  describe('sfdx config:set', () => {
    it('should set target-org in .sf and defaultusername in .sfdx', async () => {
      exec(`sfdx config:set defaultusername=${ORG_ALIAS}`, { silent: true });
      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME, ORG_ALIAS);

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get target-org --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [
        { name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true, location: 'Local' },
      ];
      expect(getResult).to.deep.equal(getExpected);
    });

    it('should set target-dev-hub in .sf and defaultdevhubusername in .sfdx', async () => {
      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, ORG_ALIAS);

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get target-dev-hub --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true, location: 'Local' },
      ];
      expect(getResult).to.deep.equal(getExpected);
    });

    it('should overwrite existing .sf configs', async () => {
      execCmd<ConfigResponses>('config set org-api-version=51.0 --json', {
        ensureExitCode: 0,
        cli: 'sf',
      });
      await configShouldHave('.sf', OrgConfigProperties.ORG_API_VERSION, '51.0');

      exec('sfdx config:set apiVersion=52.0', { silent: true });
      await configShouldHave('.sfdx', SfdxPropertyKeys.API_VERSION, '52.0');

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get org-api-version --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [
        { name: OrgConfigProperties.ORG_API_VERSION, value: '52.0', success: true, location: 'Local' },
      ];
      expect(getResult).to.deep.equal(getExpected);
    });

    it('should overwrite existing target-org config in .sf', async () => {
      const config = { [OrgConfigProperties.TARGET_ORG]: 'foobar' };
      // write the config file directly so that we don't have to authorize another org
      await writeJson(path.join(testSession.project.dir, '.sf', 'config.json'), config);
      await configShouldHave('.sf', OrgConfigProperties.TARGET_ORG, 'foobar');

      exec(`sfdx config:set defaultusername=${ORG_ALIAS}`, { silent: true });
      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME, ORG_ALIAS);

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get target-org --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [
        { name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true, location: 'Local' },
      ];
      expect(getResult).to.deep.equal(getExpected);
    });

    it('should overwrite existing target-dev-hub config in .sf', async () => {
      const config = { [OrgConfigProperties.TARGET_DEV_HUB]: 'foobar' };
      // write the config file directly so that we don't have to authorize another org
      await writeJson(path.join(testSession.project.dir, '.sf', 'config.json'), config);
      await configShouldHave('.sf', OrgConfigProperties.TARGET_DEV_HUB, 'foobar');

      exec(`sfdx config:set defaultdevhubusername=${ORG_ALIAS}`, { silent: true });
      await configShouldHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME, ORG_ALIAS);

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get target-dev-hub --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [
        { name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true, location: 'Local' },
      ];
      expect(getResult).to.deep.equal(getExpected);
    });
  });

  describe('sfdx config:unset', () => {
    it('should unset target-org in .sf and defaultusername in .sfdx', async () => {
      const setResult = execCmd<ConfigResponses>(`config set target-org ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const setExpected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true }];
      expect(setResult).to.deep.equal(setExpected);

      exec('sfdx config:unset defaultusername', { silent: true });
      await configShouldNotHave('.sfdx', SfdxPropertyKeys.DEFAULT_USERNAME);

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get target-org --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [{ name: OrgConfigProperties.TARGET_ORG, success: true }];
      expect(getResult).to.deep.equal(getExpected);
    });

    it('should unset target-dev-hub in .sf and defaultdevhubusername in .sfdx', async () => {
      const setResult = execCmd<ConfigResponses>(`config set target-dev-hub ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const setExpected = [{ name: OrgConfigProperties.TARGET_DEV_HUB, value: ORG_ALIAS, success: true }];
      expect(setResult).to.deep.equal(setExpected);

      exec('sfdx config:unset defaultdevhubusername', { silent: true });
      await configShouldNotHave('.sfdx', SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME);

      // We can't check .sf/config.json directly because sfdx doesn't write back to sf
      // Instead we test this by running `config get`
      const getResult = execCmd<ConfigResponses>('config get target-dev-hub --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput.result;
      const getExpected = [{ name: OrgConfigProperties.TARGET_DEV_HUB, success: true }];
      expect(getResult).to.deep.equal(getExpected);
    });
  });
});

after(async () => {
  await testSession?.clean();
});
