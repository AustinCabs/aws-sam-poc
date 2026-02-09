import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { parseMultipart, parseCsv } from 'common';

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
        // Parse multipart form-data
        const { files, fields } = await parseMultipart(event);

        if (files.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No file provided' }),
            };
        }

        const file = files[0]; // Get the first file

        // Validate MIME type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'text/csv'];
        if (!allowedMimeTypes.includes(file.contentType)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid file type',
                    allowedTypes: allowedMimeTypes
                }),
            };
        }

        // Validate file size (10MB max)
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        if (file.content.length > maxSizeBytes) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'File too large',
                    maxSize: '10MB',
                    receivedSize: `${(file.content.length / 1024 / 1024).toFixed(2)}MB`
                }),
            };
        }

        //  

        // Generate a unique filename
        const fileExtension = file.filename.split('.').pop();
        const uniqueFilename = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        // If it's a CSV file, parse it (demonstration)
        if (file.contentType === 'text/csv' || fileExtension?.toLowerCase() === 'csv') {
            try {
                console.log('Parsing CSV file...');
                const parsedData = await parseCsv(file.content);
                console.log('total CSV items: ', parsedData.length);
                console.log('Parsed CSV data (first 3 rows): ', JSON.stringify(parsedData.slice(0, 3), null, 2));
                // You can process the parsed data here
                // 1. check coulmns - validate if csv template is correct

            } catch (csvError) {
                console.error('Error parsing CSV:', csvError);
                // Decide whether to fail the upload or just log the error
            }
        }

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: UPLOAD_BUCKET,
            Key: uniqueFilename,
            Body: file.content,
            ContentType: file.contentType,
        });

        await s3Client.send(command);

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'File uploaded successfully',
                filename: file.filename,
                size: file.content.length,
                contentType: file.contentType
            }),
        };

    } catch (error) {
        console.error('Error uploading file:', error);

        // Handle multipart parsing errors
        if (error instanceof Error && error.message.includes('multipart/form-data')) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid request format. Use multipart/form-data',
                    error: error.message
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to upload file' }),
        };
    }
};
