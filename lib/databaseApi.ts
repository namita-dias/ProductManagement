import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Handler, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as apigate from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod } from 'aws-cdk-lib/aws-events';


export interface ProductDatabaseProps {

}

export class ProductDatabaseConstruct extends Construct {
  constructor(scope: Construct, id: string, props?: ProductDatabaseProps) {
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

    const productsApi = new apigate.LambdaRestApi(this, 'ProductsApi', {
      handler: manageProducts,
      proxy: false,
      cloudWatchRole: true
    });

    const products = productsApi.root.addResource('products');
    products.addMethod(HttpMethod.GET);
    products.addMethod(HttpMethod.POST);
    products.addMethod(HttpMethod.PUT);

    const exportName = 'ProductsAPIEndpoint';
      new cdk.CfnOutput(this, 'ProductsAPIEndpoint', {
          value: productsApi.url!,
          exportName: exportName
      });
  }
}