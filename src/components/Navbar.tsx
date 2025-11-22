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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-24 md:h-28">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/assets/icon.svg" alt="logo" className="h-20 md:h-24 w-auto" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => handleNavClick(link.link)}
                                className={`text-sm font-semibold transition-colors duration-300 ${
                                    location.pathname === link.link
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-dark/70 hover:text-primary'
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
                                    className="p-2 text-dark/70 hover:text-primary transition-colors"
                                    title="My Courses"
                                >
                                    <AcademicCapIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="p-2 text-dark/70 hover:text-primary transition-colors relative"
                                    title="Shopping Cart"
                                >
                                    <ShoppingCartIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => navigate('/my-orders')}
                                    className="p-2 text-dark/70 hover:text-primary transition-colors"
                                    title="My Orders"
                                >
                                    <ShoppingBagIcon className="h-6 w-6" />
                                </button>
                            </>
                        )}
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 border border-red-500 hover:bg-red-500 duration-300 text-red-500
                                hover:text-white px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                            >
                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                Logout
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="border border-primary hover:bg-primary duration-300 text-primary
                                    hover:text-light px-5 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={handleSignUpClick}
                                    className="bg-primary text-light hover:bg-primary/90 duration-300
                                    px-5 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-primary p-2"
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
                    <div className="lg:hidden border-t border-primary/10 py-4">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.link)}
                                    className={`text-left px-4 py-3 text-sm font-semibold transition-colors duration-300 rounded-md ${
                                        location.pathname === link.link
                                            ? 'bg-primary text-white'
                                            : 'text-dark/70 hover:bg-primary/10 hover:text-primary'
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
                                            className="flex items-center justify-center gap-2 border border-primary hover:bg-primary duration-300 text-primary
                                            hover:text-white px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                        >
                                            <AcademicCapIcon className="h-4 w-4" />
                                            My Courses
                                        </button>
                                        <button
                                            onClick={() => handleNavClick('/cart')}
                                            className="flex items-center justify-center gap-2 border border-primary hover:bg-primary duration-300 text-primary
                                            hover:text-white px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                        >
                                            <ShoppingCartIcon className="h-4 w-4" />
                                            Cart
                                        </button>
                                        <button
                                            onClick={() => handleNavClick('/my-orders')}
                                            className="flex items-center justify-center gap-2 border border-primary hover:bg-primary duration-300 text-primary
                                            hover:text-white px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                        >
                                            <ShoppingBagIcon className="h-4 w-4" />
                                            My Orders
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center justify-center gap-2 border border-red-500 hover:bg-red-500 duration-300 text-red-500
                                            hover:text-white px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                        >
                                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleLoginClick}
                                            className="border border-primary hover:bg-primary duration-300 text-primary
                                            hover:text-light px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={handleSignUpClick}
                                            className="bg-primary text-light hover:bg-primary/90 duration-300
                                            px-4 py-2 rounded-md cursor-pointer text-sm font-semibold"
                                        >
                                            Sign Up
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
