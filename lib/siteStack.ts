import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as iam from 'aws-cdk-lib/aws-iam';

export class SpaBoilerPLateStack extends cdk.Stack {
  cloudfrontOAI: cloudfront.OriginAccessIdentity;
    zone: route53.IHostedZone;
    certificate: acm.DnsValidatedCertificate;
    distribution: cloudfront.Distribution;
    siteBucket: Bucket;
  
  constructor(scope: Construct, id: string, props?: any) {
    super(scope, id, props);
  
      const { domainName, bucketName } = props;
  
      const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'cloudfront-OAI', {
        comment: `OAI for ${domainName}`,
      });
  
      const siteBucket = new Bucket(this, bucketName, {
        bucketName: bucketName,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
     });
  
     siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        actions: ['s3:GetObject'],
        resources: [`${siteBucket.bucketArn}/*`],
      }),
    );
  
      const deployment = new BucketDeployment(this, "deployStaticWebsite", {
        sources: [Source.asset('./website/build/')],
        destinationBucket: siteBucket
    }
    )
  
      const zone = new route53.HostedZone(this, 'Zone', { zoneName: domainName });
  
      const certificate = new acm.DnsValidatedCertificate(this, 'CrossRegionCertificate', {
        domainName: domainName,
        hostedZone: zone,
        region: 'us-east-1',
        subjectAlternativeNames:[`www.${domainName}`]
      });
  
      const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
        certificate: certificate,
        defaultRootObject: "index.html",
        domainNames: [domainName, `www.${domainName}`],
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        errorResponses:[
          {
            httpStatus: 403,
            responseHttpStatus: 403,
            responsePagePath: '/404.html',
            ttl: cdk.Duration.minutes(30),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: '/404.html',
            ttl: cdk.Duration.minutes(30),
          }
        ],
        
        defaultBehavior: {
          origin: new cloudfront_origins.S3Origin(siteBucket, {originAccessIdentity: cloudfrontOAI}),
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        }
      });
      
      new route53.ARecord(this, 'SiteAliasRecord', {
        recordName: domainName,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        zone: zone
      });
  
      new route53.ARecord(this, 'wwwSiteAliasRecord', {
        recordName: `www.${domainName}`,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        zone: zone
      });
  
      }
};
