import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import fs from 'fs';
import BadRequestError from '../errors/bad-request-error'
import { validateImageFormat } from '../utils/fileValidator';

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file || !req.file.path) {
        return next(new BadRequestError('Файл не загружен'))
    }

    if (req.file.size < 2048) {
        return next(new BadRequestError('Файл слишком мал'))
    }

    const fileBuffer = fs.readFileSync(req.file.path);
    if (!validateImageFormat(fileBuffer)) {
        // Удаляем невалидный файл
        fs.unlinkSync(req.file.path);
        return next(new BadRequestError('Неверный формат изображения'));
    }

    try {
        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}