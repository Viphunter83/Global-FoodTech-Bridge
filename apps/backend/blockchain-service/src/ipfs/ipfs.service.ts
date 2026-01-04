import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpfsService {
    private readonly logger = new Logger(IpfsService.name);
    private readonly pinataJwt: string;

    constructor(private configService: ConfigService) {
        this.pinataJwt = this.configService.get<string>('PINATA_JWT');
        if (!this.pinataJwt) {
            this.logger.warn('PINATA_JWT is not set. IPFS uploads will be MOCKED.');
        }
    }

    async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
        if (!this.pinataJwt) {
            this.logger.log(`Mocking upload for ${fileName}`);
            return `QmMockHashFor${fileName.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
        }

        try {
            const formData = new FormData();
            formData.append('file', fileBuffer, fileName);

            // Pinata metadata (optional)
            const metadata = JSON.stringify({
                name: fileName,
            });
            formData.append('pinataMetadata', metadata);

            // Pinata options (optional)
            const options = JSON.stringify({
                cidVersion: 0,
            });
            formData.append('pinataOptions', options);

            const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    'Authorization': `Bearer ${this.pinataJwt}`,
                    ...formData.getHeaders()
                },
                maxBodyLength: Infinity // Important for large files
            });

            this.logger.log(`File uploaded to Pinata: ${res.data.IpfsHash}`);
            return res.data.IpfsHash;

        } catch (error) {
            this.logger.error('Failed to upload file to Pinata', error);
            if (axios.isAxiosError(error) && error.response) {
                this.logger.error(`Pinata Error: ${JSON.stringify(error.response.data)}`);
                throw new Error(`IPFS Upload failed: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`IPFS Upload failed: ${error.message}`);
        }
    }

    async uploadJSON(data: any): Promise<string> {
        if (!this.pinataJwt) {
            this.logger.log('Mocking JSON upload');
            return `QmMockHashForJSON${Date.now()}`;
        }

        try {
            const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                pinataContent: data,
                pinataMetadata: {
                    name: data.name || 'metadata.json'
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.pinataJwt}`,
                    'Content-Type': 'application/json'
                }
            });

            this.logger.log(`JSON uploaded to Pinata: ${res.data.IpfsHash}`);
            return res.data.IpfsHash;
        } catch (error) {
            this.logger.error('Failed to upload JSON to Pinata', error);
            if (axios.isAxiosError(error) && error.response) {
                this.logger.error(`Pinata Error: ${JSON.stringify(error.response.data)}`);
                throw new Error(`IPFS JSON Upload failed: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`IPFS JSON Upload failed: ${error.message}`);
        }
    }
}
