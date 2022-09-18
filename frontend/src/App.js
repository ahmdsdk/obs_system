import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Public from './components/Public';
import RequireAuth from './components/RequireAuth';
import AdminDashboard from './components/AdminDashboard';
import Dashboard from './components/Dashboard';
import { apiCall } from './api';

function App() {
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    if (token) {
      const response = await apiCall('GET', '/auth', {token});
      
      if (response?.status === 200 || response?.status === 201) {

        setUserData(response.user);
        setToken(response.token);
        setLoading(false);
        
        const path = location.pathname !== '/' && location.pathname !== '' ? location.pathname : '/dashboard';
        
        return navigate(path);
      }
    }
    
    const response = await apiCall('GET', '/refresh');
    
    if (response?.status === 201) {
      
      await setUserData(response.user);
      await setToken(response.token);
      await setLoading(false);

      const path = location.pathname !== '/' && location.pathname !== '' ? location.pathname : '/dashboard';

      return navigate(path);
    }

    setLoading(false);
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route
          index
          element={<Public loading={loading} userData={userData} setUserData={setUserData} setToken={setToken} />}
          />

        {/* protected routes */}
        <Route element={<RequireAuth token={token} />}>
          <Route path="dashboard" element={<Dashboard
                                              userData={userData}
                                              setUserData={setUserData}
                                              token={token}
                                              setToken={setToken}
                                              />}
            />
          <Route path="admin_dashboard" element={<AdminDashboard
                                                    userData={userData}
                                                    setUserData={setUserData}
                                                    token={token}
                                                    setToken={setToken}
                                                    />}
            />
        </Route>

      </Route>
    </Routes>
  );
}

export default App;
