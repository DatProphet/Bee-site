import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Menu, X, Plus, Minus, Trash2, User, LogOut } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { CustomerRegister, CustomerLogin, CustomerAccount } from './CustomerPages';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
function Navigation({ cartCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    const customerToken = localStorage.getItem('customer_token');
    const customerData = localStorage.getItem('customer');
    
    setIsAdmin(!!adminToken);
    setIsCustomer(!!customerToken);
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    }
  }, []);

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('admin_token');
      setIsAdmin(false);
      navigate('/');
      toast.success('Admin logged out successfully');
    } else if (isCustomer) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer');
      setIsCustomer(false);
      setCustomer(null);
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-golden-500/20">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="honeycomb-icon"></div>
            <span className="brand-name">Golden Hive Apiary</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="nav-link" data-testid="nav-products">Products</Link>
            <Link to="/services" className="nav-link" data-testid="nav-services">Services</Link>
            <Link to="/blog" className="nav-link" data-testid="nav-blog">Blog</Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link" data-testid="nav-admin">Admin</Link>
            )}
            <Link to="/cart" className="relative" data-testid="nav-cart">
              <ShoppingCart className="w-6 h-6 text-golden-400 hover:text-golden-300 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-golden-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
            {isCustomer ? (
              <>
                <Link to="/account" className="nav-link" data-testid="nav-account">
                  {customer?.name || 'My Account'}
                </Link>
                <button onClick={handleLogout} className="nav-link" data-testid="customer-logout-btn">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : isAdmin ? (
              <button onClick={handleLogout} className="nav-link" data-testid="logout-btn">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link to="/customer/login" className="nav-link" data-testid="nav-login">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-golden-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3" data-testid="mobile-menu">
            <Link to="/products" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Products</Link>
            <Link to="/services" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link to="/blog" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            {isAdmin && <Link to="/admin" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
            {isCustomer && <Link to="/account" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>My Account</Link>}
            <Link to="/cart" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Cart ({cartCount})</Link>
            {isCustomer || isAdmin ? (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block nav-link">Logout</button>
            ) : (
              <Link to="/customer/login" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// Home Page
function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="hero-title" data-testid="hero-title">
            Pure Honey, Sustainable Beekeeping
          </h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Discover our artisanal honey, beeswax products, and professional beekeeping services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/products" className="btn-primary" data-testid="shop-products-btn">
              Shop Products
            </Link>
            <Link to="/services" className="btn-secondary" data-testid="explore-services-btn">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-900">
        <div className="container-custom">
          <h2 className="section-title" data-testid="why-choose-title">Why Choose Golden Hive</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="feature-card" data-testid="feature-sustainable">
              <div className="feature-icon">🌿</div>
              <h3 className="text-xl font-semibold text-golden-400 mb-3">Sustainable Practices</h3>
              <p className="text-gray-300">We prioritize bee health and environmental sustainability in all our operations.</p>
            </div>
            <div className="feature-card" data-testid="feature-quality">
              <div className="feature-icon">✨</div>
              <h3 className="text-xl font-semibold text-golden-400 mb-3">Premium Quality</h3>
              <p className="text-gray-300">Our honey is raw, unfiltered, and free from additives or processing.</p>
            </div>
            <div className="feature-card" data-testid="feature-local">
              <div className="feature-icon">🏡</div>
              <h3 className="text-xl font-semibold text-golden-400 mb-3">Local & Fresh</h3>
              <p className="text-gray-300">All products are harvested and produced locally with care and expertise.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Products Page
function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      const url = filter === 'all' ? `${API}/products` : `${API}/products?category=${filter}`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id && item.type === 'product');
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, type: 'product', quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const categories = ['all', 'honey', 'wax', 'candles', 'queens', 'nucs'];

  return (
    <div className="page-container">
      <div className="container-custom">
        <h1 className="page-title" data-testid="products-page-title">Our Products</h1>
        <p className="page-subtitle" data-testid="products-page-subtitle">
          Browse our selection of premium honey, beeswax, and beekeeping supplies
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12" data-testid="category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === cat
                  ? 'bg-golden-500 text-black'
                  : 'bg-dark-800 text-golden-400 hover:bg-dark-700 border border-golden-500/30'
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20" data-testid="products-loading">
            <div className="inline-block w-8 h-8 border-4 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card" data-testid={`product-${product.id}`}>
                <div className="product-image" onClick={() => navigate(`/products/${product.id}`)}>
                  <img src={product.image_url} alt={product.name} />
                </div>
                <div className="p-6">
                  <div className="text-xs text-golden-400 mb-2 uppercase tracking-wider">{product.category}</div>
                  <h3 className="text-xl font-semibold text-white mb-2" data-testid={`product-name-${product.id}`}>{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-golden-400" data-testid={`product-price-${product.id}`}>${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn-primary-sm"
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Detail Page
function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id && item.type === 'product');
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, type: 'product', quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${product.name} added to cart`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container-custom">
        <button onClick={() => navigate('/products')} className="text-golden-400 hover:text-golden-300 mb-8" data-testid="back-to-products">
          ← Back to Products
        </button>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="product-detail-image" data-testid="product-detail-image">
            <img src={product.image_url} alt={product.name} />
          </div>
          <div>
            <div className="text-sm text-golden-400 mb-2 uppercase tracking-wider">{product.category}</div>
            <h1 className="text-4xl font-bold text-white mb-4" data-testid="product-detail-name">{product.name}</h1>
            <p className="text-3xl font-bold text-golden-400 mb-6" data-testid="product-detail-price">${product.price}</p>
            <p className="text-gray-300 mb-6 leading-relaxed" data-testid="product-detail-description">{product.description}</p>
            <div className="mb-6">
              <span className="text-gray-400">Stock: </span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`} data-testid="product-detail-stock">
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </span>
            </div>
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="product-detail-add-to-cart"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Services Page
function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (service) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === service.id && item.type === 'service');
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...service, type: 'service', quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success(`${service.name} added to cart`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="page-container">
      <div className="container-custom">
        <h1 className="page-title" data-testid="services-page-title">Our Services</h1>
        <p className="page-subtitle" data-testid="services-page-subtitle">
          Professional beekeeping assistance and pollination services
        </p>

        {loading ? (
          <div className="text-center py-20" data-testid="services-loading">
            <div className="inline-block w-8 h-8 border-4 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card" data-testid={`service-${service.id}`}>
                <div className="service-image">
                  <img src={service.image_url} alt={service.name} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-white mb-3" data-testid={`service-name-${service.id}`}>{service.name}</h3>
                  <p className="text-gray-300 mb-4" data-testid={`service-description-${service.id}`}>{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-golden-400" data-testid={`service-price-${service.id}`}>${service.price}</span>
                    <button
                      onClick={() => addToCart(service)}
                      className="btn-primary-sm"
                      data-testid={`add-service-to-cart-${service.id}`}
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Blog Page
function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container-custom">
        <h1 className="page-title" data-testid="blog-page-title">Beekeeping Blog</h1>
        <p className="page-subtitle" data-testid="blog-page-subtitle">
          Tips, guides, and insights from our experienced beekeepers
        </p>

        {loading ? (
          <div className="text-center py-20" data-testid="blog-loading">
            <div className="inline-block w-8 h-8 border-4 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blog-grid">
            {posts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/blog/${post.id}`)}
                className="blog-card"
                data-testid={`blog-post-${post.id}`}
              >
                <div className="blog-image">
                  <img src={post.image_url} alt={post.title} />
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="text-xs bg-golden-500/20 text-golden-400 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2" data-testid={`blog-title-${post.id}`}>{post.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">By {post.author}</p>
                  <p className="text-gray-300 line-clamp-3">{post.content.substring(0, 150)}...</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Blog Detail Page
function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/blog/${id}`);
      setPost(response.data);
    } catch (error) {
      toast.error('Failed to load blog post');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-golden-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container-custom max-w-4xl">
        <button onClick={() => navigate('/blog')} className="text-golden-400 hover:text-golden-300 mb-8" data-testid="back-to-blog">
          ← Back to Blog
        </button>
        <div className="blog-detail-image mb-8" data-testid="blog-detail-image">
          <img src={post.image_url} alt={post.title} />
        </div>
        <div className="flex gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-sm bg-golden-500/20 text-golden-400 px-3 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold text-white mb-4" data-testid="blog-detail-title">{post.title}</h1>
        <p className="text-gray-400 mb-8">By {post.author} • {new Date(post.created_at).toLocaleDateString()}</p>
        <div className="prose prose-invert prose-golden max-w-none" data-testid="blog-detail-content">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-gray-300 mb-4 leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cart Page
function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCart(newCart);
    toast.success('Item removed from cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page-container">
      <div className="container-custom max-w-4xl">
        <h1 className="page-title" data-testid="cart-page-title">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-cart">
            <p className="text-gray-400 mb-6">Your cart is empty</p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-8" data-testid="cart-items">
              {cart.map((item, index) => (
                <div key={index} className="cart-item" data-testid={`cart-item-${index}`}>
                  <img src={item.image_url} alt={item.name} className="cart-item-image" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white" data-testid={`cart-item-name-${index}`}>{item.name}</h3>
                    <p className="text-sm text-gray-400">{item.type === 'product' ? 'Product' : 'Service'}</p>
                    <p className="text-golden-400 font-semibold" data-testid={`cart-item-price-${index}`}>${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(index, -1)}
                      className="quantity-btn"
                      data-testid={`decrease-quantity-${index}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-semibold w-8 text-center" data-testid={`cart-item-quantity-${index}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(index, 1)}
                      className="quantity-btn"
                      data-testid={`increase-quantity-${index}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-300 ml-4"
                      data-testid={`remove-item-${index}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl text-gray-300">Total:</span>
                <span className="text-3xl font-bold text-golden-400" data-testid="cart-total">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full"
                data-testid="proceed-to-checkout"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Checkout Page
function Checkout() {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartData.length === 0) {
      navigate('/cart');
    }
    setCart(cartData);
    
    // Check if customer is logged in and auto-fill
    const customerToken = localStorage.getItem('customer_token');
    if (customerToken) {
      fetchCustomerProfile(customerToken);
    }
  }, [navigate]);

  const fetchCustomerProfile = async (token) => {
    try {
      const response = await axios.get(`${API}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomer(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone
      });
    } catch (error) {
      console.error('Failed to load customer profile');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const orderData = {
        customer_id: customer?.id || null, // null for guest checkout
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          price: item.price,
          quantity: item.quantity
        })),
        total: total
      };

      const orderResponse = await axios.post(`${API}/orders`, orderData);
      const orderId = orderResponse.data.id;

      // Create PayPal order
      const paypalResponse = await axios.post(`${API}/paypal/create-order`, {
        order_id: orderId
      });

      // In a real implementation, you would redirect to PayPal here
      // For now, we'll simulate a successful payment
      toast.success('Order placed successfully! (PayPal integration in sandbox mode)');
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      if (customer) {
        navigate('/account');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container-custom max-w-2xl">
        <h1 className="page-title" data-testid="checkout-page-title">Checkout</h1>

        {!customer && (
          <div className="bg-golden-500/10 border border-golden-500/30 rounded-lg p-4 mb-6">
            <p className="text-golden-400 mb-2">Have an account?</p>
            <Link to="/customer/login" className="text-golden-300 hover:text-golden-200 underline">
              Login to auto-fill your information and track orders
            </Link>
          </div>
        )}

        {customer && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400">
              ✓ Logged in as {customer.name} - Order will be saved to your account
            </p>
          </div>
        )}

        <div className="bg-dark-800 rounded-lg p-6 border border-golden-500/20 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between text-gray-300" data-testid={`checkout-item-${index}`}>
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-golden-500/20 pt-4 flex justify-between items-center">
            <span className="text-xl text-white">Total:</span>
            <span className="text-2xl font-bold text-golden-400" data-testid="checkout-total">${total.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
          <div>
            <label className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              data-testid="checkout-name-input"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              data-testid="checkout-email-input"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              data-testid="checkout-phone-input"
            />
          </div>
          <div className="bg-golden-500/10 border border-golden-500/30 rounded-lg p-4">
            <p className="text-sm text-golden-400">Payment will be processed through PayPal (currently in sandbox/test mode)</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="place-order-btn"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Admin Login
function AdminLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const response = await axios.post(`${API}/admin/${endpoint}`, formData);
      localStorage.setItem('admin_token', response.data.token);
      toast.success(`${isRegister ? 'Registered' : 'Logged in'} successfully`);
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container-custom max-w-md">
        <h1 className="page-title" data-testid="admin-login-title">{isRegister ? 'Admin Registration' : 'Admin Login'}</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-dark-800 p-8 rounded-lg border border-golden-500/20" data-testid="admin-login-form">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              data-testid="admin-email-input"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              data-testid="admin-password-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
            data-testid="admin-submit-btn"
          >
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-golden-400 hover:text-golden-300 text-sm w-full text-center"
            data-testid="admin-toggle-mode"
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('blog'); // blog, products, services, customers
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    image_url: '',
    tags: '',
    name: '',
    description: '',
    price: '',
    category: 'honey',
    stock: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate, activeTab]);

  const fetchData = () => {
    if (activeTab === 'blog') fetchPosts();
    else if (activeTab === 'products') fetchProducts();
    else if (activeTab === 'services') fetchServices();
    else if (activeTab === 'customers') fetchCustomers();
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/admin/customers/${customerId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setSelectedCustomer(customerId);
    } catch (error) {
      toast.error('Failed to load customer orders');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    try {
      if (activeTab === 'blog') {
        const postData = {
          title: formData.title,
          content: formData.content,
          author: formData.author,
          image_url: formData.image_url,
          tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
        };

        if (editingItem) {
          await axios.put(`${API}/blog/${editingItem.id}`, postData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Post updated successfully');
        } else {
          await axios.post(`${API}/blog`, postData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Post created successfully');
        }
      } else if (activeTab === 'products') {
        const productData = {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          stock: parseInt(formData.stock),
          image_url: formData.image_url
        };

        if (editingItem) {
          await axios.put(`${API}/products/${editingItem.id}`, productData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Product updated successfully');
        } else {
          await axios.post(`${API}/products`, productData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Product created successfully');
        }
      } else if (activeTab === 'services') {
        const serviceData = {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url
        };

        if (editingItem) {
          await axios.put(`${API}/services/${editingItem.id}`, serviceData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Service updated successfully');
        } else {
          await axios.post(`${API}/services`, serviceData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Service created successfully');
        }
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({ title: '', content: '', author: '', image_url: '', tags: '', name: '', description: '', price: '', category: 'honey', stock: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'blog') {
      setFormData({
        title: item.title,
        content: item.content,
        author: item.author,
        image_url: item.image_url,
        tags: item.tags.join(', ')
      });
    } else if (activeTab === 'products') {
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        description: item.description,
        stock: item.stock.toString(),
        image_url: item.image_url
      });
    } else if (activeTab === 'services') {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        image_url: item.image_url
      });
    }
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'blog' ? 'post' : activeTab === 'products' ? 'product' : 'service'}?`)) return;

    const token = localStorage.getItem('admin_token');
    try {
      let endpoint = '';
      if (activeTab === 'blog') endpoint = `${API}/blog/${itemId}`;
      else if (activeTab === 'products') endpoint = `${API}/products/${itemId}`;
      else if (activeTab === 'services') endpoint = `${API}/services/${itemId}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`${activeTab === 'blog' ? 'Post' : activeTab === 'products' ? 'Product' : 'Service'} deleted successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="page-container">
      <div className="container-custom max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="page-title" data-testid="admin-dashboard-title">Admin Dashboard</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingItem(null);
              setFormData({ title: '', content: '', author: '', image_url: '', tags: '', name: '', description: '', price: '', category: 'honey', stock: '' });
            }}
            className="btn-primary"
            data-testid="toggle-form"
          >
            {showForm ? 'Cancel' : `New ${activeTab === 'blog' ? 'Post' : activeTab === 'products' ? 'Product' : 'Service'}`}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-golden-500/20">
          <button
            onClick={() => { setActiveTab('blog'); setShowForm(false); }}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'blog' ? 'text-golden-400 border-b-2 border-golden-400' : 'text-gray-400 hover:text-golden-300'}`}
            data-testid="tab-blog"
          >
            Blog Posts
          </button>
          <button
            onClick={() => { setActiveTab('products'); setShowForm(false); }}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'products' ? 'text-golden-400 border-b-2 border-golden-400' : 'text-gray-400 hover:text-golden-300'}`}
            data-testid="tab-products"
          >
            Products
          </button>
          <button
            onClick={() => { setActiveTab('services'); setShowForm(false); }}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'services' ? 'text-golden-400 border-b-2 border-golden-400' : 'text-gray-400 hover:text-golden-300'}`}
            data-testid="tab-services"
          >
            Services
          </button>
          <button
            onClick={() => { setActiveTab('customers'); setShowForm(false); setSelectedCustomer(null); }}
            className={`px-6 py-3 font-semibold transition-all ${activeTab === 'customers' ? 'text-golden-400 border-b-2 border-golden-400' : 'text-gray-400 hover:text-golden-300'}`}
            data-testid="tab-customers"
          >
            Customers
          </button>
        </div>

        {/* Forms */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-dark-800 p-6 rounded-lg border border-golden-500/20 mb-8 space-y-4" data-testid="admin-form">
            {activeTab === 'blog' && (
              <>
                <div>
                  <label className="block text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    data-testid="blog-title-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Content</label>
                  <textarea
                    required
                    rows="10"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    data-testid="blog-content-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Author</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="input-field"
                    data-testid="blog-author-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    data-testid="blog-image-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="input-field"
                    placeholder="beginner, guide, tips"
                    data-testid="blog-tags-input"
                  />
                </div>
              </>
            )}

            {activeTab === 'products' && (
              <>
                <div>
                  <label className="block text-gray-300 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    data-testid="product-name-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    data-testid="product-category-input"
                  >
                    <option value="honey">Honey</option>
                    <option value="wax">Wax</option>
                    <option value="candles">Candles</option>
                    <option value="queens">Queens</option>
                    <option value="nucs">Nucs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input-field"
                    data-testid="product-stock-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    data-testid="product-description-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    data-testid="product-image-input"
                  />
                </div>
              </>
            )}

            {activeTab === 'services' && (
              <>
                <div>
                  <label className="block text-gray-300 mb-2">Service Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    data-testid="service-name-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    data-testid="service-price-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    data-testid="service-description-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    data-testid="service-image-input"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary" data-testid="submit-form">
              {editingItem ? `Update ${activeTab === 'blog' ? 'Post' : activeTab === 'products' ? 'Product' : 'Service'}` : `Create ${activeTab === 'blog' ? 'Post' : activeTab === 'products' ? 'Product' : 'Service'}`}
            </button>
          </form>
        )}

        {/* List Items */}
        <div className="space-y-4" data-testid="admin-items-list">
          {activeTab === 'blog' && posts.map(post => (
            <div key={post.id} className="bg-dark-800 p-6 rounded-lg border border-golden-500/20 flex justify-between items-start" data-testid={`admin-post-${post.id}`}>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                <p className="text-gray-400 text-sm mb-2">By {post.author}</p>
                <div className="flex gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-golden-500/20 text-golden-400 px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-golden-400 hover:text-golden-300 px-3 py-1 border border-golden-500/30 rounded"
                  data-testid={`edit-post-${post.id}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-400 hover:text-red-300 px-3 py-1 border border-red-500/30 rounded"
                  data-testid={`delete-post-${post.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'products' && products.map(product => (
            <div key={product.id} className="bg-dark-800 p-6 rounded-lg border border-golden-500/20 flex justify-between items-start" data-testid={`admin-product-${product.id}`}>
              <div className="flex gap-4 flex-1">
                <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{product.name}</h3>
                  <p className="text-xs text-golden-400 uppercase mb-2">{product.category}</p>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex gap-4">
                    <span className="text-golden-400 font-semibold">${product.price}</span>
                    <span className="text-gray-400">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-golden-400 hover:text-golden-300 px-3 py-1 border border-golden-500/30 rounded"
                  data-testid={`edit-product-${product.id}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-400 hover:text-red-300 px-3 py-1 border border-red-500/30 rounded"
                  data-testid={`delete-product-${product.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {activeTab === 'services' && services.map(service => (
            <div key={service.id} className="bg-dark-800 p-6 rounded-lg border border-golden-500/20 flex justify-between items-start" data-testid={`admin-service-${service.id}`}>
              <div className="flex gap-4 flex-1">
                <img src={service.image_url} alt={service.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{service.description}</p>
                  <span className="text-golden-400 font-semibold">${service.price}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-golden-400 hover:text-golden-300 px-3 py-1 border border-golden-500/30 rounded"
                  data-testid={`edit-service-${service.id}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-400 hover:text-red-300 px-3 py-1 border border-red-500/30 rounded"
                  data-testid={`delete-service-${service.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Navigation cartCount={cartCount} />
        <Toaster position="top-right" theme="dark" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/customer/register" element={<CustomerRegister />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/account" element={<CustomerAccount />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;