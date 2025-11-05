import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'
import { basename } from 'path';

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('Upload file:', req.file); // ✅ Логирование
    
    if (!req.file) {
        console.log('No file uploaded'); // ✅ Логирование
        return next(new BadRequestError('Файл не загружен'))
    }
    
    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        
        console.log('File saved as:', fileName); // ✅ Логирование
        
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
        })
    } catch (error) {
        console.log('Upload error:', error); // ✅ Логирование
        return next(error)
    }
}

export default {}
