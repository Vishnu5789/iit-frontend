import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    // Check if there's a success message from navigation state
    if (location.state && (location.state as any).message) {
      setSuccessMessage((location.state as any).message)
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [location])

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setErrors({})
    
    try {
      const response = await apiService.login(formData)
      
      if (response.success && response.data) {
        // Save token and user data
        apiService.saveToken(response.data.token)
        apiService.saveUser(response.data.user)
        
        // Dispatch custom event to notify navbar of auth state change
        window.dispatchEvent(new Event('authStateChanged'))
        
        // Navigate to home after successful login
        navigate('/')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      if (error.errors && Array.isArray(error.errors)) {
        // Handle validation errors from backend
        const newErrors: any = {}
        error.errors.forEach((err: any) => {
          newErrors[err.field] = err.message
        })
        setErrors(newErrors)
      } else {
        // Handle general error
        setErrors({
          general: error.message || 'Login failed. Please check your credentials and try again.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      })
    }
  }

  return (
    <div className="pt-28 md:pt-32 lg:pt-36 px-4 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-primary/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-sm text-dark/60">Sign in to continue your learning journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {successMessage}
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-dark/40" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-primary/20'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-dark/40" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-primary/20'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-dark/40 hover:text-dark/60 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-dark/40 hover:text-dark/60 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-primary/20 rounded text-primary focus:ring-primary/50 focus:ring-2"
                />
                <span className="ml-2 text-sm text-dark/60">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-primary text-light py-3 rounded-lg font-semibold 
                ${isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-primary/90 transform hover:scale-[1.02]'
                } transition-all duration-300 text-sm`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-light" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-dark/60">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2.5 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-dark/80">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2.5 border border-primary/20 rounded-lg hover:bg-primary/5 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-sm font-medium text-dark/80">GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-dark/60">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-primary hover:text-primary/80 transition-colors font-semibold"
              >
                Sign up for free
              </button>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-xs text-dark/50">
          By continuing, you agree to Isaac Institute of Technology's{' '}
          <button className="text-primary hover:underline">Terms of Service</button>
          {' '}and{' '}
          <button className="text-primary hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  )
}

export default Login

