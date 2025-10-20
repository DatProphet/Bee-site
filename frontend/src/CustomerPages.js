import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Customer Registration
export function CustomerRegister() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/customer/register`, formData);
      localStorage.setItem('customer_token', response.data.token);
      localStorage.setItem('customer', JSON.stringify(response.data.customer));
      toast.success('Account created successfully!');
      navigate('/account');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container-custom max-w-md">
        <h1 className="page-title" data-testid="customer-register-title">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-dark-800 p-8 rounded-lg border border-golden-500/20" data-testid="customer-register-form">
          <div>
            <label className="block text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              data-testid="customer-name-input"
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
              data-testid="customer-email-input"
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
              data-testid="customer-phone-input"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Address (Optional)</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              rows="3"
              data-testid="customer-address-input"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              data-testid="customer-password-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
            data-testid="customer-register-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          <Link to="/customer/login" className="block text-center text-golden-400 hover:text-golden-300 text-sm">
            Already have an account? Login
          </Link>
        </form>
      </div>
    </div>
  );
}

// Customer Login
export function CustomerLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/customer/login`, formData);
      localStorage.setItem('customer_token', response.data.token);
      localStorage.setItem('customer', JSON.stringify(response.data.customer));
      toast.success('Logged in successfully!');
      navigate('/account');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container-custom max-w-md">
        <h1 className="page-title" data-testid="customer-login-title">Customer Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-dark-800 p-8 rounded-lg border border-golden-500/20" data-testid="customer-login-form">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              data-testid="customer-login-email-input"
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
              data-testid="customer-login-password-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
            data-testid="customer-login-btn"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/customer/register" className="block text-center text-golden-400 hover:text-golden-300 text-sm">
            Need an account? Register
          </Link>
        </form>
      </div>
    </div>
  );
}

// Customer Account Page
export function CustomerAccount() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      navigate('/customer/login');
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await axios.get(`${API}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        phone: response.data.phone,
        address: response.data.address || '',
        password: ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
      if (error.response?.status === 401) {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer');
        navigate('/customer/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      const response = await axios.get(`${API}/customer/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('customer_token');
    
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await axios.put(`${API}/customer/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data);
      setEditing(false);
      setFormData({ ...formData, password: '' });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer');
    toast.success('Logged out successfully');
    navigate('/');
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
      <div className="container-custom max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="page-title" data-testid="account-title">My Account</h1>
          <button onClick={handleLogout} className="btn-secondary" data-testid="logout-btn">
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <div className="bg-dark-800 p-6 rounded-lg border border-golden-500/20">
              <h2 className="text-2xl font-semibold text-golden-400 mb-4">Profile</h2>
              
              {!editing ? (
                <div className="space-y-3" data-testid="profile-view">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{profile?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Address</p>
                    <p className="text-white">{profile?.address || 'Not provided'}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-primary w-full mt-4"
                    data-testid="edit-profile-btn"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4" data-testid="profile-edit-form">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="input-field"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">New Password (optional)</label>
                    <input
                      type="password"
                      minLength="6"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary flex-1">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Orders Section */}
          <div className="md:col-span-2">
            <div className="bg-dark-800 p-6 rounded-lg border border-golden-500/20">
              <h2 className="text-2xl font-semibold text-golden-400 mb-4">Order History</h2>
              
              {orders.length === 0 ? (
                <p className="text-gray-400 text-center py-8" data-testid="no-orders">No orders yet</p>
              ) : (
                <div className="space-y-4" data-testid="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="border border-golden-500/10 p-4 rounded" data-testid={`order-${order.id}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-white font-semibold">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-golden-400 font-semibold">${order.total.toFixed(2)}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.payment_status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                              order.payment_status === 'failed' ? 'bg-red-500/20 text-red-400' : 
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {order.payment_status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.order_status === 'shipped' ? 'bg-blue-500/20 text-blue-400' : 
                              order.order_status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-300">{item.name} x {item.quantity}</span>
                            <span className="text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
