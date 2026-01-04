import { useEffect, useState } from 'react';
import apiService from '../services/api';

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
}

export default function About() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getAboutSections();
      if (response.success) {
        setSections(response.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSection = (section: AboutSection) => {
    // Split content by double newlines for paragraphs
    const paragraphs = section.content.split('\n\n').filter(p => p.trim());

    switch (section.sectionType) {
      case 'hero':
        return (
          <div key={section._id} className="relative bg-gradient-to-br from-primary via-primary/95 to-primary-dark text-white py-20 overflow-hidden">
            {/* Decorative Background Graphics */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            {/* Geometric Patterns */}
            <div className="absolute inset-0 opacity-5">
              <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {section.image?.url && (
                <div className="flex justify-center mb-8 relative">
                  {/* Decorative Elements Around Image */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/30 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-secondary/50 rounded-xl blur-2xl transform scale-110"></div>
                    <img
                      src={section.image.url}
                      alt={section.title}
                      className="relative z-10 rounded-xl shadow-2xl max-w-2xl w-full h-auto object-cover border-4 border-white/20"
                    />
                  </div>
                </div>
              )}
              <div className="text-center relative z-10">
                <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">{section.title}</h1>
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-2xl mb-4 last:mb-0 drop-shadow-md">{para}</p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <section key={section._id} className="relative py-16 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
            {/* Decorative Side Graphics */}
            <div className="absolute left-0 top-0 w-64 h-full opacity-5">
              <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-secondary rounded-full blur-2xl"></div>
            </div>
            <div className="absolute right-0 top-0 w-64 h-full opacity-5">
              <div className="absolute top-40 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
              <div className="absolute bottom-40 right-20 w-28 h-28 bg-primary rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`${section.image?.url ? 'grid grid-cols-1 md:grid-cols-2 gap-12 items-start' : ''}`}>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
                  {paragraphs.map((para, idx) => (
                    <p key={idx} className="text-gray-700 text-lg mb-6 leading-relaxed">{para}</p>
                  ))}
                  {section.metadata?.items && section.metadata.items.length > 0 && (
                    <ul className="space-y-4 mt-6">
                      {section.metadata.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {section.image?.url && (
                  <div className="relative z-10">
                    {/* Decorative Frame Around Image */}
                    <div className="relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl"></div>
                      <div className="absolute -inset-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl"></div>
                      <div className="relative bg-white p-2 rounded-xl shadow-2xl">
                        <img
                          src={section.image.url}
                          alt={section.title}
                          className="rounded-lg w-full h-auto object-cover sticky top-28"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'card':
        return (
          <section key={section._id} className="relative py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-secondary/10 to-transparent rounded-tl-full"></div>
                
                {section.image?.url && (
                  <div className="mb-8 relative">
                    {/* Decorative Graphics Around Image */}
                    <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-2xl"></div>
                    <div className="absolute -inset-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl"></div>
                    <div className="relative bg-gradient-to-br from-gray-50 to-white p-3 rounded-xl shadow-lg">
                      <img
                        src={section.image.url}
                        alt={section.title}
                        className="rounded-lg w-full h-64 md:h-80 object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
                  {paragraphs.map((para, idx) => (
                    <p key={idx} className="text-gray-700 text-lg mb-4 last:mb-0 leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'text':
      default:
        return (
          <section key={section._id} className="relative py-16 overflow-hidden">
            {/* Alternating Background with Graphics */}
            <div className={`absolute inset-0 ${
              section._id ? 'bg-gradient-to-br from-white via-gray-50/50 to-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
            }`}>
              {/* Decorative Side Graphics */}
              <div className="absolute left-0 top-0 w-96 h-full opacity-5">
                <div className="absolute top-1/4 left-20 w-48 h-48 bg-primary rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/3 left-10 w-32 h-32 bg-secondary rounded-full blur-2xl"></div>
              </div>
              <div className="absolute right-0 top-0 w-96 h-full opacity-5">
                <div className="absolute top-1/3 right-20 w-56 h-56 bg-secondary rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-primary rounded-full blur-2xl"></div>
              </div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`${section.image?.url ? 'grid grid-cols-1 md:grid-cols-2 gap-12 items-center' : ''}`}>
                {section.image?.url && (
                  <div className="order-2 md:order-1 relative z-10">
                    {/* Decorative Frame with Graphics */}
                    <div className="relative">
                      {/* Outer Glow */}
                      <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-2xl blur-2xl animate-pulse"></div>
                      {/* Middle Layer */}
                      <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl"></div>
                      {/* Inner Frame */}
                      <div className="relative bg-white p-3 rounded-xl shadow-2xl">
                        {/* Decorative Corner Elements */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary/20 rounded-full blur-sm"></div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary/20 rounded-full blur-sm"></div>
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-secondary/20 rounded-full blur-sm"></div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary/20 rounded-full blur-sm"></div>
                        
                        <img
                          src={section.image.url}
                          alt={section.title}
                          className="relative z-10 rounded-lg w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className={`${section.image?.url ? 'order-1 md:order-2' : ''} relative z-10`}>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
                  {paragraphs.map((para, idx) => (
                    <p key={idx} className="text-gray-700 text-lg mb-6 last:mb-0 leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-gray-600">Content coming soon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pt-20">
      {sections.map(section => renderSection(section))}
    </div>
  );
}
