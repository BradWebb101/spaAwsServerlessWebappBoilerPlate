#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import { SpaBoilerPLateStack } from '../lib/siteStack';
import { DynamoDBStack } from '../lib/dynamoDBStack';
import { ApiStack } from '../lib/apiStack'

const app = new cdk.App();

const GLOBALS = {
  bucketName: 'ADD_BUCKET_NAME_HERE',
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  //add in domain as domain.com not www.domain.com, the code handles 
  domainName: 'ADD_DOMAIN_HERE',
  tableParticionKey: 'ADD_PARTICION_KEY_TYPE_HERE' //types, string, number, binary eg dynamodb.AttributeType.STRING
};

const websiteStack = new SpaBoilerPLateStack(app, 'SPAAmplifyStack', {
  ...GLOBALS,
});

const apiStack = new DynamoDBStack(app, 'dbStack',{
  ...GLOBALS
});


