import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextObject';
import { login } from '../../api/services';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-promo">
        <span className="auth-eyebrow">Welcome back</span>
        <h1>Sign in to manage your sports world from one place.</h1>
        <p>
          Keep your clubs, events, teams, journals, and friends connected in a
          polished workspace built for serious sports communities.
        </p>

        <div className="auth-metrics">
          <article>
            <strong>Clubs</strong>
            <span>Organize communities</span>
          </article>
          <article>
            <strong>Events</strong>
            <span>Plan match days</span>
          </article>
          <article>
            <strong>Teams</strong>
            <span>Manage rosters</span>
          </article>
          <article>
            <strong>Journals</strong>
            <span>Share progress</span>
          </article>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>Use your Sport Portal account to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/">Home</Link> · Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
