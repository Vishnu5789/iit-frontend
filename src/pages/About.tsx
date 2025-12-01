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
          <div key={section._id} className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {section.image?.url && (
                <div className="flex justify-center mb-8">
                  <img
                    src={section.image.url}
                    alt={section.title}
                    className="rounded-xl shadow-2xl max-w-2xl w-full h-auto object-cover"
                  />
                </div>
              )}
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-6">{section.title}</h1>
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-2xl mb-4 last:mb-0">{para}</p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <section key={section._id} className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`${section.image?.url ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-start' : ''}`}>
                <div>
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
                  <div>
                    <img
                      src={section.image.url}
                      alt={section.title}
                      className="rounded-xl shadow-lg w-full h-auto object-cover sticky top-28"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'card':
        return (
          <section key={section._id} className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow-md p-8">
                {section.image?.url && (
                  <div className="mb-6">
                    <img
                      src={section.image.url}
                      alt={section.title}
                      className="rounded-lg w-full h-64 object-cover"
                    />
                  </div>
                )}
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{section.title}</h2>
                {paragraphs.map((para, idx) => (
                  <p key={idx} className="text-gray-700 text-lg mb-4 last:mb-0 leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          </section>
        );

      case 'text':
      default:
        return (
          <section key={section._id} className="py-12 bg-white odd:bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`${section.image?.url ? 'grid grid-cols-1 md:grid-cols-2 gap-8 items-center' : ''}`}>
                {section.image?.url && (
                  <div className="order-2 md:order-1">
                    <img
                      src={section.image.url}
                      alt={section.title}
                      className="rounded-xl shadow-lg w-full h-auto object-cover"
                    />
                  </div>
                )}
                <div className={section.image?.url ? 'order-1 md:order-2' : ''}>
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {sections.map(section => renderSection(section))}
    </div>
  );
}
