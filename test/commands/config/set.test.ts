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

  describe('Testing calls made to core\'s Config.set() method', () => {
    test
      .stdout()
      .command(['config:set', 'apiVersion=49.0', '-g'])
      .it('set passes', () => {
        expect(configSpy.callCount).to.equal(1);
        expect(configSpy.args[0][0]).to.equal('apiVersion');
        expect(configSpy.args[0][1]).to.equal('49.0');
      });
  });

  describe('Testing errors that can be thrown', () => {
    test
      .stderr()
      .stdout()
      .command(['config:set', 'badName=49.0', '-g'])
      .it('set fails on invalid config key', ctx => {
        expect(configSpy.threw()).to.be.true;
        expect(ctx.stderr).to.contain('Unknown config name');
      });

    test
      .stderr()
      .stdout()
      .command(['config:set', 'apiVersion=badValue', '-g'])
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

  describe('Testing console output', () => {
    //Test of console output?
  });


  describe('Testing JSON output', () => {
    test
      .stdout()
      .withOrg()
      .command(['config:set', 'apiVersion=49.0', 'defaultdevhubusername=DevHub', '-g', '--json'])
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
        expect(jsonOutput.result.successes[0])
          .to.have.property('value')
          .and.equal('49.0');
        expect(jsonOutput.result.successes[1])
          .to.have.property('name')
          .and.equal('defaultdevhubusername');
        expect(jsonOutput.result.successes[1])
          .to.have.property('value')
          .and.equal('DevHub');
        expect(jsonOutput.result).to.have.property('failures');
        expect(jsonOutput.result.failures.length).to.equal(0);
      });

    test
      .stdout()
      .stderr()
      .withOrg()
      .command(['config:set', 'apiVersion=badValue', 'defaultdevhubusername=badValue', '-g', '--json'])
      .it('Two failed sets', ctx => {
        expect(ctx.stderr).to.equal('nice');
        const jsonOutput = JSON.parse(ctx.stdout);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(1);
        expect(jsonOutput).to.have.property('result');
        expect(jsonOutput.result).to.have.property('successes');
        expect(jsonOutput.result.successes.length).to.equal(0);
        expect(jsonOutput.result).to.have.property('failures');
        expect(jsonOutput.result.failures[0])
          .to.have.property('name')
          .and.equal('apiVersion');
        expect(jsonOutput.result.failures[0])
          .to.have.property('message')
          .and.include('Invalid config value');
        expect(jsonOutput.result.failures[1])
          .to.have.property('name')
          .and.equal('defaultdevhubusername');
        expect(jsonOutput.result.failures[1])
          .to.have.property('message')
          .and.equal('No org configuration found');
      });

    // Test of any other errors? This is least needed
  });

  describe('Testing global flag', () => {
    // We need a way to test if setting the config locally / globally is working
  });

});
