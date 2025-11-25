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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    try {
      setUploading(true)
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
          url: data.data.url, // Use public URL (presignedUrl is only for private content)
          fileId: data.data.fileId,
          name: data.data.name
        })
        setProgress(100)
      } else {
        alert(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
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

