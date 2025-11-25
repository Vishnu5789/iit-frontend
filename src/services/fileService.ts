import { API_BASE_URL } from '../config/api.config'

/**
 * Generate a presigned URL for a file stored in S3
 * @param fileId - The S3 key (fileId) of the file
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL or null if error
 */
export const getPresignedUrl = async (fileId: string, expiresIn: number = 3600): Promise<string | null> => {
  try {
    // Encode the fileId to handle special characters
    const encodedFileId = encodeURIComponent(fileId)
    
    const response = await fetch(
      `${API_BASE_URL}/upload/presigned/${encodedFileId}?expiresIn=${expiresIn}`
    )
    
    const data = await response.json()
    
    if (data.success && data.data.presignedUrl) {
      return data.data.presignedUrl
    }
    
    console.error('Failed to get presigned URL:', data.message)
    return null
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return null
  }
}

/**
 * Get a public URL or presigned URL for a file
 * If the direct URL doesn't work (Access Denied), this will return a presigned URL
 * @param url - The original S3 URL or fileId
 * @returns Working URL (either public or presigned)
 */
export const getAccessibleUrl = async (url: string): Promise<string> => {
  // If it's already a presigned URL (contains signature), return as-is
  if (url.includes('X-Amz-Signature') || url.includes('Signature=')) {
    return url
  }
  
  // Try the direct URL first
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (response.ok) {
      return url // Direct URL works
    }
  } catch (error) {
    // Direct URL doesn't work, fall through to presigned URL
  }
  
  // Extract fileId from URL or use the URL as fileId
  let fileId = url
  
  // If it's a full S3 URL, extract the key
  if (url.includes('.s3.') || url.includes('.amazonaws.com')) {
    const urlParts = url.split('.amazonaws.com/')
    if (urlParts.length > 1) {
      fileId = urlParts[1]
    }
  }
  
  // Generate presigned URL
  const presignedUrl = await getPresignedUrl(fileId)
  return presignedUrl || url // Return presigned URL or fallback to original
}

export default {
  getPresignedUrl,
  getAccessibleUrl
}

