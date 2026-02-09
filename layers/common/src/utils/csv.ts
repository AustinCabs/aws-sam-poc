import { parse } from 'csv-parse';

/**
 * Parses CSV data from a buffer or stream.
 * 
 * @param input - The CSV data as a Buffer, string, or Readable stream.
 * @returns A promise that resolves to an array of parsed objects.
 */
export const parseCsv = <T = any>(input: Buffer | string | NodeJS.ReadableStream): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const results: T[] = [];

        const parser = parse({
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        parser.on('readable', () => {
            let record;
            while ((record = parser.read()) !== null) {
                results.push(record);
            }
        });

        parser.on('error', (err) => {
            reject(err);
        });

        parser.on('end', () => {
            resolve(results);
        });

        if (Buffer.isBuffer(input) || typeof input === 'string') {
            parser.write(input);
            parser.end();
        } else {
            input.pipe(parser);
        }
    });
};
