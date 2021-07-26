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
import { ConfigResponses } from '../src/config';

let testSession: TestSession;

describe('Interoperability NUTs', async () => {
  ensureString(env.getString('TESTKIT_AUTH_URL'), 'TESTKIT_AUTH_URL must be set in the environment');
  env.setString('TESTKIT_EXECUTABLE_PATH', path.join(process.cwd(), 'bin', 'dev'));

  const ORG_ALIAS = 'my-org';
  testSession = await TestSession.create({
    project: { name: 'interoperabilityNUTs' },
    setupCommands: [`sfdx force:org:create -f config/project-scratch-def.json -a ${ORG_ALIAS}`],
  });

  async function readConfig(folder: '.sf' | '.sfdx'): Promise<AnyJson> {
    const filename = folder === '.sf' ? 'config.json' : 'sfdx-config.json';
    return fs.readJson(path.join(testSession.project.dir, folder, filename));
  }

  describe('config sf/sfdx interoperability', () => {
    it('should set defaultusername in .sf and .sfdx', async () => {
      const result = execCmd<ConfigResponses>(`config set defaultusername ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: SfdxPropertyKeys.DEFAULT_USERNAME, value: ORG_ALIAS, success: true }];
      expect(result).to.deep.equal(expected);

      const sfdxConfig = await readConfig('.sfdx');
      const sfConfig = await readConfig('.sf');
      expect(sfdxConfig).to.have.property(SfdxPropertyKeys.DEFAULT_USERNAME);
      expect(sfdxConfig[SfdxPropertyKeys.DEFAULT_USERNAME]).to.equal(ORG_ALIAS);
      expect(sfConfig).to.have.property(SfdxPropertyKeys.DEFAULT_USERNAME);
      expect(sfConfig[SfdxPropertyKeys.DEFAULT_USERNAME]).to.equal(ORG_ALIAS);
    });

    it('should unset defaultusername in .sf and .sfdx', async () => {
      const result = execCmd<ConfigResponses>('config unset defaultusername --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: SfdxPropertyKeys.DEFAULT_USERNAME, success: true }];
      expect(result).to.deep.equal(expected);

      const sfdxConfig = await readConfig('.sfdx');
      const sfConfig = await readConfig('.sf');
      expect(sfdxConfig).to.not.have.property(SfdxPropertyKeys.DEFAULT_USERNAME);
      expect(sfConfig).to.not.have.property(SfdxPropertyKeys.DEFAULT_USERNAME);
    });

    it('should set target-org in .sf and .sfdx', async () => {
      const result = execCmd<ConfigResponses>(`config set target-org ${ORG_ALIAS} --json`, {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, value: ORG_ALIAS, success: true }];
      expect(result).to.deep.equal(expected);

      const sfdxConfig = await readConfig('.sfdx');
      const sfConfig = await readConfig('.sf');

      expect(sfdxConfig).to.have.property(OrgConfigProperties.TARGET_ORG);
      expect(sfdxConfig[OrgConfigProperties.TARGET_ORG]).to.equal(ORG_ALIAS);
      expect(sfConfig).to.have.property(OrgConfigProperties.TARGET_ORG);
      expect(sfConfig[OrgConfigProperties.TARGET_ORG]).to.equal(ORG_ALIAS);
    });

    it('should unset target-org in .sf and .sfdx', async () => {
      const result = execCmd<ConfigResponses>('config unset target-org --json', {
        ensureExitCode: 0,
        cli: 'sf',
      }).jsonOutput;
      const expected = [{ name: OrgConfigProperties.TARGET_ORG, success: true }];
      expect(result).to.deep.equal(expected);

      const sfdxConfig = await readConfig('.sfdx');
      const sfConfig = await readConfig('.sf');
      expect(sfdxConfig).to.not.have.property(OrgConfigProperties.TARGET_ORG);
      expect(sfConfig).to.not.have.property(OrgConfigProperties.TARGET_ORG);
    });
  });
});

after(async () => {
  await testSession?.clean();
});
