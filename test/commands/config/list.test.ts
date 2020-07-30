import * as sinon from 'sinon';
import { test, expect } from '@salesforce/command/lib/test';
import { ConfigAggregator } from '@salesforce/core';

describe('config:list', () => {
  describe("Testing calls to core's ConfigAggregator.getConfigInfo() method", () => {
    const sandbox = sinon.createSandbox();

    let getConfigInfoSpy: sinon.SinonSpy;

    beforeEach(() => {
      getConfigInfoSpy = sandbox.spy(
        ConfigAggregator.prototype,
        'getConfigInfo'
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    test
      .stdout()
      .command(['config:list'])
      .it('Always makes exactly one call', () => {
        expect(getConfigInfoSpy.callCount).to.equal(1);
      });
  });

  describe('Testing errors that can be thrown', () => {
    test
      .stdout()
      .stderr()
      .command(['config:list', 'badArg'])
      .it('Any arguments will throw an error', ctx => {
        expect(ctx.stderr).to.contain('Unexpected argument: badArg');
      });
  });

  describe('Testing console output', () => {
    test
      .stdout()
      .command(['config:list'])
      .it('No results found when nothing is set', ctx => {
        expect(ctx.stdout).to.contain('No results found');
      });

    test
      .stdout()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'defaultusername=TestUser',
        '-g'
      ])
      .command(['config:list'])
      .it('Table with only successes', ctx => {
        let noWhitespaceOutput = ctx.stdout.replace(/\s+/g, '');
        expect(noWhitespaceOutput).to.contain(
          'defaultdevhubusernameDevHubtrueGlobal'
        );
        expect(noWhitespaceOutput).to.contain(
          'defaultusernameTestUsertrueGlobal'
        );
      });
  });

  describe('Testing JSON output', () => {
    test
      .stdout()
      .command(['config:list', '--json'])
      .it('Empty JSON with nothing set', ctx => {
        const jsonOutput = JSON.parse(ctx.stdout);
        expect(jsonOutput)
          .to.have.property('status')
          .and.equal(0);
        expect(jsonOutput).to.have.property('result');
        expect(jsonOutput.result.length).to.equal(0);
      });

    test
      .stdout()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'defaultusername=TestUser',
        '-g'
      ])
      .command(['config:list', '--json'])
      .it('Global keys', ctx => {
        const listOutput = ctx.stdout.substring(ctx.stdout.indexOf('{'));
        const jsonOutput = JSON.parse(listOutput);
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
        expect(jsonOutput.result[1])
          .to.have.property('key')
          .and.equal('defaultusername');
        expect(jsonOutput.result[1])
          .to.have.property('value')
          .and.equal('TestUser');
        expect(jsonOutput.result[1])
          .to.have.property('location')
          .and.equal('Global');
      });

    test
      .stdout()
      .withProject()
      .command([
        'config:set',
        'defaultdevhubusername=DevHub',
        'defaultusername=TestUser'
      ])
      .command(['config:list', '--json'])
      .it('Local keys', ctx => {
        const listOutput = ctx.stdout.substring(ctx.stdout.indexOf('{'));
        const jsonOutput = JSON.parse(listOutput);
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
        expect(jsonOutput.result[1])
          .to.have.property('key')
          .and.equal('defaultusername');
        expect(jsonOutput.result[1])
          .to.have.property('value')
          .and.equal('TestUser');
        expect(jsonOutput.result[1])
          .to.have.property('location')
          .and.equal('Local');
      });
  });
});
