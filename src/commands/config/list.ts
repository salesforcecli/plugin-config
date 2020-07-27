import { SfdxCommand } from '@salesforce/command';
import { ConfigAggregator, ConfigInfo, Messages } from '@salesforce/core';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');

export default class List extends ConfigCommand {
  protected static supportsPerfLogLevelFlag = false;

  // public static readonly theDescription = messages.getMessage('description', []);
  // public static readonly longDescription = messages.getMessage('descriptionLong', []);
  // public static readonly help = messages.getMessage('help', []);
  public static readonly requiresProject = false;

  async run(): Promise<ConfigInfo[]> {
    const results = await this.execute();
    this.output('Config');
    return results;
  }

  protected async execute(): Promise<ConfigInfo[]> {
    const aggregator = await ConfigAggregator.create();

    return aggregator.getConfigInfo().map(c => {
      delete c.path;
      this.responses.push({ name: c.key, value: <string | undefined>c.value, location: c.location });
      return c;
    });
  }
}
