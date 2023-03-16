import S3 from 'aws-sdk/clients/s3';
import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const s3 = new S3();
const bucketName = process.env.BUCKET_NAME;

export const getProductImages =async (): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        const { Contents: results } = await s3.listObjects({ Bucket: bucketName! }).promise();
        const images = await Promise.all(results!.map(async r => generateSignedURL(r)));
        return {
            statusCode: 200,
            body: JSON.stringify(images)
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: `Something went wrong while getting images: ${err}`
        }
    }
}

const generateSignedURL = async (object: S3.Object): Promise<{ fileName: string, url: string }> => {
    const url = await s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: object.Key!,
        Expires: (60*60)
    })

    return {
        fileName: object.Key!,
        url: url
    }
}