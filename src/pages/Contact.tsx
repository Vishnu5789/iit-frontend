import { useEffect, useState } from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import apiService from '../services/api'

export default function Contact() {
  const [config, setConfig] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await apiService.getContactConfig()
      if (response.success) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Error fetching contact config:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiService.submitContactForm(formData)
      
      if (response.success) {
        setMessage({ type: 'success', text: response.message || 'Message sent successfully!' })
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
        setTimeout(() => setMessage(null), 5000)
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to send message' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send message' })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-16 md:pt-20 px-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
            {config?.pageContent?.heading || 'Get in Touch'}
          </h1>
          <p className="text-lg text-medium max-w-3xl mx-auto">
            {config?.pageContent?.subheading || "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Email</h3>
                  <a href={`mailto:${config?.email || 'info@isaactech.com'}`} className="text-primary hover:underline">
                    {config?.email || 'info@isaactech.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <PhoneIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Phone</h3>
                  <a href={`tel:${config?.phone || '+1 (555) 123-4567'}`} className="text-primary hover:underline">
                    {config?.phone || '+1 (555) 123-4567'}
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPinIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Address</h3>
                  <p className="text-medium text-sm">
                    {config?.address?.street || '123 Engineering Lane'}<br />
                    {config?.address?.city || 'Tech City'}, {config?.address?.state || 'CA'} {config?.address?.zipCode || '90001'}<br />
                    {config?.address?.country || 'USA'}
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Office Hours</h3>
                  <p className="text-medium text-sm mb-1">
                    {config?.officeHours?.weekdays || 'Monday - Friday: 9:00 AM - 6:00 PM'}
                  </p>
                  <p className="text-medium text-sm">
                    {config?.officeHours?.weekend || 'Saturday - Sunday: Closed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {(config?.socialMedia?.facebook || config?.socialMedia?.twitter || config?.socialMedia?.linkedin || config?.socialMedia?.instagram) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-dark mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {config?.socialMedia?.facebook && (
                    <a href={config.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                      <span className="text-lg">f</span>
                    </a>
                  )}
                  {config?.socialMedia?.twitter && (
                    <a href={config.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition">
                      <span className="text-lg">𝕏</span>
                    </a>
                  )}
                  {config?.socialMedia?.linkedin && (
                    <a href={config.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition">
                      <span className="text-lg">in</span>
                    </a>
                  )}
                  {config?.socialMedia?.instagram && (
                    <a href={config.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition">
                      <span className="text-lg">📷</span>
                    </a>
                  )}
                  {config?.socialMedia?.youtube && (
                    <a href={config.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition">
                      <span className="text-lg">▶</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-dark mb-6">Send us a Message</h2>
              
              {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-dark mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-dark mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-dark mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map */}
        {config?.mapUrl && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <iframe
              src={config.mapUrl}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  )
}
