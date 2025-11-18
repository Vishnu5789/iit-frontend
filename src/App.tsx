import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Blog from './pages/Blog'
import Industry from './pages/Industry'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import MyOrders from './pages/MyOrders'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageCourses from './pages/admin/ManageCourses'
import ManageBlogs from './pages/admin/ManageBlogs'
import ManageIndustries from './pages/admin/ManageIndustries'

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/industry" element={<Industry />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/blogs" element={<ManageBlogs />} />
          <Route path="/admin/industries" element={<ManageIndustries />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
