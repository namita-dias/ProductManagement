import { Product } from '../models/Product';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk/lib/error';
import { HttpMethod } from 'aws-cdk-lib/aws-events';
import { v4 as uuid } from 'uuid';

let productTableName: string | undefined;
let docClient: DocumentClient;

export const productHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  let result;
  try {

    let resource = event.resource;
    let httpMethod = event.httpMethod;
    let route = httpMethod.concat(resource);

    productTableName = process.env.PRODUCT_TABLE_NAME;
    docClient = new DocumentClient();

    switch (resource) {
      case '/products': {
        if (httpMethod == HttpMethod.GET)
          result = await getProducts();
        if (httpMethod == HttpMethod.POST || httpMethod == HttpMethod.PUT)
          result = await upsertProduct(event);
        break;
      }
      case '/products/{productId}': {
        if (httpMethod == HttpMethod.GET)
          result = await getProduct(event);
        if (httpMethod == HttpMethod.DELETE)
          result = await deleteProduct(event);
        break;
      }
      default:
        return sendFail(`unsupported route: ${route}`);
    }

  } catch (err) {
    console.log(err);
    return sendFail('something went wrong' + err);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ result })
  }
}

const getProducts = async (): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError> | APIGatewayProxyResult> => {
  try {
    
    const productTable = {
      TableName: productTableName!
    };

    const products = await docClient.scan(productTable).promise();
    return products;

  } catch (err) {
    console.log(err);
    return sendFail('something went wrong when loading employee table' + err);
  }
}

const upsertProduct = async (event: APIGatewayProxyEvent): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError> | APIGatewayProxyResult> => {
  let result;
  try {
    
    const { body } = event;
    if (!body) {
      return sendFail('invalid request');
    }

    const inputProduct: Product = JSON.parse(body);

    const product: Product = {
      productId: inputProduct.productId ? inputProduct.productId : uuid(),
      name: inputProduct.name,
      price: inputProduct.price,
      createDate: inputProduct.createDate ?? new Date().toISOString(),
    };

    const productItem = {
      Item: product,
      TableName: productTableName!,
    };

    result = await docClient.put(productItem).promise();
  } catch (err) {
    console.log(err);
    return sendFail('something went wrong when upserting product table' + err);
  }

  return result;
};

const getProduct = async (event: APIGatewayProxyEvent): Promise<PromiseResult<DocumentClient.GetItemOutput, AWSError> | APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters!.productId;

    const query = {
      TableName: productTableName!,
      Key: { ProductId: productId },
    };

    const product = await docClient.get(query).promise();
    return product;
  } catch (err) {
    console.log(err);
    return sendFail('something went wrong when getting a product' + err);
  }
};

const deleteProduct = async (event: APIGatewayProxyEvent): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError> | APIGatewayProxyResult> => {
  try {
    const productId = event.pathParameters!.productId;

    const query = {
      TableName: productTableName!,
      Key: { ProductId: productId },
    };

    const product = await docClient.delete(query).promise();
    return product;
  } catch (err) {
    console.log(err);
    return sendFail('something went wrong when deleting a product' + err);
  }
};

function sendFail(message: string): APIGatewayProxyResult {
  return {
    statusCode: 400,
    body: JSON.stringify({ message }),
  }
}
