import { Product } from "../models/Product";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError } from "aws-sdk/lib/error";
import { HttpMethod } from "aws-cdk-lib/aws-events";

const productTableName = process.env.PRODUCT_TABLE_NAME;
const docClient = new DocumentClient();

export const productHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    let result;
    try {

        let resource = event.resource;
        let httpMethod = event.httpMethod;
        let route = httpMethod.concat(resource);

        console.log(`http method: ${httpMethod}`);
        console.log(`resource: ${resource}`);
        console.log(`route: ${route}`);

        switch (resource) {
            case '/products': {
                if (httpMethod == HttpMethod.GET)
                    result = await getProducts();
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

function sendFail(message: string): APIGatewayProxyResult {
    
    return {
        statusCode: 400,
        body: JSON.stringify({ message })
    }
}