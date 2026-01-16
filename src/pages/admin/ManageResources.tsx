import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import FileUpload from '../../components/FileUpload';
import toast from 'react-hot-toast';

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  section: string;
  subcategory?: string;
  type: 'free' | 'paid';
  price: number;
  fileType: string;
  file: {
    url: string;
    fileId: string;
    name: string;
  };
  thumbnail?: {
    url: string;
    fileId: string;
  };
  downloadCount: number;
  viewCount: number;
  tags: string[];
  isActive: boolean;
  featured: boolean;
}

const sections = [
  'Course Materials',
  'Visual Learning Aids',
  'Study Guides',
  'Skill Development',
  'Career Resources',
  'Company Profiles'
];

const categories = {
  'Course Materials': ['E-Books & Textbooks', 'Lecture Notes'],
  'Visual Learning Aids': ['Mindmaps & Flowcharts', 'Infographics', 'Diagrams & Images'],
  'Study Guides': ['Interview Preparation', 'Formula Handbooks', 'Question Banks'],
  'Skill Development': [],
  'Career Resources': [],
  'Company Profiles': []
};

const fileTypes = ['PDF', 'PPT', 'DOC', 'IMAGE', 'VIDEO', 'LINK'];

export default function ManageResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    section: '',
    subcategory: '',
    type: 'free' as 'free' | 'paid',
    price: 0,
    fileType: 'PDF',
    file: { url: '', fileId: '', name: '' },
    thumbnail: { url: '', fileId: '' },
    tags: '',
    isActive: true,
    featured: false
  });

  useEffect(() => {
    checkAdminAccess();
    fetchResources();
  }, []);

  const checkAdminAccess = () => {
    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  };

  const fetchResources = async () => {
    try {
      const response = await apiService.getResources();
      if (response.success) {
        setResources(response.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.section || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.file.url) {
      toast.error('Please upload a file');
      return;
    }

    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        price: formData.type === 'free' ? 0 : formData.price
      };

      let response;
      if (editingResource) {
        response = await apiService.updateResource(editingResource._id, data);
        toast.success('Resource updated successfully');
      } else {
        response = await apiService.createResource(data);
        toast.success('Resource created successfully');
      }

      if (response.success) {
        fetchResources();
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error saving resource:', error);
      toast.error(error.response?.data?.message || 'Failed to save resource');
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      section: resource.section,
      subcategory: resource.subcategory || '',
      type: resource.type,
      price: resource.price,
      fileType: resource.fileType,
      file: resource.file,
      thumbnail: resource.thumbnail || { url: '', fileId: '' },
      tags: resource.tags.join(', '),
      isActive: resource.isActive,
      featured: resource.featured
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await apiService.deleteResource(id);
      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      section: '',
      subcategory: '',
      type: 'free',
      price: 0,
      fileType: 'PDF',
      file: { url: '', fileId: '', name: '' },
      thumbnail: { url: '', fileId: '' },
      tags: '',
      isActive: true,
      featured: false
    });
  };

  const availableCategories = formData.section ? categories[formData.section as keyof typeof categories] || [] : [];

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen bg-gradient-to-b from-light to-white">
      <div className="max-w-7xl mx-auto mb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-dark mb-2">Manage Resources</h1>
            <p className="text-medium">Manage learning resources and study materials</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Resource
          </button>
        </div>

        {/* Resources List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-medium">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first resource</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Add First Resource
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                {/* Thumbnail */}
                {resource.thumbnail?.url ? (
                  <img
                    src={resource.thumbnail.url}
                    alt={resource.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <DocumentTextIcon className="h-16 w-16 text-primary/40" />
                  </div>
                )}

                <div className="p-6">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      resource.type === 'free' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {resource.type === 'free' ? 'FREE' : `₹${resource.price}`}
                    </span>
                    {resource.featured && (
                      <span className="px-2 py-1 bg-primary text-white rounded text-xs font-bold">
                        Featured
                      </span>
                    )}
                    {!resource.isActive && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Section & Category */}
                  <div className="text-xs text-gray-500 mb-2">
                    {resource.section} • {resource.category}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-dark mb-2 line-clamp-2">{resource.title}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{resource.downloadCount} downloads</span>
                    <span>{resource.viewCount} views</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-dark">
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Section & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Section
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value, category: '' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select Section</option>
                      {sections.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={!formData.section}
                    >
                      <option value="">Select Category</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subcategory (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Subcategory (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Mechanical Engineering, Python"
                  />
                </div>

                {/* Type & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'free' | 'paid' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  {formData.type === 'paid' && (
                    <div>
                      <label className="block text-sm font-semibold text-primary mb-2">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="0"
                      />
                    </div>
                  )}
                </div>

                {/* File Type */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    File Type
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {fileTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <FileUpload
                    label="Resource File"
                    accept={formData.fileType === 'PDF' ? '.pdf' : formData.fileType === 'IMAGE' ? 'image/*' : '*/*'}
                    folder="resources/files"
                    onUploadComplete={(fileData) => {
                      setFormData({
                        ...formData,
                        file: { url: fileData.url, fileId: fileData.fileId, name: fileData.name }
                      });
                    }}
                    currentFile={formData.file.url ? {
                      url: formData.file.url,
                      name: formData.file.name
                    } : undefined}
                  />
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <FileUpload
                    label="Thumbnail Image (Optional)"
                    accept="image/*"
                    folder="resources/thumbnails"
                    onUploadComplete={(fileData) => {
                      setFormData({
                        ...formData,
                        thumbnail: { url: fileData.url, fileId: fileData.fileId }
                      });
                    }}
                    currentFile={formData.thumbnail?.url ? {
                      url: formData.thumbnail.url,
                      name: 'Thumbnail'
                    } : undefined}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., CAD, Engineering, Design"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
                  >
                    {editingResource ? 'Update Resource' : 'Create Resource'}
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
