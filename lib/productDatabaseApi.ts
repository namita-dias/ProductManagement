import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apiGate from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod } from 'aws-cdk-lib/aws-events';


export class ProductDatabaseConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

      const productTable = new dynamo.Table(this, 'Product', {
          partitionKey: { name: 'ProductId', type: dynamo.AttributeType.STRING },
          billingMode: dynamo.BillingMode.PAY_PER_REQUEST
      });

      const productTableName = productTable.tableName;
      new cdk.CfnOutput(this, "ProductTableName", {
          value: productTableName,
          exportName: "ProductTableName"
      });
    
    const manageProducts = new lambda.NodejsFunction(this, 'ManageProducts', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'services', 'products.ts'),
      handler: 'productHandler',
      bundling: {
        externalModules: ['aws-sdk']
      },
      environment: {
        PRODUCT_TABLE_NAME: productTableName
      }
    });

    productTable.grantReadWriteData(manageProducts);

    const productsApi = new apiGate.LambdaRestApi(this, 'ProductsApi', {
      handler: manageProducts,
      proxy: false,
      cloudWatchRole: true
    });

    const products = productsApi.root.addResource('products');
    products.addMethod(HttpMethod.GET);
    products.addMethod(HttpMethod.POST);
    products.addMethod(HttpMethod.PUT);

    const product = products.addResource('{productId}');
    product.addMethod(HttpMethod.GET);
    product.addMethod(HttpMethod.DELETE);
  }
}