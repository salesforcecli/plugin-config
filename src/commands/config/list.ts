import { SfdxCommand } from '@salesforce/command';
import {
  ConfigAggregator,
  ConfigInfo,
  Messages
} from '@salesforce/core';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');

export default class List extends SfdxCommand {
  protected static supportsPerfLogLevelFlag = false;

  // public static readonly theDescription = messages.getMessage('description', []);
  // public static readonly longDescription = messages.getMessage('descriptionLong', []);
  // public static readonly help = messages.getMessage('help', []);
  public static readonly requiresProject = false;

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

    const aggregator = await ConfigAggregator.create();

    return aggregator.getConfigInfo().map(c => {
      delete c.path;
      return c;
    });
  }

}
