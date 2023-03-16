import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import path from 'path';

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsImagesBucket = new Bucket(this, 'product-image-bucket');

    new cdk.CfnOutput(this, 'Product-Image-Bucket', {
      value: productsImagesBucket.bucketName,
      exportName: 'Product-Image-Bucket'
    })

    try {

      new s3Deploy.BucketDeployment(this, 'deploy-images', {
        sources: [
          s3Deploy.Source.asset(path.join(__dirname, '..','images'))
        ],
        destinationBucket: productsImagesBucket
      })
      
    } catch (err) {
      console.log(`Error coping images to bucket ${productsImagesBucket}: ${err}`);
    }

  }
}
