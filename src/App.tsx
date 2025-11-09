import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Contacts from './pages/Contacts';
import Projects from './pages/Projects';
import Notepad from './pages/Notepad';
import StorageInfo from './pages/StorageInfo';
import Backup from './pages/Backup';
import { initDB } from './utils/storage';
import { performAutomaticBackup, shouldPerformBackup } from './utils/backup';

// Component to handle 404.html redirects for GitHub Pages
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're coming from a 404.html redirect
    // The 404.html script redirects to /BuildFlow/?/path/to/route
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('/');
    
    if (redirectPath) {
      // Decode the path (replace ~and~ with &)
      const decodedPath = redirectPath.replace(/~and~/g, '&');
      // Navigate to the decoded path
      navigate(decodedPath, { replace: true });
    }
  }, [location.search, navigate]);

  return null;
}

function App() {
  useEffect(() => {
    // Initialize IndexedDB on app start
    initDB().catch(console.error);
    
    // Perform automatic backup if needed (every 24 hours)
    const checkAndBackup = async () => {
      if (shouldPerformBackup()) {
        try {
          await performAutomaticBackup();
        } catch (error) {
          console.warn('Automatic backup failed (this is OK if S3 is not configured):', error);
        }
      }
    };
    
    // Check on app start
    checkAndBackup();
    
    // Set up periodic backup check (every hour)
    const backupInterval = setInterval(checkAndBackup, 60 * 60 * 1000);
    
    return () => clearInterval(backupInterval);
  }, []);

  return (
    <AuthProvider>
      <Router basename="/BuildFlow">
        <RedirectHandler />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/notepad" element={<Notepad />} />
                    <Route path="/notepad/:date" element={<Notepad />} />
                    <Route path="/storage" element={<StorageInfo />} />
                    <Route path="/backup" element={<Backup />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

