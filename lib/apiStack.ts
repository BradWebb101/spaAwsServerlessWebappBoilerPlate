import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export class ApiStack extends cdk.Stack {

  
    constructor(scope: Construct, id: string, props?: any) {
        super(scope, id, props);

    
        const LambdaApi = new apigateway.LambdaRestApi(this, 'myapi', {
          handler: backend,
        });
        
}
};
