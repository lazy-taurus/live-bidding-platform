import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getItems } from '../services/api';
import ItemCard from '../components/ItemCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const socket = io(API_URL, {
    auth: { token: localStorage.getItem('token') },
    autoConnect: false
});

export default function Dashboard({ user, onLogout }) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [page, setPage] = useState(1); // Page state
    const [flashMessages, setFlashMessages] = useState({});

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            getItems(page) // Pass page number
                .then(data => { setItems(data); setLoading(false); })
                .catch(error => console.error('Failed to fetch items:', error));
        };
        fetchData();
    }, [page]);

    // Socket connection logic
    useEffect(() => {
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
    }, [page]);

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
                    {/*<div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Live" : "Disconnected"} />*/}
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-500 hidden md:block">Welcome, <span className="text-gray-900 font-medium">{user.username}</span></span>
                    
                    {/* Create Auction Button */}
                    <button 
                        onClick={() => navigate('/create')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        Create Auction
                    </button>

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

                {/* Pagination Controls */}
                <div className="mt-12 flex justify-center gap-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700 font-medium">Page {page}</span>
                    <button 
                        disabled={items.length === 0} // Simple check for end of list
                        onClick={() => setPage(p => p + 1)}
                        className={`px-4 py-2 rounded ${items.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
}