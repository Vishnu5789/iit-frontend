import { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  PhotoIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export interface TextSection {
  _id?: string;
  id?: string;
  heading: string;
  subheading?: string;
  content: string;
  image?: {
    url: string;
    fileId: string;
    alt?: string;
  };
  order: number;
  isVisible: boolean;
}

interface TextContentEditorProps {
  sections: TextSection[];
  onChange: (sections: TextSection[]) => void;
  onImageUpload?: (sectionId: string, file: File) => Promise<{ url: string; fileId: string }>;
}

export default function TextContentEditor({ sections, onChange, onImageUpload }: TextContentEditorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map((_, index) => index.toString()))
  );

  const addSection = () => {
    const newSection: TextSection = {
      id: `temp-${Date.now()}`,
      heading: '',
      subheading: '',
      content: '',
      order: sections.length,
      isVisible: true
    };
    onChange([...sections, newSection]);
    // Auto-expand new section
    setExpandedSections(new Set([...expandedSections, (sections.length).toString()]));
  };

  const updateSection = (index: number, field: keyof TextSection, value: any) => {
    const updated = sections.map((section, idx) =>
      idx === index ? { ...section, [field]: value } : section
    );
    onChange(updated);
  };

  const deleteSection = (index: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    
    const updated = sections.filter((_, idx) => idx !== index);
    // Update order numbers
    updated.forEach((section, idx) => {
      section.order = idx;
    });
    onChange(updated);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update order numbers
    newSections.forEach((section, idx) => {
      section.order = idx;
    });
    
    onChange(newSections);
  };

  const toggleExpand = (index: number) => {
    const indexStr = index.toString();
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(indexStr)) {
      newExpanded.delete(indexStr);
    } else {
      newExpanded.add(indexStr);
    }
    setExpandedSections(newExpanded);
  };

  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const sectionId = sections[index]._id || sections[index].id || `temp-${index}`;
      const result = await onImageUpload(sectionId, file);
      updateSection(index, 'image', {
        url: result.url,
        fileId: result.fileId,
        alt: ''
      });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Text Content Sections</h3>
          <p className="text-sm text-gray-500 mt-1">
            Add rich content sections with headings, text, and images
          </p>
        </div>
        <button
          type="button"
          onClick={addSection}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add Section
        </button>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No content sections yet</p>
          <p className="text-sm text-gray-500 mb-4">Add sections to organize your course content</p>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add First Section
          </button>
        </div>
      )}

      {sections.map((section, index) => {
        const isExpanded = expandedSections.has(index.toString());
        
        return (
          <div key={section._id || section.id || index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="h-5 w-5" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">
                    Section {index + 1}
                  </span>
                  {section.heading && (
                    <span className="text-gray-600 ml-2">- {section.heading}</span>
                  )}
                  {!section.isVisible && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Move Up"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                
                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Move Down"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
                
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => deleteSection(index)}
                  className="p-1.5 hover:bg-red-100 text-red-600 rounded transition"
                  title="Delete Section"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Section Content (Collapsible) */}
            {isExpanded && (
              <div className="p-6 space-y-4">
                {/* Heading */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={section.heading}
                    onChange={(e) => updateSection(index, 'heading', e.target.value)}
                    placeholder="e.g., Course Overview, What You'll Learn, Prerequisites"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Subheading */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subheading <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={section.subheading || ''}
                    onChange={(e) => updateSection(index, 'subheading', e.target.value)}
                    placeholder="e.g., Master advanced concepts in 8 weeks"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    rows={8}
                    placeholder="Enter your content here. Supports Markdown formatting:&#10;**bold**, *italic*, [link](url), etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Supports Markdown - **bold**, *italic*, [links](url), bullet points, etc.
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Image <span className="text-gray-400">(optional)</span>
                  </label>
                  
                  {section.image ? (
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <img
                        src={section.image.url}
                        alt={section.image.alt || 'Section image'}
                        className="w-32 h-32 object-cover rounded-lg shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">Image uploaded</p>
                        <input
                          type="text"
                          value={section.image.alt || ''}
                          onChange={(e) => updateSection(index, 'image', {
                            ...section.image!,
                            alt: e.target.value
                          })}
                          placeholder="Image description (for accessibility)"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded mb-2"
                        />
                        <button
                          type="button"
                          onClick={() => updateSection(index, 'image', undefined)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                        id={`image-upload-${index}`}
                      />
                      <label
                        htmlFor={`image-upload-${index}`}
                        className="cursor-pointer w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition flex flex-col items-center justify-center"
                      >
                        <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  <input
                    type="checkbox"
                    id={`visible-${index}`}
                    checked={section.isVisible}
                    onChange={(e) => updateSection(index, 'isVisible', e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor={`visible-${index}`} className="text-sm text-gray-700 font-medium">
                    Visible to students
                  </label>
                  {!section.isVisible && (
                    <span className="text-xs text-yellow-600">
                      (This section will be hidden from students)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Add missing import
import { DocumentTextIcon } from '@heroicons/react/24/outline';
