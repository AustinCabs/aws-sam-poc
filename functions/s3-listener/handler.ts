import { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({});

// The `S3Handler` type provides TypeScript typings for the S3 Event payload
export const handler: S3Handler = async (event) => {
    // Log the event to CloudWatch for debugging
    console.log('S3 Event received:', JSON.stringify(event, null, 2));

    try {
        // Since S3 could batch multiple object events, we map over the Records array
        for (const record of event.Records) {
            const bucketName = record.s3.bucket.name;
            // The object key might contain URL-encoded characters (like '+' for space), 
            // so we decode it.
            const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

            console.log(`Processing file upload: s3://${bucketName}/${objectKey}`);

            // 1. Optionally fetch the file metadata or contents if needed:
            // const getObjectCmd = new GetObjectCommand({
            //     Bucket: bucketName,
            //     Key: objectKey,
            // });
            // const s3Object = await s3Client.send(getObjectCmd);
            // console.log(`File Content Type: ${s3Object.ContentType}`);

            // 2. You can perform business logic here, such as:
            // - Parsing the file (if it's CSV or JSON)
            // - Resizing an image
            // - Inserting metadata about the file into DynamoDB
            // - Sending a notification
        }
    } catch (error) {
        console.error('Error processing S3 event:', error);
        // Throwing the error ensures Lambda marks this execution as Failed,
        // which could trigger a retry or send it to an SQS Dead Letter Queue if configured.
        throw error;
    }
};
