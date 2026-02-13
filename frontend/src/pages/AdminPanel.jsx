import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPanel({ user, onLogout }) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startingPrice: '',
        endTime: '',
        imageUrl: ''
    });

    const token = localStorage.getItem('token');

    // Fetch items
    const fetchItems = async () => {
        // Added page and limit parameters
        const res = await axios.get(`${API_URL}/items?page=${page}&limit=10`);
        setItems(res.data);
    };

    useEffect(() => { fetchItems(); }, [page]);

    // HANDLE SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/items`, {
                ...formData,
                startingPrice: parseFloat(formData.startingPrice) * 100 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Item Added!');
            fetchItems();
        } catch (err) {
            alert('Error adding item');
        }
    };

    // HANDLE DELETE
    const handleDelete = async (id) => {
        if(!confirm('Delete this item?')) return;
        try {
            await axios.delete(`${API_URL}/items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchItems();
        } catch (err) {
            alert('Error deleting item');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ... Header ... */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Let's Bid</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500 hidden md:block">Welcome, <span className="text-gray-900 font-medium">{user.username}</span></span>
                    <button 
                        onClick={() => navigate('/')} 
                        className="text-sm font-medium text-gray-500 hover:text-blue-600"
                    >
                        Back to Dashboard
                    </button>
                    <button onClick={onLogout} className="text-sm font-medium text-red-500 hover:text-red-600">Logout</button>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-10 pb-20">
                {/* CREATE FORM */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Add New Auction Item</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input className="w-full p-2 border rounded" placeholder="Item Title" required 
                            onChange={e => setFormData({...formData, title: e.target.value})} />
                        
                        <textarea className="w-full p-2 border rounded" placeholder="Description" required 
                            onChange={e => setFormData({...formData, description: e.target.value})} />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <input className="p-2 border rounded" type="number" placeholder="Start Price ($)" required 
                                onChange={e => setFormData({...formData, startingPrice: e.target.value})} />
                            
                            <input className="p-2 border rounded" type="datetime-local" required 
                                onChange={e => setFormData({...formData, endTime: e.target.value})} />
                        </div>

                        <input className="w-full p-2 border rounded" placeholder="Image URL (http://...)" required 
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})} />

                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                            Create Item
                        </button>
                    </form>
                </div>

                {/* DELETE LIST */}
                <h2 className="text-xl font-bold mb-4">Manage Existing Items</h2>
                <div className="grid gap-4">
                    {items.length === 0 ? <p className="text-gray-500">No items on this page.</p> : 
                    items.map(item => (
                        <div key={item._id} className="flex justify-between items-center bg-white p-4 rounded shadow-sm border">
                            <div className="flex items-center gap-4">
                                <img src={item.imageUrl} className="w-12 h-12 rounded object-cover" />
                                <div>
                                    <p className="font-bold">{item.title}</p>
                                    <p className="text-xs text-gray-500">${item.currentPrice / 100}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(item._id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold hover:bg-red-200">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="mt-8 flex justify-center gap-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700 font-medium">Page {page}</span>
                    <button 
                        disabled={items.length < 10}
                        onClick={() => setPage(p => p + 1)}
                        className={`px-4 py-2 rounded ${items.length < 10 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}