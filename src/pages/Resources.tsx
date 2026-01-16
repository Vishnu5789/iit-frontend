import { useEffect, useState } from 'react';
import {
  BookOpenIcon,
  DocumentTextIcon,
  PhotoIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  LockClosedIcon,
  CheckCircleIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
    name: string;
  };
  thumbnail?: {
    url: string;
  };
  downloadCount: number;
  viewCount: number;
  tags: string[];
  featured: boolean;
}

const sections = [
  {
    id: 'Course Materials',
    name: 'Course Materials & E-Library',
    icon: BookOpenIcon,
    color: 'blue',
    categories: ['E-Books & Textbooks', 'Lecture Notes']
  },
  {
    id: 'Visual Learning Aids',
    name: 'Visual Learning Aids',
    icon: PhotoIcon,
    color: 'purple',
    categories: ['Mindmaps & Flowcharts', 'Infographics', 'Diagrams & Images']
  },
  {
    id: 'Study Guides',
    name: 'Study Guides',
    icon: DocumentTextIcon,
    color: 'green',
    categories: ['Interview Preparation', 'Formula Handbooks', 'Question Banks']
  },
  {
    id: 'Skill Development',
    name: 'Skill Development',
    icon: AcademicCapIcon,
    color: 'orange',
    categories: []
  },
  {
    id: 'Career Resources',
    name: 'Career Resources',
    icon: BriefcaseIcon,
    color: 'red',
    categories: []
  },
  {
    id: 'Company Profiles',
    name: 'Company Profile Infographics',
    icon: BuildingOfficeIcon,
    color: 'indigo',
    categories: []
  }
];

export default function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedSection, selectedType, searchQuery]);

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
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (selectedSection !== 'all') {
      filtered = filtered.filter(r => r.section === selectedSection);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort: featured first, then by date
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    setFilteredResources(filtered);
  };

  const handleDownload = async (resourceId: string) => {
    const user = apiService.getUser();
    if (!user) {
      toast.error('Please login to download resources');
      navigate('/login');
      return;
    }

    try {
      const response = await apiService.downloadResource(resourceId);
      if (response.success && response.data.url) {
        window.open(response.data.url, '_blank');
        toast.success('Resource accessed successfully');
        fetchResources(); // Refresh to update download count
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to access resource';
      toast.error(message);
    }
  };

  const getSectionColor = (section: string) => {
    const sectionData = sections.find(s => s.id === section);
    return sectionData?.color || 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Resources</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Access comprehensive study materials, guides, and tools to enhance your learning journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {/* Filters */}
          <div className={`flex flex-col md:flex-row gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Sections</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {filteredResources.length} resources found
              </span>
            </div>
          </div>
        </div>

        {/* Section Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sections.map((section) => {
            const Icon = section.icon;
            const count = resources.filter(r => r.section === section.id).length;
            
            return (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all hover:shadow-xl border-2 ${
                  selectedSection === section.id
                    ? `border-${section.color}-500`
                    : 'border-transparent'
                }`}
              >
                <div className={`w-12 h-12 bg-${section.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 text-${section.color}-600`} />
                </div>
                <h3 className="font-bold text-lg text-dark mb-2">{section.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {section.categories.length > 0
                    ? section.categories.join(', ')
                    : 'Various resources available'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{count}</span>
                  <span className="text-sm text-gray-500">resources</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Thumbnail */}
                {resource.thumbnail?.url ? (
                  <img
                    src={resource.thumbnail.url}
                    alt={resource.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className={`w-full h-48 bg-gradient-to-br from-${getSectionColor(resource.section)}-100 to-${getSectionColor(resource.section)}-200 flex items-center justify-center`}>
                    <DocumentTextIcon className={`h-16 w-16 text-${getSectionColor(resource.section)}-400`} />
                  </div>
                )}

                <div className="p-6">
                  {/* Type Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      resource.type === 'free'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {resource.type === 'free' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          FREE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <LockClosedIcon className="h-4 w-4" />
                          ₹{resource.price}
                        </span>
                      )}
                    </span>
                    {resource.featured && (
                      <span className="px-2 py-1 bg-primary text-white rounded text-xs font-bold">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Category & File Type */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">{resource.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-medium text-primary">{resource.fileType}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg text-dark mb-2 line-clamp-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{resource.downloadCount} downloads</span>
                    <span>{resource.viewCount} views</span>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(resource._id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    {resource.type === 'free' ? 'Download Free' : 'Access Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
