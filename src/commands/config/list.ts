import { SfdxCommand } from '@salesforce/command';
import { ConfigAggregator, ConfigInfo, Messages } from '@salesforce/core';
import { output, SuccessMsg } from '../../helperFunctions';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');

export default class List extends SfdxCommand {
  protected static supportsPerfLogLevelFlag = false;

  // public static readonly theDescription = messages.getMessage('description', []);
  // public static readonly longDescription = messages.getMessage('descriptionLong', []);
  // public static readonly help = messages.getMessage('help', []);
  public static readonly requiresProject = false;
  private successes: SuccessMsg[] = [];

  async run(): Promise<ConfigInfo[]> {
    try {
      const results = await this.execute();
      output('Config', this.ux, this.successes, [], true);
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
      this.successes.push({ name: c.key, value: <string | undefined>c.value, location: c.location });
      return c;
    });
  }
}
