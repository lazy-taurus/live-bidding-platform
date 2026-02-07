import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel'; // ✅ Import Admin Panel

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/create" 
          element={user ? <AdminPanel user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;