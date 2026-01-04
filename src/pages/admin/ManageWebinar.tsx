import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

export default function ManageWebinar() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [newInterestArea, setNewInterestArea] = useState('');

  useEffect(() => {
    checkAdminAccess();
    fetchConfig();
  }, []);

  const checkAdminAccess = () => {
    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  };

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getWebinarConfig();
      if (response.success) {
        if (!response.data.highlights) {
          setConfig({
            ...response.data,
            highlights: []
          });
        } else {
          setConfig(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching webinar config:', error);
      toast.error('Failed to load webinar configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setConfig({
      ...config,
      [field]: value
    });
  };

  const handleHighlightAdd = () => {
    if (newHighlight.trim()) {
      handleChange('highlights', [...(config.highlights || []), newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleHighlightRemove = (index: number) => {
    const updated = [...(config.highlights || [])];
    updated.splice(index, 1);
    handleChange('highlights', updated);
  };

  const handleInterestAreaAdd = () => {
    if (newInterestArea.trim()) {
      handleChange('interestAreas', [...(config.interestAreas || []), newInterestArea.trim()]);
      setNewInterestArea('');
    }
  };

  const handleInterestAreaRemove = (index: number) => {
    const updated = [...(config.interestAreas || [])];
    updated.splice(index, 1);
    handleChange('interestAreas', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!config.zoomLink || config.zoomLink.trim() === '') {
      toast.error('Zoom link is required');
      return;
    }

    if (!config.interestAreas || config.interestAreas.length === 0) {
      toast.error('At least one interest area must be configured');
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await apiService.updateWebinarConfig(config);
      
      if (response.success) {
        toast.success('Webinar configuration updated successfully!');
        fetchConfig();
      } else {
        toast.error(response.message || 'Failed to update configuration');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-16 px-4 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-4 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-dark mb-6">Manage Webinar</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Heading */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Heading
              </label>
              <input
                type="text"
                value={config.heading || ''}
                onChange={(e) => handleChange('heading', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Dive into the Future of Design Engineering!"
              />
            </div>

            {/* Subheading */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Subheading
              </label>
              <input
                type="text"
                value={config.subheading || ''}
                onChange={(e) => handleChange('subheading', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Join Isaac Institute of Technology for an exclusive live webinar."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Description
              </label>
              <textarea
                value={config.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Webinar description..."
              />
            </div>

            {/* Highlights */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Webinar Highlights
              </label>
              <div className="space-y-2 mb-3">
                {(config.highlights || []).map((highlight: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-medium">{highlight}</span>
                    <button
                      type="button"
                      onClick={() => handleHighlightRemove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleHighlightAdd())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add new highlight..."
                />
                <button
                  type="button"
                  onClick={handleHighlightAdd}
                  className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Date
              </label>
              <input
                type="text"
                value={config.date || ''}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Saturday, 25th October 2025"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Time
              </label>
              <input
                type="text"
                value={config.time || ''}
                onChange={(e) => handleChange('time', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="11:00 AM – 12:30 PM (IST)"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Platform
              </label>
              <input
                type="text"
                value={config.platform || ''}
                onChange={(e) => handleChange('platform', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Live on Zoom"
              />
            </div>

            {/* Platform Note */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Platform Note
              </label>
              <input
                type="text"
                value={config.platformNote || ''}
                onChange={(e) => handleChange('platformNote', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="(Link shared after email registration)"
              />
            </div>

            {/* Zoom Link - Required */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Zoom Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={config.zoomLink || ''}
                onChange={(e) => handleChange('zoomLink', e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://zoom.us/j/1234567890"
              />
              <p className="text-sm text-gray-500 mt-1">This link will be sent to users when they register for the webinar</p>
            </div>

            {/* Interest Areas */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Interest Areas <span className="text-red-500">*</span> (At least one required)
              </label>
              <div className="space-y-2 mb-3">
                {(config.interestAreas || []).map((area: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-medium">{area}</span>
                    <button
                      type="button"
                      onClick={() => handleInterestAreaRemove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterestArea}
                  onChange={(e) => setNewInterestArea(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleInterestAreaAdd())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add new interest area..."
                />
                <button
                  type="button"
                  onClick={handleInterestAreaAdd}
                  className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={config.isActive !== false}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-medium">
                Show webinar section on admissions page
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

