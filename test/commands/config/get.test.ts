import * as sinon from 'sinon';
import { test, expect } from '@salesforce/command/lib/test';
import { ConfigAggregator } from '@salesforce/core';
import * as path from 'path';

describe('config:get', () => {
  describe("Testing calls made to core's ConfigAggregator.getInfo() method", () => {
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
      .it('Gets info for correct arguments', () => {
        expect(getInfoSpy.callCount).to.equal(3);
        expect(getInfoSpy.args[0][0]).to.equal('apiVersion');
        expect(getInfoSpy.args[1][0]).to.equal('defaultdevhubusername');
        expect(getInfoSpy.args[2][0]).to.equal('defaultusername');
      });

    test
      .stdout()
      .stderr()
      .command([
        'config:get',
        'defaultdevhubusername',
        'badarg',
        '--json',
        '--verbose',
        '--loglevel=warn'
      ])
      .it('Does not get info for flag arguements', () => {
        expect(getInfoSpy.callCount).to.equal(3);
        expect(getInfoSpy.args[0][0]).to.equal('apiVersion');
        expect(getInfoSpy.args[1][0]).to.equal('defaultdevhubusername');
        expect(getInfoSpy.args[2][0]).to.equal('badarg');
      });
  });

  describe('Testing errors that can be thrown', () => {
    test
      .stderr()
      .command(['config:get'])
      .it('Error is thrown when no arguments are passd in', ctx => {
        expect(ctx.stderr).to.contain('Please provide config name(s) to get');
      });

    test
      .stderr()
      .stdout()
      .command(['config:get', 'badarg', 'defaultusername'])
      .it('Error is thrown when a bad argument is passed in', ctx => {
        expect(ctx.stderr).to.contain('Unknown config key: badarg');
      });
  });

  describe('Testing console output', () => {
    test
      .stdout()
      .stderr()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'defaultusername=TestUser'
      ])
      .command([
        'config:get',
        'badarg',
        'defaultdevhubusername',
        'defaultusername'
      ])
      .it('Table with both successes and failures', ctx => {
        const getOutput = ctx.stdout.substring(ctx.stdout.indexOf('Get'));
        let noWhitespaceOutput = getOutput.replace(/\s+/g, '');
        expect(noWhitespaceOutput).to.contain('badargfalse');
        expect(noWhitespaceOutput).to.contain(
          'defaultdevhubusernameDevHubtrue'
        );
        expect(noWhitespaceOutput).to.contain('defaultusernameTestUsertrue');
      });
  });

  describe('Testing JSON output', () => {
    test
      .stdout()
      .command([
        'config:get',
        'defaultdevhubusername',
        'defaultusername',
        '--json'
      ])
      .it('Unset keys', ctx => {
        const jsonOutput = JSON.parse(ctx.stdout);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(0);
        expect(jsonOutput).to.have.property('result');
        expect(jsonOutput.result[0])
          .to.have.property('key')
          .and.equal('defaultdevhubusername');
        expect(jsonOutput.result[1])
          .to.have.property('key')
          .and.equal('defaultusername');
      });

    test
      .stdout()
      .command(['config:get', 'badarg', 'defaultdevhubusername', '--json'])
      .it('Bad argument error JSON', ctx => {
        const jsonOutput = JSON.parse(ctx.stdout);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(1);
        expect(jsonOutput)
          .to.have.property('name')
          .and.equal('UnknownConfigKey');
        expect(jsonOutput)
          .to.have.property('message')
          .and.equal('Unknown config key: badarg');
        expect(jsonOutput)
          .to.have.property('exitCode')
          .and.equal(1);
        expect(jsonOutput)
          .to.have.property('commandName')
          .and.equal('Get');
      });

    // Need to change method of setting globally. The mock returned by .command() sets both 'local' and 'global'.
    test
      .skip()
      .stdout()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'defaultusername=TestUser',
        '-g'
      ])
      .command([
        'config:get',
        'defaultdevhubusername',
        'defaultusername',
        '--json'
      ])
      .it('Global keys', ctx => {
        expect(ctx.stdout).to.equal('Should be Global not Local');
        const getOutput = ctx.stdout.substring(ctx.stdout.indexOf('{'));
        const jsonOutput = JSON.parse(getOutput);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(0);
        expect(jsonOutput).to.have.property('result');
        expect(jsonOutput.result[0])
          .to.have.property('key')
          .and.equal('defaultdevhubusername');
        expect(jsonOutput.result[0])
          .to.have.property('value')
          .and.equal('DevHub');
        expect(jsonOutput.result[0])
          .to.have.property('location')
          .and.equal('Global');
        expect(jsonOutput.result[0])
          .to.have.property('path')
          .and.contain('?');
        expect(jsonOutput.result[1])
          .to.have.property('key')
          .and.equal('defaultusername');
        expect(jsonOutput.result[1])
          .to.have.property('value')
          .and.equal('TestUser');
        expect(jsonOutput.result[1])
          .to.have.property('location')
          .and.equal('Global');
        expect(jsonOutput.result[1])
          .to.have.property('path')
          .and.contain('?');
      });

    test
      .stdout()
      .withProject()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'defaultusername=TestUser'
      ])
      .command([
        'config:get',
        'defaultdevhubusername',
        'defaultusername',
        '--json'
      ])
      .it('Local keys', ctx => {
        const getOutput = ctx.stdout.substring(ctx.stdout.indexOf('{'));
        const jsonOutput = JSON.parse(getOutput);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(0);
        expect(jsonOutput).to.have.property('result');
        expect(jsonOutput.result[0])
          .to.have.property('key')
          .and.equal('defaultdevhubusername');
        expect(jsonOutput.result[0])
          .to.have.property('value')
          .and.equal('DevHub');
        expect(jsonOutput.result[0])
          .to.have.property('location')
          .and.equal('Local');
        expect(jsonOutput.result[0])
          .to.have.property('path')
          .and.contain(`local${path.sep}.sfdx${path.sep}sfdx-config.json`);
        expect(jsonOutput.result[1])
          .to.have.property('key')
          .and.equal('defaultusername');
        expect(jsonOutput.result[1])
          .to.have.property('value')
          .and.equal('TestUser');
        expect(jsonOutput.result[1])
          .to.have.property('location')
          .and.equal('Local');
        expect(jsonOutput.result[1])
          .to.have.property('path')
          .and.contain(`local${path.sep}.sfdx${path.sep}sfdx-config.json`);
      });
  });

  describe('Testing other flags', () => {
    // Need to change method of setting globally. The mock returned by .command() sets both 'local' and 'global'.
    test
      .skip()
      .stdout()
      .withProject()
      .command(['config:set', 'defaultdevhubusername=DevHub'])
      .command(['config:set', 'defaultusername=TestUser', '-g'])
      .command([
        'config:get',
        'defaultdevhubusername',
        'defaultusername',
        '--verbose'
      ])
      .it('--verbose', ctx => {
        let noWhitespaceOutput = ctx.stdout.replace(/\s+/g, '');
        expect(noWhitespaceOutput).to.contain(
          'defaultdevhubusernameDevHubtrueLocal'
        );
        expect(noWhitespaceOutput).to.contain(
          'defaultusernameTestUsertrueGlobal'
        );
      });
  });
});
