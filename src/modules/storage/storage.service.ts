import { Client } from 'minio'

const minioClient = new Client({
	endPoint: process.env.MINIO_ENDPOINT!,
	port: Number(process.env.MINIO_PORT),
	useSSL: process.env.MINIO_USE_SSL === 'true',
	accessKey: process.env.MINIO_ROOT_USER!, 
	secretKey: process.env.MINIO_ROOT_PASSWORD!,
})

const bucketName = process.env.MINIO_BUCKET_NAME!

export const initMinio = async () => {
	try {
		const exists = await minioClient.bucketExists(bucketName)

		if (!exists) {
			try {
				await minioClient.makeBucket(bucketName, 'us-east-1')
				console.log(`✅ Bucket ${bucketName} created`)
			} catch (error: any) {
				if (error.code === 'BucketAlreadyOwnedByYou') {
					console.log(`ℹ️ Bucket ${bucketName} already exists`)
					return
				}
				throw error
			}
		}

		// Установка политики доступа (публичный доступ на чтение)
		await minioClient.setBucketPolicy(
			bucketName,
			JSON.stringify({
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: '*',
						Action: ['s3:GetObject'],
						Resource: [`arn:aws:s3:::${bucketName}/*`],
					},
				],
			})
		)

		console.log(`✅ MinIO initialized successfully`)
	} catch (error) {
		console.error('❌ MinIO initialization failed:')
		if (error instanceof Error) {
			console.error(error.message)
		}
		throw error
	}
}

export const generatePresignedUrl = async (
	objectName: string,
	expiry = 3600
) => {
	return await minioClient.presignedPutObject(bucketName, objectName, expiry)
}

export const getFileUrl = (objectName: string) => {
	const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
	return `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${objectName}`
}

// Инициализация при старте
initMinio().catch(() => {
	console.log('⚠️ Continuing with MinIO initialization error')
})
