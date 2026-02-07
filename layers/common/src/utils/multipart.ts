import Busboy from 'busboy';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface ParsedFile {
    filename: string;
    contentType: string;
    content: Buffer;
}

export interface ParsedMultipart {
    files: ParsedFile[];
    fields: Record<string, string>;
}

export async function parseMultipart(event: APIGatewayProxyEventV2): Promise<ParsedMultipart> {
    return new Promise((resolve, reject) => {
        const contentType = event.headers['content-type'] || event.headers['Content-Type'];

        if (!contentType || !contentType.includes('multipart/form-data')) {
            reject(new Error('Content-Type must be multipart/form-data'));
            return;
        }

        const busboy = Busboy({ headers: { 'content-type': contentType } });
        const files: ParsedFile[] = [];
        const fields: Record<string, string> = {};

        busboy.on('file', (fieldname: string, file: any, info: any) => {
            const { filename, mimeType } = info;
            const chunks: Buffer[] = [];

            file.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });

            file.on('end', () => {
                files.push({
                    filename,
                    contentType: mimeType,
                    content: Buffer.concat(chunks),
                });
            });
        });

        busboy.on('field', (fieldname: string, value: string) => {
            fields[fieldname] = value;
        });

        busboy.on('finish', () => {
            resolve({ files, fields });
        });

        busboy.on('error', (error: Error) => {
            reject(error);
        });

        // API Gateway base64 encodes binary data
        const body = event.isBase64Encoded
            ? Buffer.from(event.body || '', 'base64')
            : Buffer.from(event.body || '', 'utf-8');

        busboy.write(body);
        busboy.end();
    });
}
