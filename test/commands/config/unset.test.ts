/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { $$, expect, test } from '@salesforce/command/lib/test';
import { Config } from '@salesforce/core';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';

describe('config:unset', () => {
  let configStub: StubbedType<Config>;

  async function prepareStubs(throwsError = false) {
    if (throwsError) {
      configStub = stubInterface<Config>($$.SANDBOX, {
        unset: () => {
          throw new Error('Unset Error!');
        },
      });
    } else {
      configStub = stubInterface<Config>($$.SANDBOX, {});
    }

    stubMethod($$.SANDBOX, Config, 'create').callsFake(async () => configStub);
  }

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:unset', `${Config.API_VERSION}`, '--global', '--json'])
    .it('should unset values for a single property', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result.successes).to.deep.equal([{ name: Config.API_VERSION }]);
      expect(configStub.unset.callCount).to.equal(1);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:unset', `${Config.API_VERSION}`, `${Config.DEFAULT_DEV_HUB_USERNAME}`, '--global', '--json'])
    .it('should unset values for multiple properties', (ctx) => {
      const result = JSON.parse(ctx.stdout).result;
      expect(result.successes).to.deep.equal([{ name: Config.API_VERSION }, { name: Config.DEFAULT_DEV_HUB_USERNAME }]);
      expect(configStub.unset.callCount).to.equal(2);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:unset', '--json'])
    .it('should throw an error if no properties are provided', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.status).to.equal(1);
      expect(response.name).to.equal('NoConfigKeysFound');
    });

  test
    .do(async () => await prepareStubs(true))
    .stdout()
    .command(['config:unset', `${Config.API_VERSION}`, '--global', '--json'])
    .it('should handle errors with --json flag', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.status).to.equal(1);
      expect(response.result.failures).to.deep.equal([{ name: Config.API_VERSION, message: 'Unset Error!' }]);
    });

  test
    .do(async () => await prepareStubs(true))
    .stdout()
    .command(['config:unset', `${Config.API_VERSION}`, '--global'])
    .it('should handle errors with --json flag', (ctx) => {
      expect(ctx.stdout).to.include(Config.API_VERSION);
      expect(ctx.stdout).to.include('false');
    });
});
