import { useRef, useEffect, useState } from 'react'
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon,
  LinkIcon,
  PhotoIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
}

const fonts = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Palatino', value: 'Palatino' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Impact', value: 'Impact' }
]

const fontSizes = [
  { label: '8px', value: '1' },
  { label: '10px', value: '2' },
  { label: '12px', value: '3' },
  { label: '14px', value: '4' },
  { label: '16px', value: '5' },
  { label: '18px', value: '6' },
  { label: '24px', value: '7' },
  { label: '36px', value: '8' }
]

const colors = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#33CC00', '#0066FF', '#0000FF',
  '#6600FF', '#FF00FF', '#FF0066', '#FF3366', '#FF6699', '#FF99CC',
  '#00CCFF', '#00FFCC', '#66FF99', '#99FF66', '#CCFF00', '#FFFF00'
]

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Enter your content...',
  rows = 10,
  maxLength
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedBgColor, setSelectedBgColor] = useState('#FFFFFF')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateContent()
  }

  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      if (maxLength && content.length > maxLength) {
        // Truncate if exceeds max length
        return
      }
      onChange(content)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    
    // Try to get HTML content first (preserves formatting)
    let content = e.clipboardData.getData('text/html')
    
    if (content) {
      // Clean up the HTML - remove unnecessary tags and attributes
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = content
      
      // Remove script tags for security
      const scripts = tempDiv.getElementsByTagName('script')
      for (let i = scripts.length - 1; i >= 0; i--) {
        scripts[i].remove()
      }
      
      // Remove style tags
      const styles = tempDiv.getElementsByTagName('style')
      for (let i = styles.length - 1; i >= 0; i--) {
        styles[i].remove()
      }
      
      // Convert deprecated <font> tags to <span> with inline styles
      const fontTags = tempDiv.getElementsByTagName('font')
      for (let i = fontTags.length - 1; i >= 0; i--) {
        const font = fontTags[i]
        const span = document.createElement('span')
        
        // Preserve color attribute
        const color = font.getAttribute('color')
        if (color) {
          span.style.color = color
        }
        
        // Preserve size attribute (convert to approximate px)
        const size = font.getAttribute('size')
        if (size) {
          const sizeMap: { [key: string]: string } = {
            '1': '10px', '2': '13px', '3': '16px', '4': '18px',
            '5': '24px', '6': '32px', '7': '48px'
          }
          span.style.fontSize = sizeMap[size] || '16px'
        }
        
        // Preserve face attribute (font-family)
        const face = font.getAttribute('face')
        if (face) {
          span.style.fontFamily = face
        }
        
        // Move all child nodes to span
        while (font.firstChild) {
          span.appendChild(font.firstChild)
        }
        
        // Replace font tag with span
        font.parentNode?.replaceChild(span, font)
      }
      
      // Get cleaned HTML
      content = tempDiv.innerHTML
      
      // Insert the HTML content
      document.execCommand('insertHTML', false, content)
    } else {
      // Fall back to plain text if no HTML
      const text = e.clipboardData.getData('text/plain')
      document.execCommand('insertText', false, text)
    }
    
    updateContent()
  }

  const applyColor = (color: string) => {
    execCommand('foreColor', color)
    setSelectedColor(color)
    setShowColorPicker(false)
  }

  const applyBgColor = (color: string) => {
    execCommand('backColor', color)
    setSelectedBgColor(color)
    setShowBgColorPicker(false)
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const insertImage = () => {
    // Trigger file input click
    fileInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('Image size should be less than 15MB')
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'courses/content-images')

      const response = await apiService.uploadFile(formData)
      
      if (response.success && response.data.url) {
        // Insert the uploaded image URL into the editor
        execCommand('insertImage', response.data.url)
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap items-center gap-2">
        {/* Font Family */}
        <select
          onChange={(e) => execCommand('fontName', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          defaultValue=""
        >
          {fonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>

        {/* Font Size */}
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
          defaultValue="4"
        >
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
            title="Text Color"
          >
            <div 
              className="w-4 h-4 border border-gray-400 rounded"
              style={{ backgroundColor: selectedColor }}
            ></div>
            <span className="text-xs">A</span>
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50">
              <div className="grid grid-cols-6 gap-1 w-48">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                onChange={(e) => applyColor(e.target.value)}
                className="mt-2 w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
            title="Background Color"
          >
            <div 
              className="w-4 h-4 border border-gray-400 rounded"
              style={{ backgroundColor: selectedBgColor }}
            ></div>
            <span className="text-xs">Bg</span>
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50">
              <div className="grid grid-cols-6 gap-1 w-48">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => applyBgColor(color)}
                    className="w-6 h-6 border border-gray-300 rounded hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                onChange={(e) => applyBgColor(e.target.value)}
                className="mt-2 w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-bold"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-bold"
          title="Numbered List"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Link & Image */}
        <button
          type="button"
          onClick={insertLink}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          disabled={isUploadingImage}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isUploadingImage ? 'Uploading...' : 'Insert Image'}
        >
          {isUploadingImage ? (
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PhotoIcon className="h-4 w-4" />
          )}
        </button>
        
        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'pre')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Code Block"
        >
          <CodeBracketIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-semibold"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-semibold"
          title="Align Center"
        >
          ⬌
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors text-xs font-semibold"
          title="Align Right"
        >
          ➡
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onPaste={handlePaste}
        onBlur={updateContent}
        className="min-h-[200px] p-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={{ 
          minHeight: `${rows * 1.5}rem`,
          fontFamily: 'inherit'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Placeholder */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>

      {/* Character Count */}
      {maxLength && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-300 text-xs text-gray-500">
          {value.length} / {maxLength} characters
        </div>
      )}
    </div>
  )
}

