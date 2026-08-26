import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Events from './pages/Events/Events';
import Clubs from './pages/Clubs/Clubs';
import ClubDetail from './pages/Clubs/ClubDetail';
import Journals from './pages/Journals/Journals';
import JournalDetail from './pages/Journals/JournalDetail';
import Friends from './pages/Friends/Friends';
import Profile from './pages/Profile/Profile';
import TeamDetail from './pages/Teams/TeamDetail';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e1e30',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="clubs" element={<Clubs />} />
            <Route path="clubs/:clubId" element={<ClubDetail />} />
            <Route path="journals" element={<Journals />} />
            <Route path="journals/:id" element={<JournalDetail />} />
          </Route>
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="friends" element={<Friends />} />
            <Route path="profile" element={<Profile />} />
            <Route path="teams/:teamId" element={<TeamDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
