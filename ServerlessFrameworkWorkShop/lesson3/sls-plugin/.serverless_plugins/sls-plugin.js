'use strict';

class ServerlessXRay {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.hooks = {
      'after:package:compileFunctions': this.enableXRay.bind(this),
    };
  }

  enableXRay() {
    if (!this.serverless.service.custom || this.serverless.service.custom.trace !== true) {
      return;
    }
    this.serverless.service.getAllFunctions().forEach((functionName) => {
      const functionLogicalId = this.provider.naming.getLambdaLogicalId(functionName);
      this.serverless.service.provider.compiledCloudFormationTemplate
        .Resources[functionLogicalId].Properties.TracingConfig = {
        'Mode': 'Active'
      };
    });
    this.serverless.service.provider.compiledCloudFormationTemplate.Resources
      .IamRoleLambdaExecution.Properties.Policies[0].PolicyDocument.Statement.push({
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": ["*"]
    });
  }
}

module.exports = ServerlessXRay;
