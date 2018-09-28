'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.provider = this.serverless.getProvider('aws');
    this.region = this.provider.getRegion();
    this.stage = this.provider.getStage();
    this.commands = {
      download: {
        usage: 'Download DynamoDB data',
        lifecycleEvents: [
          'download',
        ],
        options: {
          resource: {
            usage:
              'Specify the DynamoDB table'
              + '(e.g. "--resource users" or "-r users")',
            required: true,
            shortcut: 'r',
          },
          'target-stage': {
            usage:
              'Specify the target stage'
              + '(e.g. "--target-stage dev" or "-s dev")',
            required: false,
            shortcut: 's',
            default: 'dev',
          },
        },
      },
    };
    this.hooks = {
      'download:download': this.download.bind(this),
    };
    this.options = options;
  }

  download() {
    const tableName = this.serverless.service.resources.Resources[this.options.resource].Properties.TableName;
    this.serverless.cli.log(this.options.stage);
    this.serverless.cli.log(this.options.region);
    this.serverless.cli.log(this.stage);
    this.serverless.cli.log(this.region);
    this.serverless.cli.log(tableName);
    return this.provider.request('DynamoDB',
      'scan',
      {TableName: tableName},
      this.options.stage,
      this.options.region
    ).then(result => {
      this.serverless.cli.log(JSON.stringify(result.Items));
    })
  }
}

module.exports = ServerlessPlugin;
