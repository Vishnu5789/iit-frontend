import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, PhoneIcon, EnvelopeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useLocation } from 'react-router-dom';
import apiService from '../services/api';

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

export default function ContactWidget() {
  const [config, setConfig] = useState<ContactWidgetConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchConfig();
    
    // Listen for configuration updates from admin panel
    const handleConfigUpdate = () => {
      console.log('Config update event received - refetching...');
      fetchConfig();
    };
    
    window.addEventListener('contactWidgetConfigUpdated', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('contactWidgetConfigUpdated', handleConfigUpdate);
    };
  }, []);

  // Log when location changes to help debug
  useEffect(() => {
    console.log('Location changed:', location.pathname);
    console.log('Current config:', config);
    console.log('Should show widget?', shouldShowWidget());
  }, [location.pathname, config]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiService.API_BASE_URL}/contact-widget`);
      const data = await response.json();
      if (data.success && data.data) {
        console.log('Contact Widget Config:', data.data);
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching contact widget config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if widget should be shown on current page
  const shouldShowWidget = () => {
    if (!config) {
      console.log('Widget: No config');
      return false;
    }
    
    if (!config.isEnabled) {
      console.log('Widget: Not enabled');
      return false;
    }
    
    if (config.showOnPages.includes('all')) {
      console.log('Widget: Showing on all pages');
      return true;
    }
    
    const currentPath = location.pathname;
    console.log('Widget: Current path:', currentPath);
    console.log('Widget: Show on pages:', config.showOnPages);
    
    // Check for specific pages
    if (config.showOnPages.includes('home') && currentPath === '/') {
      console.log('Widget: Showing on home');
      return true;
    }
    if (config.showOnPages.includes('courses') && currentPath === '/courses') {
      console.log('Widget: Showing on courses');
      return true;
    }
    if (config.showOnPages.includes('course-detail') && currentPath.startsWith('/courses/')) {
      console.log('Widget: Showing on course detail');
      return true;
    }
    if (config.showOnPages.includes('about') && currentPath === '/about') {
      console.log('Widget: Showing on about');
      return true;
    }
    if (config.showOnPages.includes('contact') && currentPath === '/contact') {
      console.log('Widget: Showing on contact');
      return true;
    }
    if (config.showOnPages.includes('blog') && (currentPath === '/blog' || currentPath.startsWith('/blog/'))) {
      console.log('Widget: Showing on blog');
      return true;
    }
    if (config.showOnPages.includes('industry') && (currentPath === '/industry' || currentPath.startsWith('/industry/'))) {
      console.log('Widget: Showing on industry');
      return true;
    }
    
    console.log('Widget: Not showing on this page');
    return false;
  };

  const showWidget = shouldShowWidget();
  
  if (isLoading || !showWidget) {
    if (!isLoading) {
      console.log('Widget not showing. Config:', config);
    }
    return null;
  }

  // Get position classes based on config
  const getPositionClasses = () => {
    switch (config?.position) {
      case 'bottom-left':
        return 'bottom-6 left-6 md:bottom-6 md:left-6';
      case 'top-right':
        return 'top-28 right-6 md:top-28 md:right-6';
      case 'top-left':
        return 'top-28 left-6 md:top-28 md:left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6 md:bottom-6 md:right-6';
    }
  };

  const handleWhatsAppClick = () => {
    if (config?.whatsappNumber) {
      const message = encodeURIComponent(config.customMessage || 'Hello, I need assistance!');
      window.open(`https://wa.me/${config.whatsappNumber}?text=${message}`, '_blank');
    }
  };

  const handlePhoneClick = () => {
    if (config?.phoneNumber) {
      window.location.href = `tel:${config.phoneNumber}`;
    }
  };

  const handleEmailClick = () => {
    if (config?.email) {
      window.location.href = `mailto:${config.email}`;
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999]`}>
      {/* Chatbot Script */}
      {config?.chatbotEnabled && config.chatbotScript && (
        <div dangerouslySetInnerHTML={{ __html: config.chatbotScript }} />
      )}

      {/* Contact Options - Show when open */}
      {isOpen && (
        <div className="mb-3 flex flex-col gap-2 animate-fade-in">
          {config?.whatsappNumber && (
            <button
              onClick={handleWhatsAppClick}
              className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group relative"
              title="WhatsApp"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                WhatsApp
              </span>
            </button>
          )}
          
          {config?.phoneNumber && (
            <button
              onClick={handlePhoneClick}
              className="bg-[#5850EC] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group relative"
              title="Call Us"
            >
              <PhoneIcon className="h-5 w-5" />
              <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Call Us
              </span>
            </button>
          )}
          
          {config?.email && (
            <button
              onClick={handleEmailClick}
              className="bg-[#F59E0B] text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group relative"
              title="Email Us"
            >
              <EnvelopeIcon className="h-5 w-5" />
              <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Email Us
              </span>
            </button>
          )}
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1a1f71] text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
        title={isOpen ? 'Close' : 'Contact Us'}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}

