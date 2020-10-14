/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { $$, expect, test } from '@salesforce/command/lib/test';
import { Config, Org } from '@salesforce/core';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { SinonStub } from 'sinon';

describe('config:set', () => {
  let configStub: StubbedType<Config>;
  let orgStub: StubbedType<Org>;
  let orgCreateSpy: SinonStub;

  async function prepareStubs() {
    configStub = stubInterface<Config>($$.SANDBOX, {});
    stubMethod($$.SANDBOX, Config, 'create').callsFake(async () => configStub);
  }

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:set', `${Config.API_VERSION}=49.0`, '--global', '--json'])
    .it('should return values for all configured properties', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result.successes).to.deep.equal([{ name: Config.API_VERSION, value: '49.0' }]);
      expect(configStub.set.callCount).to.equal(1);
    });

  test
    .do(async () => {
      await prepareStubs();
      orgStub = stubInterface<Org>($$.SANDBOX, {});
      orgCreateSpy = stubMethod($$.SANDBOX, Org, 'create').callsFake(async () => orgStub);
    })
    .stdout()
    .command(['config:set', `${Config.DEFAULT_USERNAME}=MyUser`, '--global', '--json'])
    .it('should instantiate an Org when defaultusername is set', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result.successes).to.deep.equal([{ name: Config.DEFAULT_USERNAME, value: 'MyUser' }]);
      expect(configStub.set.callCount).to.equal(1);
      expect(orgCreateSpy.callCount).to.equal(1);
    });

  test
    .do(async () => {
      await prepareStubs();
      orgStub = stubInterface<Org>($$.SANDBOX, {});
      orgCreateSpy = stubMethod($$.SANDBOX, Org, 'create').callsFake(async () => orgStub);
    })
    .stdout()
    .command(['config:set', `${Config.DEFAULT_DEV_HUB_USERNAME}=MyDevhub`, '--global', '--json'])
    .it('should instantiate an Org when defaultusername is set', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result.successes).to.deep.equal([{ name: Config.DEFAULT_DEV_HUB_USERNAME, value: 'MyDevhub' }]);
      expect(configStub.set.callCount).to.equal(1);
      expect(orgCreateSpy.callCount).to.equal(1);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:set', `${Config.DEFAULT_USERNAME}=NonExistentOrg`, '--global', '--json'])
    .it('should handle failed org create with --json flag', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.status).to.equal(1);
      expect(response.result.failures).to.deep.equal([
        { name: Config.DEFAULT_USERNAME, message: 'No AuthInfo found for name NonExistentOrg' },
      ]);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:set', `${Config.DEFAULT_USERNAME}=NonExistentOrg`, '--global'])
    .it('should handle failed org create with no --json flag', (ctx) => {
      expect(ctx.stdout).to.include(Config.DEFAULT_USERNAME);
      expect(ctx.stdout).to.include('NonExistentOrg');
      expect(ctx.stdout).to.include('false');
    });
});
