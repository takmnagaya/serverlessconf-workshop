'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.commands = {
      download: {
        usage: 'Download DynamoDB data',
        lifecycleEvents: [
          'hello',
          'world',
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
      'before:welcome:hello': this.beforeWelcome.bind(this),
      'welcome:hello': this.welcomeUser.bind(this),
      'welcome:world': this.displayHelloMessage.bind(this),
      'after:welcome:world': this.afterHelloWorld.bind(this),
    };
    this.options = options;
  }

  beforeWelcome() {
    this.serverless.cli.log('Hello from Serverless!');
  }

  welcomeUser() {
    this.serverless.cli.log('Your message:');
  }

  displayHelloMessage() {
    this.serverless.cli.log(`${this.options.message}`);
  }

  afterHelloWorld() {
    this.serverless.cli.log('Please come again!');
  }
}

module.exports = ServerlessPlugin;
