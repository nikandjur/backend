// src/core/storage/client.ts
import * as MinIO from 'minio'

export const bucketName = process.env.MINIO_BUCKET_NAME || 'uploads'
export const tempBucketName =
	process.env.MINIO_TEMP_BUCKET_NAME || 'uploads-temp'

export const minioClient = new MinIO.Client({
	endPoint: process.env.MINIO_ENDPOINT || 'localhost',
	port: parseInt(process.env.MINIO_PORT || '9000'),
	useSSL: false,
	accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
	secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

// import { Client } from 'minio'

// export const minioClient = new Client({
// 	endPoint: process.env.MINIO_ENDPOINT!,
// 	port: Number(process.env.MINIO_PORT),
// 	useSSL: process.env.MINIO_USE_SSL === 'true',
// 	accessKey: process.env.MINIO_ROOT_USER!,
// 	secretKey: process.env.MINIO_ROOT_PASSWORD!,
// })

// export const bucketName = process.env.MINIO_BUCKET_NAME!
