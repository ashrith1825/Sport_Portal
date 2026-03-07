import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import { register } from '../../api/services';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">⚽</span>
          <h1>Create Account</h1>
          <p>Join the SportPortal community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              maxLength={40}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
