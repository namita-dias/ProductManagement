import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as apiGate from 'aws-cdk-lib/aws-apigateway';
import { HttpMethod } from 'aws-cdk-lib/aws-events';
import * as path from 'path';

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTable = new dynamo.Table(this, 'Product', {
      partitionKey: { name: 'productId', type: dynamo.AttributeType.STRING },
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
    });

    const productTableName = productTable.tableName;
    new cdk.CfnOutput(this, 'ProductTableName', {
      value: productTableName,
      exportName: 'ProductTableName',
    });

    //get products
    const getProducts = new lambda.NodejsFunction(this, 'GetProducts', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'implementation', 'product-lambda-handler-crud.ts'),
      handler: 'getProductsHandler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRODUCT_TABLE_NAME: productTableName,
      },
    });

    productTable.grantReadData(getProducts);

    const getProductsApi = new apiGate.LambdaRestApi(this, 'GetProductsApi', {
      handler: getProducts,
      proxy: false,
      cloudWatchRole: true,
    });

    getProductsApi.root.addResource('products').addMethod(HttpMethod.GET);

    //get product
    const getProduct = new lambda.NodejsFunction(this, 'GetProduct', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'implementation', 'product-lambda-handler-crud.ts'),
      handler: 'getProductHandler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRODUCT_TABLE_NAME: productTableName,
      },
    });

    productTable.grantReadData(getProduct);

    const getProductApi = new apiGate.LambdaRestApi(this, 'GetProductApi', {
      handler: getProduct,
      proxy: false,
      cloudWatchRole: true,
    });

    getProductApi.root.addResource('{productId}').addMethod(HttpMethod.GET);

    //upsert product
    const upsertProduct = new lambda.NodejsFunction(this, 'UpsertProduct', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'implementation', 'product-lambda-handler-crud.ts'),
      handler: 'upsertProductHandler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRODUCT_TABLE_NAME: productTableName,
      },
    });

    productTable.grantReadWriteData(upsertProduct);

    const upsertProductApi = new apiGate.LambdaRestApi(this, 'UpsertProductApi', {
      handler: upsertProduct,
      proxy: false,
      cloudWatchRole: true,
    });

    const upsertProductApiMethods = upsertProductApi.root.addResource('products');
    upsertProductApiMethods.addMethod(HttpMethod.POST);
    upsertProductApiMethods.addMethod(HttpMethod.PUT);

    //delete product

    const deleteProduct = new lambda.NodejsFunction(this, 'DeleteProduct', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'implementation', 'product-lambda-handler-crud.ts'),
      handler: 'deleteProductHandler',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      environment: {
        PRODUCT_TABLE_NAME: productTableName,
      },
    });

    productTable.grantReadWriteData(deleteProduct);

    const deleteProductApi = new apiGate.LambdaRestApi(this, 'DeleteProductApi', {
      handler: deleteProduct,
      proxy: false,
      cloudWatchRole: true,
    });

    deleteProductApi.root.addResource('{productId}').addMethod(HttpMethod.DELETE);
  }
}
