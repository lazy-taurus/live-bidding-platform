import { useState, useEffect } from 'react';
import Login from './pages/Login';

// Placeholder for Dashboard
const DashboardPlaceholder = ({ user, onLogout }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">Hello, {user.username} 👋</h1>
    <p className="text-gray-500 mb-8">The Auction Dashboard is coming next...</p>
    <button 
        onClick={onLogout} 
        className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
        Logout
    </button>
  </div>
);

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

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <DashboardPlaceholder user={user} onLogout={handleLogout} />;
}

export default App;