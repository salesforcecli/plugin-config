/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty

import * as sinon from 'sinon';
// import { join as pathJoin } from 'path';
import { test, expect } from '@salesforce/command/lib/test';
// import { command } from '@oclif/test';
// import * as OclifConfig from '@oclif/config';
import { ConfigAggregator } from '@salesforce/core';
// import { assert } from 'chai';

describe('config:get', () => {
  const sandbox = sinon.createSandbox();

  let getInfoSpy: sinon.SinonSpy;

  beforeEach(() => {
    getInfoSpy = sandbox.spy(ConfigAggregator.prototype, 'getInfo');
  });

  afterEach(() => {
    sandbox.restore();
  });

  test
    .stdout()
    .command(['config:get', 'defaultdevhubusername', 'defaultusername'])
    .it('Gets info with correct arguments', () => {
      expect(getInfoSpy.callCount).to.equal(3);
      expect(getInfoSpy.args[0][0]).to.equal('apiVersion');
      expect(getInfoSpy.args[1][0]).to.equal('defaultdevhubusername');
      expect(getInfoSpy.args[2][0]).to.equal('defaultusername');
    });

  test
    .stdout()
    .command([
      'config:get',
      'defaultdevhubusername',
      '--json',
      '--verbose',
      '--loglevel=warn'
    ])
    .it('Does not get info for flag arguements', () => {
      expect(getInfoSpy.callCount).to.equal(2);
      expect(getInfoSpy.args[0][0]).to.equal('apiVersion');
      expect(getInfoSpy.args[1][0]).to.equal('defaultdevhubusername');
    });

  test
    .stderr()
    .command(['config:get'])
    .it('Error is thrown when no arguments are passd in', ctx => {
      expect(ctx.stderr).to.contain('Please provide config name(s) to get');
    });

  test
    .stderr()
    .stdout()
    .command(['config:get', 'badArg'])
    .it('Error is thrown when a bad argument is passed in', ctx => {
      expect(ctx.stderr).to.contain('Unknown config key: badArg');
    });

  test
    .stdout()
    .command([
      'config:get',
      'defaultdevhubusername',
      'defaultusername',
      '--json'
    ])
    .it('Json output is corrext for normal command', ctx => {
      const jsonOutput = JSON.parse(ctx.stdout);
      expect(jsonOutput)
        .to.have.property('status')
        .and.equal(0);
      expect(jsonOutput).to.have.property('values');
      expect(jsonOutput.values).to.have.property('');
    });
});
