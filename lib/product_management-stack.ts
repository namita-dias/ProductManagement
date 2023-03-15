import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsBucket = new Bucket(this, 'product-managment-bucket');

    new cdk.CfnOutput(this, 'Product-Management-Bucket', {
      value: productsBucket.bucketName,
      exportName: 'Product-Management-Bucket'
    })
  }
}
