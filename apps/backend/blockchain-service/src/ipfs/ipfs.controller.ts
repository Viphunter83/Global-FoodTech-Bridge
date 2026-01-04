import { Controller, Post, UploadedFiles, Body, UseInterceptors, Logger } from '@nestjs/common';
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
        this.logger.log(`Received upload request. Files: ${files ? files.length : 0}`);

        const uploadedHashes: Record<string, string> = {};

        // 1. Upload all files (certificates)
        if (files && files.length > 0) {
            for (const file of files) {
                const hash = await this.ipfsService.uploadFile(file.buffer, file.originalname);
                uploadedHashes[file.originalname] = hash;
            }
        }

        // 2. Construct Metadata JSON
        const metadata = {
            name: `Batch ${body.manufacturer_id}`, // temporary name
            description: `Batch of ${body.product_type}`,
            image: "ipfs://placeholder-image", // In real app, maybe upload a product image?
            attributes: [
                { trait_type: "Ingredients", value: body.ingredients },
                { trait_type: "Production Date", value: body.productionDate },
                { trait_type: "Expiration Date", value: body.expirationDate },
                { trait_type: "Batch Size", value: body.batch_size },
            ],
            // Extensions for certificates
            certificates: Object.entries(uploadedHashes).map(([name, hash]) => ({
                name,
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
    }
}
