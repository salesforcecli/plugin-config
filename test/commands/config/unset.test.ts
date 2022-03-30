/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { test, expect } from '@oclif/test';
import { Config, OrgConfigProperties } from '@salesforce/core';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { SinonSandbox } from 'sinon';
import * as sinon from 'sinon';

describe('config:unset', () => {
  let configStub: StubbedType<Config>;
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function prepareStubs(throwsError = false) {
    if (throwsError) {
      configStub = stubInterface<Config>(sandbox, {
        unset: () => {
          throw new Error('Unset Error!');
        },
      });
    } else {
      configStub = stubInterface<Config>(sandbox, {});
    }

    stubMethod(sandbox, Config, 'create').callsFake(async () => configStub);
  }

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:unset', `${OrgConfigProperties.ORG_API_VERSION}`, '--global', '--json'])
    .it('should unset values for a single property', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([{ name: OrgConfigProperties.ORG_API_VERSION, success: true }]);
      expect(configStub.unset.callCount).to.equal(1);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command([
      'config:unset',
      `${OrgConfigProperties.ORG_API_VERSION}`,
      `${OrgConfigProperties.TARGET_DEV_HUB}`,
      '--global',
      '--json',
    ])
    .it('should unset values for multiple properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        { name: OrgConfigProperties.ORG_API_VERSION, success: true },
        { name: OrgConfigProperties.TARGET_DEV_HUB, success: true },
      ]);
      expect(configStub.unset.callCount).to.equal(2);
    });

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:unset', '--json'])
    .it('should throw an error if no properties are provided', (ctx) => {
      const response = JSON.parse(ctx.stdout);
      expect(response.name).to.equal('NoConfigKeysFoundError');
    });

  test
    .do(async () => await prepareStubs(true))
    .stdout()
    .command(['config:unset', `${OrgConfigProperties.ORG_API_VERSION}`, '--global', '--json'])
    .it('should handle errors with --json flag', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([
        {
          error: {
            cause: {},
            exitCode: 1,
            name: 'Error',
          },
          name: OrgConfigProperties.ORG_API_VERSION,
          message: 'Unset Error!',
          success: false,
        },
      ]);
    });

  test
    .do(async () => await prepareStubs(true))
    .stdout()
    .command(['config:unset', `${OrgConfigProperties.ORG_API_VERSION}`, '--global'])
    .it('should handle errors with no --json flag', (ctx) => {
      expect(ctx.stdout).to.include(OrgConfigProperties.ORG_API_VERSION);
      expect(ctx.stdout).to.include('false');
    });
});
