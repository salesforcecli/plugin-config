/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty

import * as sinon from 'sinon';
import { test, expect } from '@salesforce/command/lib/test';
import { Config } from '@salesforce/core';

describe('config:set', async () => {
  let configSpy: sinon.SinonSpy;
  beforeEach(() => {
    configSpy = sinon.spy(Config.prototype, 'set');
  });

  afterEach(() => {
    configSpy.restore();
  });

  test
    .stdout()
    .command(['config:set', 'apiVersion=49.0', '-g'])
    .it('set passes', () => {
      expect(configSpy.callCount).to.equal(1);
      expect(configSpy.args[0][0]).to.equal('apiVersion');
      expect(configSpy.args[0][1]).to.equal('49.0');
    });

  test
    .stderr()
    .stdout()
    .command(['config:set', 'colby=49', '-g'])
    .it('set fails on invalid config key', ctx => {
      expect(configSpy.threw()).to.be.true;
      expect(ctx.stderr).to.contain('Unknown config name');
    });

  test
    .stderr()
    .stdout()
    .command(['config:set', 'apiVersion=49', '-g'])
    .it('set fails on invalid config value', ctx => {
      expect(configSpy.threw()).to.be.true;
      expect(ctx.stderr).to.contain('Invalid config value');
    });

  // test
  //   .withOrg({ alias: 'testOrg' }, true)
  //   .withProject()
  //   .stderr()
  //   .stdout()
  //   .command(['config:set', 'defaultusername=wrong', '-g'])
  //   .it('set passes on org key', ctx => {
  //     expect(ctx.stderr).to.contain('No AuthInfo found');
  //   });
});
