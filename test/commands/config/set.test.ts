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

  describe("Testing calls made to core's Config.set() method", () => {
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
      .command(['config:set'])
      .it('no config keys provided', ctx => {
        expect(ctx.stderr).to.contain('Provide required name=value pairs');
      });

    test
      .stderr()
      .command(['config:set', 'keyNoValue'])
      .it('provided key with no value', ctx => {
        expect(ctx.stderr).to.contain(
          'Setting variables must be in the format <key>=<value>'
        );
      });

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
    //   .stderr()
    //   .stdout()
    //   .withProject({})
    //   .command(['config:set', 'apiVersion=49.0'])
    //   .it('not using global outside of a sfdx project', ctx => {
    //     expect(ctx.stderr).to.contain('This directory does not contain a valid Salesforce DX project');
    //   })

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
    test
      .stdout()
      .stderr()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'instanceUrl=badValue',
        'apiVersion=badValue'
      ])
      .it('Table with both successes and failures', ctx => {
        let noWhitespaceOutput = ctx.stdout.replace(/\s+/g, '');
        expect(noWhitespaceOutput).to.contain(
          'defaultdevhubusernameDevHubtrue'
        );
        expect(noWhitespaceOutput).to.contain('instanceUrlbadValuefalse');
        expect(noWhitespaceOutput).to.contain('apiVersionbadValuefalse');
      });
  });

  describe('Testing JSON output', () => {
    test
      .stdout()
      .command([
        'config:set',
        'apiVersion=49.0',
        'defaultdevhubusername=DevHub',
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
      .command([
        'config:set',
        'apiVersion=badValue',
        'instanceUrl=badValue',
        '--json'
      ])
      .it('Two failed sets', ctx => {
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
          .and.contain('Invalid config value');
        expect(jsonOutput.result.failures[1])
          .to.have.property('name')
          .and.equal('instanceUrl');
        expect(jsonOutput.result.failures[1])
          .to.have.property('message')
          .and.contain('Invalid config value');
      });
  });

  describe('Testing global flag', () => {
    // We really need a way to test if setting the config locally vs. globally is working as intended
  });
});
