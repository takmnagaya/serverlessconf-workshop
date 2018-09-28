'use strict';

class ServerlessXRay {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.hooks = {
      'after:package:compileFunctions': this.enableXRay.bind(this),
    };
  }

  enableXRay() {
    let resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources;
    if (this.serverless.service.custom.trace) {
      // X-Ray有効化
      for (let resource in resources) {
        let type = resources[resource].Type;
        if (type === 'AWS::Lambda::Function') {
          resources[resource].Properties.TracingConfig = {
            Mode: 'Active'
          }
        }
      }
      // IAMポリシーにX-Rayを利用可能にするポリシーを追加
      resources.IamRoleLambdaExecution.Properties.Policies[0].PolicyDocument.Statement.push(
        {
          Effect: "Allow",
          Action: [
            "xray:PutTraceSegments",
            "xray:PutTelemetryRecords"
          ],
          Resource: [
            "*"
          ]
        }
      );
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources = resources;
    }
  }
}

module.exports = ServerlessXRay;
