import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as dynamodb from'aws-cdk-lib/aws-dynamodb'

export class DynamoDBStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id, props);

    const { bucketName, tableParticionKey } = props

    const dynamobDBTable = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: tableParticionKey, type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName:`${bucketName}Table`

    }
    );
    
}
};