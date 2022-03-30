/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { test, expect } from '@oclif/test';
import { Config, Org, OrgConfigProperties } from '@salesforce/core';
import { StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import * as sinon from 'sinon';

describe('config:set', () => {
  let configStub: StubbedType<Config>;
  let orgStub: StubbedType<Org>;
  let orgCreateSpy: SinonStub;
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  async function prepareStubs() {
    configStub = stubInterface<Config>(sandbox, {});
    stubMethod(sandbox, Config, 'create').callsFake(async () => configStub);
  }

  test
    .do(async () => await prepareStubs())
    .stdout()
    .command(['config:set', `${OrgConfigProperties.ORG_API_VERSION}=49.0`, '--global', '--json'])
    .it('should return values for all configured properties', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([{ name: OrgConfigProperties.ORG_API_VERSION, value: '49.0', success: true }]);
      expect(configStub.set.callCount).to.equal(1);
    });

  test
    .do(async () => {
      await prepareStubs();
      orgStub = stubInterface<Org>(sandbox, {});
      orgCreateSpy = stubMethod(sandbox, Org, 'create').callsFake(async () => orgStub);
    })
    .stdout()
    .command(['config:set', `${OrgConfigProperties.TARGET_ORG}=MyUser`, '--global', '--json'])
    .it('should instantiate an Org when target-org is set', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([{ name: OrgConfigProperties.TARGET_ORG, value: 'MyUser', success: true }]);
      expect(configStub.set.callCount).to.equal(1);
      expect(orgCreateSpy.callCount).to.equal(1);
    });

  test
    .do(async () => {
      await prepareStubs();
      orgStub = stubInterface<Org>(sandbox, {});
      orgCreateSpy = stubMethod(sandbox, Org, 'create').callsFake(async () => orgStub);
    })
    .stdout()
    .command(['config:set', `${OrgConfigProperties.TARGET_DEV_HUB}=MyDevhub`, '--global', '--json'])
    .it('should instantiate an Org when target-dev-hub is set', (ctx) => {
      const { result } = JSON.parse(ctx.stdout);
      expect(result).to.deep.equal([{ name: OrgConfigProperties.TARGET_DEV_HUB, value: 'MyDevhub', success: true }]);
      expect(configStub.set.callCount).to.equal(1);
      expect(orgCreateSpy.callCount).to.equal(1);
    });

  describe('error cases', () => {
    beforeEach(() => {
      stubMethod(sandbox, Org, 'create').callsFake(async () => {
        throw new Error('No AuthInfo found');
      });
    });

    test
      .stdout()
      .command(['config:set', `${OrgConfigProperties.TARGET_ORG}=NonExistentOrg`, '--global', '--json'])
      .it('should handle failed org create with --json flag', (ctx) => {
        const { result } = JSON.parse(ctx.stdout);
        expect(result).to.deep.equal([
          {
            error: {
              cause: {},
              exitCode: 1,
              name: 'Error',
            },
            name: OrgConfigProperties.TARGET_ORG,
            message: 'Invalid config value: org "NonExistentOrg" is not authenticated.',
            success: false,
            value: 'NonExistentOrg',
          },
        ]);
      });

    test
      .stdout()
      .command(['config:set', `${OrgConfigProperties.TARGET_ORG}=NonExistentOrg`, '--global'])
      .it('should handle failed org create with no --json flag', (ctx) => {
        expect(ctx.stdout).to.include(OrgConfigProperties.TARGET_ORG);
        expect(ctx.stdout).to.include('NonExistentOrg');
        expect(ctx.stdout).to.include('false');
      });
  });
});
