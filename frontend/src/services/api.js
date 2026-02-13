const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get headers with the Token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token 
        ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
        : { 'Content-Type': 'application/json' };
};

export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    // Save the token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
};

export const register = async (username, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
};

export const getItems = async (page = 1, limit = 12) => {
    const res = await fetch(`${API_URL}/items?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
    });
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return [];
    }
    return await res.json();
};

export const createItem = async (itemData) => {
    const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
    });
    if (!res.ok) throw new Error('Failed to create item');
    return await res.json();
};

export const deleteItem = async (id) => {
    const res = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return await res.json();
};