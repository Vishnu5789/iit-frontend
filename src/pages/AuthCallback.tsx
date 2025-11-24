import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiService from '../services/api'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage(error === 'google_auth_failed' ? 'Google authentication failed' : 'Authentication failed')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr))
        
        // Save token and user data
        apiService.saveToken(token)
        apiService.saveUser(user)
        
        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(new Event('authStateChanged'))
        
        setStatus('success')
        setMessage('Login successful! Redirecting...')
        
        // Navigate to home after a brief delay
        setTimeout(() => navigate('/'), 1500)
      } catch (error) {
        console.error('Error parsing auth data:', error)
        setStatus('error')
        setMessage('Failed to process authentication data')
        setTimeout(() => navigate('/login'), 3000)
      }
    } else {
      setStatus('error')
      setMessage('Invalid authentication response')
      setTimeout(() => navigate('/login'), 3000)
    }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-dark">Completing authentication...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg text-green-600 font-semibold">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg text-red-600 font-semibold">{message}</p>
            <p className="text-sm text-gray-600 mt-2">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  )
}

