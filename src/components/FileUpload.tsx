import { useState } from 'react'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'
import { API_BASE_URL } from '../config/api.config'

interface FileUploadProps {
  label: string
  accept: string
  folder?: string
  onUploadComplete: (fileData: { url: string; fileId: string; name: string }) => void
  currentFile?: { url: string; name?: string }
  onRemove?: () => void
}

const FileUpload = ({ label, accept, folder = 'courses', onUploadComplete, currentFile, onRemove }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

  // Direct S3 upload for large files
  const uploadDirectToS3 = async (file: File) => {
    try {
      setProgress(10)

      // Step 1: Get presigned URL from backend
      const token = apiService.getToken()
      const presignedResponse = await fetch(`${API_BASE_URL}/upload/presigned-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: file.name,
          folder: folder,
          contentType: file.type
        })
      })

      const presignedData = await presignedResponse.json()
      
      if (!presignedData.success) {
        throw new Error(presignedData.message || 'Failed to get upload URL')
      }

      setProgress(30)

      // Step 2: Upload directly to S3 using presigned URL
      const uploadResponse = await fetch(presignedData.data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to S3')
      }

      setProgress(100)

      // Return the file data
      onUploadComplete({
        url: presignedData.data.url,
        fileId: presignedData.data.fileId,
        name: file.name
      })

    } catch (error) {
      console.error('Direct S3 upload error:', error)
      throw error
    }
  }

  // Regular upload through backend (for small files)
  const uploadViaBackend = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    setProgress(50)

    const token = apiService.getToken()
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    setProgress(90)
    const data = await response.json()

    if (data.success) {
      onUploadComplete({
        url: data.data.url,
        fileId: data.data.fileId,
        name: data.data.name
      })
      setProgress(100)
    } else {
      throw new Error(data.message || 'Upload failed')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Validate image file size (max 15MB for images)
      const isImage = file.type.startsWith('image/')
      const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
      
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        alert(`Image size should be less than 15MB. Your file is ${Math.round(file.size / 1024 / 1024)}MB`)
        e.target.value = ''
        return
      }

      setUploading(true)
      setProgress(5)

      // Use direct S3 upload for files larger than threshold
      if (file.size > LARGE_FILE_THRESHOLD) {
        console.log(`Large file detected (${Math.round(file.size / 1024 / 1024)}MB). Using direct S3 upload...`)
        await uploadDirectToS3(file)
      } else {
        await uploadViaBackend(file)
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setProgress(0)
      e.target.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-2">{label}</label>
      
      {currentFile ? (
        <div className="border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentFile.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img src={currentFile.url} alt="Preview" className="w-16 h-16 object-cover rounded" />
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center">
                <CloudArrowUpIcon className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-dark">{currentFile.name || 'Uploaded file'}</p>
              <a href={currentFile.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                View file
              </a>
            </div>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={`file-${label}`}
          />
          <label
            htmlFor={`file-${label}`}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <CloudArrowUpIcon className="h-10 w-10 text-primary/60 mb-2" />
            <p className="text-sm text-dark/60">
              {uploading ? `Uploading... ${progress}%` : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-dark/40 mt-1">{accept.split(',').join(', ')}</p>
          </label>
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FileUpload

