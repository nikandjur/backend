import {
	generatePresignedUrl,
	getObjectUrl,
} from '../../core/services/storage/service.js'
import { z } from 'zod'

const FileUploadSchema = z.object({
	userId: z.string().cuid(),
	prefix: z.string().default('uploads'),
})

export const generateUploadUrl = async (userId: string, prefix?: string) => {
	const { prefix: validatedPrefix } = FileUploadSchema.parse({ userId, prefix })
	const objectName = `${validatedPrefix}/${userId}-${Date.now()}`

	return {
		uploadUrl: await generatePresignedUrl(objectName),
		objectName,
		accessUrl: getObjectUrl(objectName),
	}
}
