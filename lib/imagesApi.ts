import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigate from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export interface ProductImagesProps {
    bucket: s3.Bucket
}

export class ProductImagesConstruct extends Construct {

  public readonly httpApi: apigate.HttpApi;
    
  constructor(scope: Construct, id: string, props: ProductImagesProps) {
      super(scope, id);

    const getProductImages = new lambda.NodejsFunction(this, "GetProductImages", {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'services', 'getProductImages.ts'),
      handler: "getProductImages",
      bundling: {
            externalModules: ['aws-sdk']
        },
        environment: {
            BUCKET_NAME: props.bucket.bucketName
        }
    })
      
    const bucketPermission = new iam.PolicyStatement();
    bucketPermission.addResources(`${props.bucket.bucketArn}/*`);
    bucketPermission.addActions('s3:GetObject', 's3:PutObject');
    getProductImages.addToRolePolicy(bucketPermission);

    const bucketContainerPermission = new iam.PolicyStatement();
    bucketContainerPermission.addResources(props.bucket.bucketArn);
    bucketContainerPermission.addActions('s3:ListBucket');
    getProductImages.addToRolePolicy(bucketContainerPermission);
      
    //http API
      this.httpApi = new apigate.HttpApi(this, 'HttpApi', {
          apiName: 'just-testing-api',
          createDefaultStage: true,
          corsPreflight: {
              allowMethods: [ apigate.CorsHttpMethod.GET ],
              allowOrigins: ['*'],
              maxAge: cdk.Duration.days(10)
          }
      });
 
      //all api to call lambda function
      const integration = new HttpLambdaIntegration('APIIntegration', getProductImages);

      this.httpApi.addRoutes({
          path: '/getProductImages',
          methods: [
              apigate.HttpMethod.GET
          ],
          integration: integration
      });

      new cdk.CfnOutput(this, 'GetProductImagesEndpoint', {
          value: this.httpApi.url!,
          exportName: 'GetProductImagesEndpoint'
      });
  }
}