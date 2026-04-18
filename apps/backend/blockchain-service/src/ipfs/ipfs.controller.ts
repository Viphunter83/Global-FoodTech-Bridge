import { Controller, Post, UploadedFiles, Body, UseInterceptors, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IpfsService } from './ipfs.service';

@Controller('ipfs')
export class IpfsController {
    private readonly logger = new Logger(IpfsController.name);

    constructor(private readonly ipfsService: IpfsService) { }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('files')) // 'files' must match frontend field name
    async uploadBatchData(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any
    ) {
        try {
            this.logger.log(`Received upload request. Files: ${files ? files.length : 0}`);

            const uploadedHashes: Record<string, string> = {};

            // 1. Upload all files (certificates)
            if (files && files.length > 0) {
                for (const file of files) {
                    const hash = await this.ipfsService.uploadFile(file.buffer, file.originalname);
                    uploadedHashes[file.originalname] = hash;
                }
            }

            // Parse certificate type mapping from body if provided
            let certMapping: Record<string, string> = {};
            try {
                if (body.cert_mapping) {
                    certMapping = typeof body.cert_mapping === 'string' 
                        ? JSON.parse(body.cert_mapping) 
                        : body.cert_mapping;
                }
            } catch (e) {
                this.logger.warn(`Failed to parse cert_mapping: ${e.message}`);
            }

            // 2. Construct Metadata JSON
            const metadata = {
                name: `Batch ${body.manufacturer_id}`,
                description: `Batch of ${body.product_type}`,
                image: "ipfs://placeholder-food-batch", 
                attributes: [
                    { trait_type: "Ingredients", value: body.ingredients },
                    { trait_type: "Production Date", value: body.productionDate },
                    { trait_type: "Expiration Date", value: body.expirationDate },
                    { trait_type: "Batch Size", value: body.batch_size },
                    { trait_type: "Unit of Measure", value: body.unit_of_measure },
                    { trait_type: "Origin Country", value: body.origin_country },
                    { trait_type: "Destination Country", value: body.destination_country },
                ],
                // Extensions for certificates with types
                certificates: Object.entries(uploadedHashes).map(([originalName, hash]) => ({
                    name: originalName,
                    type: certMapping[originalName] || "OTHER",
                    uri: `ipfs://${hash}`
                }))
            };

            // 3. Upload Metadata JSON
            const metadataHash = await this.ipfsService.uploadJSON(metadata);

            return {
                success: true,
                ipfsHash: metadataHash, // This is the "Token URI"
                metadata: metadata // Return meantadata for debug
            };
        } catch (error) {
            this.logger.error("Upload failed", error);
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
