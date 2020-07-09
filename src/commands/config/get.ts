import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import {
  ConfigAggregator,
  ConfigInfo,
  Messages,
  SfdxError
} from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-config', 'get');

export default class Get extends SfdxCommand {
  protected static supportsPerfLogLevelFlag = false;

  // public static readonly theDescription = messages.getMessage('description', []);
  // public static readonly longDescription = messages.getMessage('descriptionLong', []);
  // public static readonly help = messages.getMessage('help', []);
  public static readonly requiresProject = false;
  public static readonly strict = false;
  public static readonly flagsConfig: FlagsConfig = {
    verbose: flags.builtin()
  };

  async run(): Promise<ConfigInfo[]> {
    // if (this.statics.supportsPerfLogLevelFlag && this.flags.perflog === true) {
    //   context.org.force.setCallOptions('perfOption', 'MINIMUM');
    // }

    try {
      const results = await this.execute();
      console.log(results); // WAS LEGACY_OUTPUT(results)
      return results;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  protected async execute(): Promise<ConfigInfo[]> {
    const args = await this.consolidateArgs();

    if (!args || args.length === 0) {
      throw SfdxError.create(
        '@salesforce/plugin-config',
        'get',
        'NoConfigKeysFound',
        []
      );
    } else {
      const results: ConfigInfo[] = [];
      const aggregator = await ConfigAggregator.create();

      args.forEach(configName => {
        results.push(aggregator.getInfo(configName));
      });

      return results;
    }
  }

  protected async consolidateArgs(): Promise<string[]> {
    const argsToGet: string[] = [];

    const { args, argv } = this.parse({
      flags: this.statics.flags,
      args: this.statics.args,
      strict: this.statics.strict
    });

    const argVals: string[] = Object.values(args);
    const varargs = argv.filter(val => !argVals.includes(val));

    varargs.forEach(argKey => {
      argsToGet.push(argKey);
    });

    return argsToGet;
  }
}
