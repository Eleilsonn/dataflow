import { BadRequestException, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { diskStorage } from 'multer';
import path from 'path';

const extensionAccepteds = ['.csv', '.xlsx'];

export const optionsSaveFileTransactions: MulterOptions = {
    storage: diskStorage({
        destination: './tmp',
        filename: (request, file, callback) => {
            if (!file)
                throw new BadRequestException('Arquivo não informado');
            const extension = path.extname(file.originalname);

            if (!extensionAccepteds.includes(extension))
                throw new BadRequestException('O tipo de arquivo informado não é compativel com o tipo esperado')

            const filename = `${crypto.randomUUID()}${extension}`;
            callback(null, filename)
        }
    })
}

export const validatorFileTransactions: ParseFilePipe = new ParseFilePipe({
    validators: [
        new MaxFileSizeValidator({ maxSize: 200 * 1024 * 1024 })
    ]
})
