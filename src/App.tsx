import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ContactWidget from './components/ContactWidget'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Blog from './pages/Blog'
import Industry from './pages/Industry'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import MyOrders from './pages/MyOrders'
import MyCourses from './pages/MyCourses'
import CoursePlayer from './pages/CoursePlayer'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCourses from './pages/admin/ManageCourses'
import ManageBlogs from './pages/admin/ManageBlogs'
import ManageIndustries from './pages/admin/ManageIndustries'
import ManageHomepage from './pages/admin/ManageHomepage'
import ManageUsers from './pages/admin/ManageUsers'
import ManageContact from './pages/admin/ManageContact'
import ManageContactMessages from './pages/admin/ManageContactMessages'
import ManageAbout from './pages/admin/ManageAbout'
import ManageIndustryPage from './pages/admin/ManageIndustryPage'
import ManageContactWidget from './pages/admin/ManageContactWidget'
import ManageInstructors from './pages/admin/ManageInstructors'
import ManageHeroSlides from './pages/admin/ManageHeroSlides'
import ManageCourseQuizzes from './pages/admin/ManageCourseQuizzes'
import QuizTake from './pages/QuizTake'
import QuizResults from './pages/QuizResults'
import AuthCallback from './pages/AuthCallback'
import BlogDetail from './pages/BlogDetail'
import IndustryDetail from './pages/IndustryDetail'

const App = () => {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen">
        <Navbar />
        <ContactWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/industry" element={<Industry />} />
          <Route path="/industry/:id" element={<IndustryDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/course-player/:courseId" element={<CoursePlayer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/blogs" element={<ManageBlogs />} />
          <Route path="/admin/industries" element={<ManageIndustries />} />
          <Route path="/admin/homepage" element={<ManageHomepage />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/contact" element={<ManageContact />} />
          <Route path="/admin/contact-messages" element={<ManageContactMessages />} />
          <Route path="/admin/about" element={<ManageAbout />} />
          <Route path="/admin/industry-page" element={<ManageIndustryPage />} />
          <Route path="/admin/contact-widget" element={<ManageContactWidget />} />
          <Route path="/admin/instructors" element={<ManageInstructors />} />
          <Route path="/admin/hero-slides" element={<ManageHeroSlides />} />
          <Route path="/admin/courses/:courseId/quizzes" element={<ManageCourseQuizzes />} />
          <Route path="/quiz/:quizId" element={<QuizTake />} />
          <Route path="/quiz/:quizId/results" element={<QuizResults />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
