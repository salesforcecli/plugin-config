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

describe('config:unset', async () => {
  let configSpy: sinon.SinonSpy;
  beforeEach(() => {
    configSpy = sinon.spy(Config.prototype, 'unset');
  });

  afterEach(() => {
    configSpy.restore();
  });

  describe("Testing calls made to core's Config.unset() method", () => {
    test
      .stdout()
      .command(['config:unset', 'apiVersion', '-g'])
      .it('unset passes', () => {
        expect(configSpy.callCount).to.equal(1);
        expect(configSpy.args[0][0]).to.equal('apiVersion');
      });
  });

  describe('Testing errors that can be thrown', () => {
    test
      .stderr()
      .command(['config:unset'])
      .it('no config keys provided', ctx => {
        expect(ctx.stderr).to.contain('NoConfigKeysFound');
      });

    // test
    //   .stderr()
    //   .stdout()
    //   .command(['config:unset', 'badKey', '-g'])
    //   .it('unset fails on invalid config key', ctx => {
    //     expect(configSpy.threw()).to.be.true;
    //     expect(ctx.stderr).to.contain('Unknown config name');
    //   });
  });

  // describe('Testing console output', () => {
  //   test
  //     .stdout()
  //     .stderr()
  //     .command(['config:unset', 'defaultdevhubusername', 'badKey', '-g'])
  //     .it('Table with both successes and failures', ctx => {
  //       let noWhitespaceOutput = ctx.stdout.replace(/\s+/g, '');
  //       expect(noWhitespaceOutput).to.contain('defaultdevhubusernametrue');
  //       expect(noWhitespaceOutput).to.contain('badKeyfalse');
  //     });
  // });

  describe('Testing JSON output', () => {
    test
      .stdout()
      .command([
        'config:unset',
        'apiVersion',
        'defaultdevhubusername',
        '-g',
        '--json'
      ])
      .it('Two successesful sets', ctx => {
        const jsonOutput = JSON.parse(ctx.stdout);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(0);
        expect(jsonOutput).to.have.property('result');
        expect(jsonOutput.result).to.have.property('successes');
        expect(jsonOutput.result.successes[0])
          .to.have.property('name')
          .and.equal('apiVersion');
        expect(jsonOutput.result.successes[1])
          .to.have.property('name')
          .and.equal('defaultdevhubusername');
        expect(jsonOutput.result).to.have.property('failures');
        expect(jsonOutput.result.failures.length).to.equal(0);
      });

    // test
    //   .stdout()
    //   .command(['config:unset', 'badKey', '--json'])
    //   .it('Two failed sets', ctx => {
    //     const jsonOutput = JSON.parse(ctx.stdout);
    //     expect(jsonOutput)
    //       .to.have.property('status')
    //       .and.equal(1);
    //     expect(jsonOutput).to.have.property('result');
    //     expect(jsonOutput.result).to.have.property('successes');
    //     expect(jsonOutput.result.successes.length).to.equal(0);
    //     expect(jsonOutput.result).to.have.property('failures');
    //     expect(jsonOutput.result.failures[0])
    //       .to.have.property('name')
    //       .and.equal('badKey');
    //     expect(jsonOutput.result.failures[0])
    //       .to.have.property('message')
    //       .and.contain('Unknown config name');
    //   });
  });
});
