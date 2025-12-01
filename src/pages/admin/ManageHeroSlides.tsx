import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import apiService from '../../services/api';
import FileUpload from '../../components/FileUpload';

interface HeroSlide {
  _id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  media: {
    url: string;
    fileId: string;
  };
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  autoplayDuration: number;
}

const ManageHeroSlides = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'image' as 'image' | 'video',
    media: {
      url: '',
      fileId: ''
    },
    buttonText: 'READ MORE',
    buttonLink: '/about',
    order: 0,
    isActive: true,
    autoplayDuration: 5000
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllHeroSlidesAdmin();
      if (response.success) {
        setSlides(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching slides:', error);
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        description: slide.description || '',
        type: slide.type,
        media: slide.media,
        buttonText: slide.buttonText,
        buttonLink: slide.buttonLink,
        order: slide.order,
        isActive: slide.isActive,
        autoplayDuration: slide.autoplayDuration
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        description: '',
        type: 'image',
        media: {
          url: '',
          fileId: ''
        },
        buttonText: 'READ MORE',
        buttonLink: '/about',
        order: slides.length,
        isActive: true,
        autoplayDuration: 5000
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData({
      title: '',
      description: '',
      type: 'image',
      media: {
        url: '',
        fileId: ''
      },
      buttonText: 'READ MORE',
      buttonLink: '/about',
      order: 0,
      isActive: true,
      autoplayDuration: 5000
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.media.url) {
      toast.error('Please upload media (image or video)');
      return;
    }

    try {
      if (editingSlide) {
        const response = await apiService.updateHeroSlide(editingSlide._id, formData);
        if (response.success) {
          toast.success('Hero slide updated successfully');
          fetchSlides();
          handleCloseModal();
        }
      } else {
        const response = await apiService.createHeroSlide(formData);
        if (response.success) {
          toast.success('Hero slide created successfully');
          fetchSlides();
          handleCloseModal();
        }
      }
    } catch (error: any) {
      console.error('Error saving slide:', error);
      toast.error(error.message || 'Failed to save hero slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await apiService.deleteHeroSlide(id);
      if (response.success) {
        toast.success('Hero slide deleted successfully');
        fetchSlides();
      }
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      toast.error(error.message || 'Failed to delete hero slide');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    
    const reorderData = newSlides.map((slide, idx) => ({
      id: slide._id,
      order: idx
    }));

    try {
      await apiService.reorderHeroSlides(reorderData);
      setSlides(newSlides);
      toast.success('Slides reordered');
    } catch (error) {
      toast.error('Failed to reorder slides');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    
    const reorderData = newSlides.map((slide, idx) => ({
      id: slide._id,
      order: idx
    }));

    try {
      await apiService.reorderHeroSlides(reorderData);
      setSlides(newSlides);
      toast.success('Slides reordered');
    } catch (error) {
      toast.error('Failed to reorder slides');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-dark mb-2">Manage Hero Slides</h1>
            <p className="text-medium">Customize homepage slider images and videos</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Slide
          </button>
        </div>

        {/* Slides List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-medium mt-4">Loading slides...</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark mb-2">No hero slides yet</h3>
            <p className="text-medium mb-6">Get started by adding your first hero slide</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add First Slide
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                  slide.isActive ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                {/* Media Preview */}
                <div className="relative h-48 bg-gray-100">
                  {slide.type === 'image' ? (
                    <img
                      src={slide.media.url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={slide.media.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <VideoCameraIcon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span className="bg-primary text-white px-2 py-1 rounded text-xs font-semibold">
                      #{index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      slide.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-dark text-lg mb-2 line-clamp-2">
                    {slide.title}
                  </h3>
                  {slide.description && (
                    <p className="text-sm text-medium mb-3 line-clamp-2">
                      {slide.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-medium mb-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                      {slide.type === 'image' ? 'Image' : 'Video'}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {slide.autoplayDuration / 1000}s duration
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOpenModal(slide)}
                      className="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-all text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slide._id)}
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-all text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                    <div className="flex gap-1 w-full">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                          index === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ↑ Up
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === slides.length - 1}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                          index === slides.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ↓ Down
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4">
                <h2 className="text-2xl font-bold text-dark">
                  {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Slide Type *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="type"
                        value="image"
                        checked={formData.type === 'image'}
                        onChange={() => setFormData({ ...formData, type: 'image' })}
                        className="w-4 h-4 text-primary"
                      />
                      <PhotoIcon className="w-6 h-6 text-primary" />
                      <span className="font-medium">Image</span>
                    </label>
                    <label className="flex-1 flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="type"
                        value="video"
                        checked={formData.type === 'video'}
                        onChange={() => setFormData({ ...formData, type: 'video' })}
                        className="w-4 h-4 text-primary"
                      />
                      <VideoCameraIcon className="w-6 h-6 text-primary" />
                      <span className="font-medium">Video</span>
                    </label>
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    {formData.type === 'image' ? 'Slide Image' : 'Slide Video'} *
                  </label>
                  <FileUpload
                    label={formData.type === 'image' ? 'Upload Image' : 'Upload Video'}
                    accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                    folder={formData.type === 'image' ? 'hero-images' : 'hero-videos'}
                    onUploadComplete={(urlOrObject: any, fileId?: string) => {
                      // Handle both old and new FileUpload component formats
                      if (typeof urlOrObject === 'string') {
                        // Old format: (url, fileId)
                        setFormData({ ...formData, media: { url: urlOrObject, fileId: fileId || '' } });
                      } else if (urlOrObject && typeof urlOrObject === 'object') {
                        // New format: returns object with url and fileId
                        setFormData({ 
                          ...formData, 
                          media: { 
                            url: urlOrObject.url || '', 
                            fileId: urlOrObject.fileId || urlOrObject.name || '' 
                          } 
                        });
                      }
                    }}
                    currentFile={formData.media.url ? { url: formData.media.url, name: formData.media.fileId } : undefined}
                    onRemove={() => {
                      setFormData({ ...formData, media: { url: '', fileId: '' } });
                    }}
                  />
                  {formData.media.url && (
                    <div className="mt-3 rounded-lg overflow-hidden border">
                      {formData.type === 'image' ? (
                        <img src={formData.media.url} alt="Preview" className="w-full h-48 object-cover" />
                      ) : (
                        <video src={formData.media.url} className="w-full h-48" controls />
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Slide Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter slide title..."
                    maxLength={200}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter slide description..."
                    rows={3}
                    maxLength={500}
                  />
                </div>

                {/* Button Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., READ MORE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-dark mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., /about"
                    />
                  </div>
                </div>

                {/* Autoplay Duration */}
                <div>
                  <label className="block text-sm font-semibold text-dark mb-2">
                    Autoplay Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.autoplayDuration / 1000}
                    onChange={(e) => setFormData({ ...formData, autoplayDuration: Number(e.target.value) * 1000 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-medium mt-1">How long to display this slide before moving to the next one</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-dark cursor-pointer">
                    Set as Active (visible on homepage)
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-dark rounded-lg hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
                  >
                    {editingSlide ? 'Update Slide' : 'Create Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageHeroSlides;

