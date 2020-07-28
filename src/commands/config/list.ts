import { ConfigAggregator, ConfigInfo, Messages } from '@salesforce/core';
import { ConfigCommand } from '../../config';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/plugin-config', 'list');

export default class List extends ConfigCommand {
  protected static supportsPerfLogLevelFlag = false;
  public static readonly theDescription = messages.getMessage('description', []);
  public static readonly longDescription = messages.getMessage('descriptionLong', []);
  public static readonly help = messages.getMessage('help', []);

  public static readonly requiresProject = false;

  async run(): Promise<ConfigInfo[]> {
    const aggregator = await ConfigAggregator.create();

    const results = aggregator.getConfigInfo().map(c => {
      this.responses.push({ name: c.key, value: <string | undefined>c.value, location: c.location, success: true });
      delete c.path;
      return c;
    });
    this.output('Config', true);
    return results;
  }
}