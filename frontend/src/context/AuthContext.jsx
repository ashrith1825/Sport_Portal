import { useState, useEffect } from 'react';
import { getMe } from '../api/services';
import { AuthContext } from './AuthContextObject';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  const loginUser = (authResponse) => {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse));
    setUser({
      id: authResponse.id,
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role,
    });
    // Fetch full profile to get friendCode and other fields
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

