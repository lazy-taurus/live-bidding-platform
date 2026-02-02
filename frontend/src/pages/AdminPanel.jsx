import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel() {
    const [items, setItems] = useState([]);
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
        const res = await axios.get('http://localhost:5000/items');
        setItems(res.data);
    };

    useEffect(() => { fetchItems(); }, []);

    // HANDLE SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/items', {
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
            await axios.delete(`http://localhost:5000/items/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchItems();
        } catch (err) {
            alert('Error deleting item');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-10">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

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
                {items.map(item => (
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
        </div>
    );
}