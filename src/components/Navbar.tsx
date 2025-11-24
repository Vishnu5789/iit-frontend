import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, ShoppingCartIcon, ShoppingBagIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import apiService from '../services/api'

const Navbar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        // Check authentication status on component mount
        setIsAuthenticated(apiService.isAuthenticated())
        
        // Listen for auth state changes
        const handleAuthChange = () => {
            setIsAuthenticated(apiService.isAuthenticated())
        }
        
        window.addEventListener('authStateChanged', handleAuthChange)
        
        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange)
        }
    }, [])

    const user = apiService.getUser()
    const isAdmin = user && user.role === 'admin'

    const navLinks = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "About",
            link: "/about",
        },
        {
            name: "Courses",
            link: "/courses",
        },
        {
            name: "Blog",
            link: "/blog",
        },
        {
            name: "Industry",
            link: "/industry",
        },
        {
            name: "Contact",
            link: "/contact",
        },
        ...(isAdmin ? [{
            name: "Admin",
            link: "/admin",
        }] : [])
    ]

    const handleNavClick = (link: string) => {
        navigate(link)
        setIsMobileMenuOpen(false)
    }

    const handleLoginClick = () => {
        navigate('/login')
    }

    const handleSignUpClick = () => {
        navigate('/signup')
    }

    const handleLogout = async () => {
        try {
            await apiService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Clear local storage regardless of API call result
            apiService.clearAuth()
            setIsAuthenticated(false)
            
            // Dispatch auth state change event
            window.dispatchEvent(new Event('authStateChanged'))
            
            navigate('/login')
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark shadow-lg border-b border-dark-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/assets/icon.svg" alt="Isaac Institute of Technology" className="h-14 md:h-24 lg:h-28 w-auto invert" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.link)}
                                className={`text-sm font-medium transition-all duration-200 py-1 cursor-pointer ${
                                    location.pathname === link.link
                                        ? 'text-light'
                                        : 'text-light/70 hover:text-light'
                                }`}
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isAuthenticated && (
                            <>
                                <button
                                    onClick={() => navigate('/my-courses')}
                                    className="p-2 text-light/70 hover:text-light transition-colors cursor-pointer"
                                    title="My Courses"
                                >
                                    <AcademicCapIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="p-2 text-light/70 hover:text-light transition-colors relative cursor-pointer"
                                    title="Shopping Cart"
                                >
                                    <ShoppingCartIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => navigate('/my-orders')}
                                    className="p-2 text-light/70 hover:text-light transition-colors cursor-pointer"
                                    title="My Orders"
                                >
                                    <ShoppingBagIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 border border-light/20 hover:bg-light/10 duration-200 text-light
                                px-4 py-2 rounded cursor-pointer text-sm font-medium"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="border border-light/30 hover:bg-light/10 duration-200 text-light
                                    px-4 py-2 rounded cursor-pointer text-sm font-medium"
                                >
                                    Log in
                                </button>
                                <button
                                    onClick={handleSignUpClick}
                                    className="bg-primary text-white hover:bg-primary-dark duration-200
                                    px-4 py-2 rounded cursor-pointer text-sm font-medium shadow-lg"
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-light p-2 cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-light/10 py-4 bg-dark-alt">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.link)}
                                    className={`text-left px-4 py-3 text-sm font-medium transition-colors duration-200 rounded cursor-pointer ${
                                        location.pathname === link.link
                                            ? 'bg-primary text-white'
                                            : 'text-light/80 hover:bg-light/5 hover:text-light'
                                    }`}
                                >
                                    {link.name}
                                </button>
                            ))}
                            
                            {/* Mobile Auth Buttons */}
                            <div className="flex flex-col gap-2 mt-4 px-4">
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={() => handleNavClick('/my-courses')}
                                            className="flex items-center justify-center gap-2 border border-light/30 hover:bg-light/10 duration-200 text-light
                                            px-4 py-2 rounded cursor-pointer text-sm font-medium"
                                        >
                                            <AcademicCapIcon className="h-4 w-4" />
                                            My Courses
                                        </button>
                                        <button
                                            onClick={() => handleNavClick('/cart')}
                                            className="flex items-center justify-center gap-2 border border-light/30 hover:bg-light/10 duration-200 text-light
                                            px-4 py-2 rounded cursor-pointer text-sm font-medium"
                                        >
                                            <ShoppingCartIcon className="h-4 w-4" />
                                            Cart
                                        </button>
                                        <button
                                            onClick={() => handleNavClick('/my-orders')}
                                            className="flex items-center justify-center gap-2 border border-light/30 hover:bg-light/10 duration-200 text-light
                                            px-4 py-2 rounded cursor-pointer text-sm font-medium"
                                        >
                                            <ShoppingBagIcon className="h-4 w-4" />
                                            My Orders
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center justify-center gap-2 border border-light/20 hover:bg-light/10 duration-200 text-light
                                            px-4 py-2 rounded cursor-pointer text-sm font-medium"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleLoginClick}
                                            className="border border-light/30 hover:bg-light/10 duration-200 text-light
                                            px-4 py-2 rounded cursor-pointer text-sm font-medium"
                                        >
                                            Log in
                                        </button>
                                        <button
                                            onClick={handleSignUpClick}
                                            className="bg-primary text-white hover:bg-primary-dark duration-200
                                            px-4 py-2 rounded cursor-pointer text-sm font-medium shadow-lg"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
