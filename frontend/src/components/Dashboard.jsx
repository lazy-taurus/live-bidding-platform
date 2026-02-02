import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getItems } from '../services/api';
import ItemCard from './ItemCard';

const socket = io('http://localhost:5000', {
    auth: { token: localStorage.getItem('token') },
    autoConnect: false
});

export default function Dashboard({ user, onLogout }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [flashMessages, setFlashMessages] = useState({});

    useEffect(() => {
        getItems().then(data => { setItems(data); setLoading(false); }).catch(console.error);
        
        socket.auth.token = localStorage.getItem('token');
        socket.connect();

        socket.on('UPDATE_BID', (updatedItem) => {
            setItems(prev => prev.map(item => item._id === updatedItem._id ? updatedItem : item));
        });

        socket.on('AUCTION_OUTBID', (data) => {
            triggerFlash(data.itemId, 'outbid', 'OUTBID!');
        });

        socket.on('BID_ERROR', (data) => {
            triggerFlash(data.itemId || 'global', 'error', data.message);
        });

        return () => {
            socket.off('UPDATE_BID');
            socket.off('AUCTION_OUTBID');
            socket.off('BID_ERROR');
            socket.disconnect();
        };
    }, []);

    const triggerFlash = (itemId, type, msg) => {
        setFlashMessages(prev => ({ ...prev, [itemId]: { type, msg } }));
        
        setTimeout(() => {
            setFlashMessages(prev => {
                const newState = { ...prev };
                delete newState[itemId];
                return newState;
            });
        }, 2000);
    };

    const handleBid = (itemId, amount) => {
        socket.emit('BID_PLACED', { itemId, amount });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ... Header Code Remains Same ... */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Let's Bid</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500 hidden md:block">Welcome, <span className="text-gray-900 font-medium">{user.username}</span></span>
                    <button onClick={onLogout} className="text-sm font-medium text-red-500 hover:text-red-600">Logout</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Live Auctions</h1>
                    <p className="text-gray-500 mt-1">Real-time bidding on exclusive assets.</p>
                </div>

                {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : 
                 items.length === 0 ? <div className="text-center py-20 text-gray-500">No items available.</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map(item => (
                            <ItemCard 
                                key={item._id} 
                                item={item} 
                                onBid={handleBid}
                                userId={user.id || user._id}
                                notification={flashMessages[item._id]}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}