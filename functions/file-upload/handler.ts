import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});
const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));

    if (!UPLOAD_BUCKET) {
        console.error('UPLOAD_BUCKET environment variable is not set');
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No file provided' }),
            };
        }

        const contentType = event.headers['content-type'] || event.headers['Content-Type'];
        if (!contentType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing Content-Type header' }),
            };
        }

        // Basic validation (extend as needed)
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'text/csv'];
        if (!allowedMimeTypes.includes(contentType)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid file type' }),
            };
        }

        // Check file size (approximate from base64 length)
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        const approximateSize = (event.body.length * 3) / 4 - (event.body.indexOf('=') > 0 ? (event.body.length - event.body.indexOf('=')) : 0);

        if (approximateSize > maxSizeBytes) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'File too large' }),
            };
        }

        const fileContent = Buffer.from(event.body, 'base64');
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const command = new PutObjectCommand({
            Bucket: UPLOAD_BUCKET,
            Key: fileName,
            Body: fileContent,
            ContentType: contentType,
        });

        await s3Client.send(command);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'File uploaded successfully',
            }),
        };

    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to upload file' }),
        };
    }
};
