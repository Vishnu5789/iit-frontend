import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import FileUpload from '../../components/FileUpload';

interface AboutSection {
  _id: string;
  key: string;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  sectionType: 'hero' | 'text' | 'list' | 'card';
  metadata?: {
    subtitle?: string;
    items?: string[];
    imageUrl?: string;
  };
  image?: {
    url: string;
    fileId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ManageAbout() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    key: '',
    title: '',
    content: '',
    order: 0,
    isActive: true,
    sectionType: 'text' as 'hero' | 'text' | 'list' | 'card',
    metadata: {
      subtitle: '',
      items: [] as string[],
      imageUrl: ''
    },
    image: {
      url: '',
      fileId: ''
    }
  });

  useEffect(() => {
    checkAdminAccess();
    fetchSections();
  }, []);

  const checkAdminAccess = () => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  };

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAboutSectionsAdmin();
      if (response.success) {
        setSections(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to fetch sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('This will create default about sections. Continue?')) {
      return;
    }

    try {
      const response = await apiService.initializeAboutSections();
      if (response.success) {
        toast.success('Default sections created successfully');
        fetchSections();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize sections');
    }
  };

  const openModal = (section?: AboutSection) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        key: section.key,
        title: section.title,
        content: section.content,
        order: section.order,
        isActive: section.isActive,
        sectionType: section.sectionType,
        metadata: {
          subtitle: section.metadata?.subtitle || '',
          items: section.metadata?.items || [],
          imageUrl: section.metadata?.imageUrl || ''
        },
        image: {
          url: section.image?.url || '',
          fileId: section.image?.fileId || ''
        }
      });
    } else {
      setEditingSection(null);
      setFormData({
        key: '',
        title: '',
        content: '',
        order: sections.length + 1,
        isActive: true,
        sectionType: 'text',
        metadata: {
          subtitle: '',
          items: [],
          imageUrl: ''
        },
        image: {
          url: '',
          fileId: ''
        }
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSection(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.key || !formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      let response;

      if (editingSection) {
        response = await apiService.updateAboutSection(editingSection._id, formData);
      } else {
        response = await apiService.createAboutSection(formData);
      }

      if (response.success) {
        toast.success(editingSection ? 'Section updated successfully' : 'Section created successfully');
        closeModal();
        fetchSections();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) {
      return;
    }

    try {
      const response = await apiService.deleteAboutSection(id);
      if (response.success) {
        toast.success('Section deleted successfully');
        fetchSections();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete section');
    }
  };

  const toggleActive = async (section: AboutSection) => {
    try {
      const response = await apiService.updateAboutSection(section._id, {
        ...section,
        isActive: !section.isActive
      });
      if (response.success) {
        toast.success(section.isActive ? 'Section hidden' : 'Section activated');
        fetchSections();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update section');
    }
  };

  const addListItem = () => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        items: [...formData.metadata.items, '']
      }
    });
  };

  const updateListItem = (index: number, value: string) => {
    const newItems = [...formData.metadata.items];
    newItems[index] = value;
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        items: newItems
      }
    });
  };

  const removeListItem = (index: number) => {
    setFormData({
      ...formData,
      metadata: {
        ...formData.metadata,
        items: formData.metadata.items.filter((_, i) => i !== index)
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage About Page</h1>
              <p className="text-gray-600 mt-2">Customize sections displayed on the About page</p>
            </div>
            <div className="flex gap-3">
              {sections.length === 0 && (
                <button
                  onClick={handleInitialize}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all"
                >
                  Initialize Default Sections
                </button>
              )}
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Add Section
              </button>
            </div>
          </div>
        </div>

        {/* Sections List */}
        {sections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600 mb-6">Get started by initializing default sections or creating your own</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleInitialize}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                Initialize Defaults
              </button>
              <button
                onClick={() => openModal()}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all"
              >
                Create Custom Section
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <div
                key={section._id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
                  section.isActive ? 'border-green-200' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {section.sectionType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-xs text-gray-500">Order: {section.order}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Key: <code className="bg-gray-100 px-2 py-1 rounded">{section.key}</code></p>
                    <p className="text-gray-600 text-sm line-clamp-3">{section.content}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(section)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                      title={section.isActive ? 'Hide section' : 'Show section'}
                    >
                      {section.isActive ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => openModal(section)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit section"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(section._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete section"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Key * <span className="text-xs text-gray-500">(unique identifier)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., hero, mission, philosophy"
                      required
                      disabled={!!editingSection}
                    />
                  </div>

                  {/* Section Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section Type *</label>
                    <select
                      value={formData.sectionType}
                      onChange={(e) => setFormData({ ...formData, sectionType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="text">Text</option>
                      <option value="hero">Hero</option>
                      <option value="list">List</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Section title"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Section content (supports multiple paragraphs)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Use \n\n to create paragraph breaks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      min="0"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Active (visible on page)</span>
                    </label>
                  </div>
                </div>

                {/* List Items (only for list type) */}
                {formData.sectionType === 'list' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">List Items</label>
                    <div className="space-y-2">
                      {formData.metadata.items.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => updateListItem(index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={`Item ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeListItem(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addListItem}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-all"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Upload (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Image <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <FileUpload
                    label="Upload Section Image"
                    accept="image/*"
                    folder="about-sections"
                    onUploadComplete={(fileData) => {
                      setFormData({
                        ...formData,
                        image: {
                          url: fileData.url,
                          fileId: fileData.fileId
                        }
                      });
                    }}
                    currentFile={formData.image.url ? { url: formData.image.url } : undefined}
                    onRemove={() => {
                      setFormData({
                        ...formData,
                        image: {
                          url: '',
                          fileId: ''
                        }
                      });
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload an image to display with this section</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
