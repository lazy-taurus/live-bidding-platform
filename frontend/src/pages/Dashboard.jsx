import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(API_URL, {
    auth: { token: localStorage.getItem('token') },
    autoConnect: false
});

export default function Dashboard({ user, onLogout }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(socket.connected);
    
    const [flashMessages, setFlashMessages] = useState({});

    useEffect(() => {
        const fetchData = () => {
            getItems()
                .then(data => { setItems(data); setLoading(false); })
                .catch(error => console.error('Failed to fetch items:', error));
        };
        fetchData();
        
        socket.auth.token = localStorage.getItem('token');
        socket.connect();

        socket.on('connect', () => {
            console.log("Socket connected/reconnected. Syncing...");
            setIsConnected(true);
            fetchData();
        });
        
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('UPDATE_BID', (updatedItem) => {
            setItems(prev => prev.map(item => item._id === updatedItem._id ? updatedItem : item));
        });

        socket.on('AUCTION_OUTBID', (data) => {
            triggerFlash(data.itemId, 'outbid', 'OUTBID!');
        });

        socket.on('BID_ERROR', (data) => {
            triggerFlash(data.itemId || 'global', 'error', data.message);
        });

        socket.on('AUCTION_WON', (data) => {
            triggerFlash(data.item._id, 'success', 'YOU WON!');
        });

        return () => {
            socket.off('UPDATE_BID');
            socket.off('AUCTION_OUTBID');
            socket.off('BID_ERROR');
            socket.off('AUCTION_WON');
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
            {/* ... Header ... */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">Let's Bid</span>
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Live" : "Disconnected"} />
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