import { Product } from './product';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk/lib/error';
import { v4 as uuid } from 'uuid';

export const getProductsHandler = async (): Promise<APIGatewayProxyResult> => {
  const productTableName = process.env.PRODUCT_TABLE_NAME;
  const docClient = new DocumentClient();

  try {
    const productTable = {
      TableName: productTableName!,
    };

    const products = await docClient.scan(productTable).promise();
    if (products != null) return sendResult(true, products);
    else return sendResult(false, 'no products found');
  } catch (err) {
    console.log(err);
    return sendResult(false, 'something went wrong when loading employee table' + err);
  }
};

export const upsertProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productTableName = process.env.PRODUCT_TABLE_NAME;
  const docClient = new DocumentClient();
  try {
    const { body } = event;
    if (!body) {
      return sendResult(false, 'invalid request');
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

    const result = await docClient.put(productItem).promise();
    if (result != null) return sendResult(true, result);
    else return sendResult(false, inputProduct.productId ? 'Product not updated' : 'Product not added');
  } catch (err) {
    console.log(err);
    return sendResult(false, 'something went wrong when upserting product table' + err);
  }
};

export const getProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productTableName = process.env.PRODUCT_TABLE_NAME;
  const docClient = new DocumentClient();
  try {
    const productId = event.pathParameters!.productId;

    const query = {
      TableName: productTableName!,
      Key: { productId: productId },
    };
    const product = await docClient.get(query).promise();

    if (product.Item == null || product.Item == undefined) return sendResult(false, 'Could not find product. Please specify the correct ProductId.');
    else return sendResult(true, product);
  } catch (err) {
    console.log(err);
    return sendResult(false, 'something went wrong when getting a product' + err);
  }
};

export const deleteProductHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const productTableName = process.env.PRODUCT_TABLE_NAME;
  const docClient = new DocumentClient();
  try {
    const productId = event.pathParameters!.productId;

    const query = {
      TableName: productTableName!,
      Key: { productId: productId },
    };

    const product = await docClient.delete(query).promise();
    if (product != null) return sendResult(true, product);
    else return sendResult(false, 'Product not found');
  } catch (err) {
    console.log(err);
    return sendResult(false, 'something went wrong when deleting a product' + err);
  }
};

function sendResult(isSuccess: boolean, message: any): APIGatewayProxyResult {
  if (isSuccess) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ message }),
    };
  }
}
