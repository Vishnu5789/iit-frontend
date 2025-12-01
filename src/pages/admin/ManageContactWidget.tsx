import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface ContactWidgetConfig {
  isEnabled: boolean;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnPages: string[];
  chatbotEnabled: boolean;
  chatbotScript: string;
  customMessage: string;
}

const pageOptions = [
  { value: 'all', label: 'All Pages' },
  { value: 'home', label: 'Home Page' },
  { value: 'courses', label: 'Courses Page' },
  { value: 'course-detail', label: 'Course Detail Pages' },
  { value: 'about', label: 'About Page' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'blog', label: 'Blog Pages' },
  { value: 'industry', label: 'Industry Pages' },
];

const positionOptions = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
];

export default function ManageContactWidget() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [config, setConfig] = useState<ContactWidgetConfig>({
    isEnabled: true,
    whatsappNumber: '',
    phoneNumber: '',
    email: '',
    position: 'bottom-right',
    showOnPages: ['all'],
    chatbotEnabled: false,
    chatbotScript: '',
    customMessage: 'How can we help you today?',
  });

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = apiService.getUser();
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchConfig();
  }, [navigate]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiService.API_BASE_URL}/contact-widget`);
      const data = await response.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching contact widget config:', error);
      toast.error('Failed to load contact widget configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!config.whatsappNumber || !config.phoneNumber || !config.email) {
      toast.error('Please fill in all required contact information');
      return;
    }

    console.log('Saving contact widget config:', config);

    try {
      setSaving(true);
      const response = await apiService.updateContactWidget(config);
      
      console.log('Save response:', response);
      
      if (response.success) {
        toast.success('Contact widget configuration updated successfully! Please refresh the page to see changes.');
        console.log('Configuration saved. Widget will show on:', config.showOnPages);
        
        // Force refresh the configuration
        await fetchConfig();
        
        // Dispatch custom event to notify ContactWidget component
        window.dispatchEvent(new CustomEvent('contactWidgetConfigUpdated'));
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to update contact widget configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePageToggle = (page: string) => {
    if (page === 'all') {
      setConfig({ ...config, showOnPages: ['all'] });
    } else {
      const currentPages = config.showOnPages.filter(p => p !== 'all');
      if (currentPages.includes(page)) {
        const newPages = currentPages.filter(p => p !== page);
        setConfig({ ...config, showOnPages: newPages.length > 0 ? newPages : ['all'] });
      } else {
        setConfig({ ...config, showOnPages: [...currentPages, page] });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Manage Contact Widget</h1>
          <p className="text-gray-600 mt-2">Configure the floating contact widget that appears on your site</p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          {/* Enable/Disable Widget */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enable Contact Widget</h3>
              <p className="text-sm text-gray-600">Show the contact widget on your website</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number *
              </label>
              <input
                type="text"
                value={config.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                placeholder="e.g., 1234567890 (with country code, no + or spaces)"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Enter the phone number with country code, without + or spaces</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                placeholder="e.g., +1 (234) 567-8900"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="e.g., contact@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message
              </label>
              <input
                type="text"
                value={config.customMessage}
                onChange={(e) => setConfig({ ...config, customMessage: e.target.value })}
                placeholder="Message for WhatsApp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Widget Position</h3>
            <div className="grid grid-cols-2 gap-3">
              {positionOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    config.position === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="position"
                    value={option.value}
                    checked={config.position === option.value}
                    onChange={(e) => setConfig({ ...config, position: e.target.value as any })}
                    className="sr-only"
                  />
                  <span className="font-medium text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show on Pages */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Show on Pages</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pageOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    config.showOnPages.includes(option.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config.showOnPages.includes(option.value)}
                    onChange={() => handlePageToggle(option.value)}
                    className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Chatbot Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enable Custom Chatbot</h3>
                <p className="text-sm text-gray-600">Add a third-party chatbot script (e.g., Tawk.to, Intercom)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.chatbotEnabled}
                  onChange={(e) => setConfig({ ...config, chatbotEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {config.chatbotEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chatbot Script
                </label>
                <textarea
                  value={config.chatbotScript}
                  onChange={(e) => setConfig({ ...config, chatbotScript: e.target.value })}
                  placeholder="Paste your chatbot script here (e.g., Tawk.to script)"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Paste the complete script tag provided by your chatbot provider</p>
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Configuration Preview:</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Enabled:</strong> {config.isEnabled ? 'Yes' : 'No'}</p>
              <p><strong>Position:</strong> {config.position}</p>
              <p><strong>Show on:</strong> {config.showOnPages.join(', ') || 'None selected'}</p>
              <p className="text-blue-600 mt-2">
                {config.showOnPages.includes('all') 
                  ? '✅ Widget will appear on ALL pages' 
                  : config.showOnPages.length > 0
                  ? `✅ Widget will appear on: ${config.showOnPages.join(', ')}`
                  : '⚠️ No pages selected - widget will not appear anywhere'}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

