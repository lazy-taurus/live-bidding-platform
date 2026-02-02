import { useState, useEffect } from 'react';

export default function ItemCard({ item, onBid, userId, notification }) {
    const [flash, setFlash] = useState(false);
    const [timeLeft, setTimeLeft] = useState(new Date(item.endTime) - new Date());
    
    // Derive "Closed" state
    const isEnded = timeLeft <= 0 || item.isClosed;
    const isWinning = item.highestBidder && (
        (item.highestBidder._id === userId) || (item.highestBidder === userId)
    );

    // Helpers
    const formatDollar = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
    const formatTime = (ms) => {
        if (ms <= 0) return "Ended";
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}m ${s}s`;
    };

    // Effects
    useEffect(() => {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 500);
        return () => clearTimeout(t);
    }, [item.currentPrice]);

    useEffect(() => {
        const t = setInterval(() => {
            const r = new Date(item.endTime) - new Date();
            setTimeLeft(r);
            if (r <= 0) clearInterval(t);
        }, 1000);
        return () => clearInterval(t);
    }, [item.endTime]);

    return (
        <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden group relative
            ${isWinning && !isEnded ? 'border-green-500 ring-1 ring-green-500 shadow-green-100' : 'border-gray-100'}
            ${flash ? 'bg-green-50' : ''}
            ${isEnded ? 'opacity-75 grayscale' : ''} 
        `}>
            
            {isWinning && !isEnded && !notification && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        WINNING
                    </span>
                </div>
            )}

            <div className="h-48 bg-gray-200 relative overflow-hidden">
                <img 
                    src={item.imageUrl || "https://via.placeholder.com/400x300?text=Levich+Auction"} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {notification && (
                    <div className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-opacity-70 transition-all duration-300 animate-in fade-in zoom-in
                        ${notification.type === 'outbid' ? 'bg-red-900/60' : 'bg-yellow-600/60'}
                    `}>
                        <div className={`px-4 py-2 rounded-lg font-black text-xl tracking-wider shadow-lg transform rotate-[-5deg] border-2
                            ${notification.type === 'outbid' 
                                ? 'text-white border-white bg-red-600' 
                                : 'text-white border-white bg-yellow-500'}
                        `}>
                            {notification.msg}
                        </div>
                    </div>
                )}
                
                {!notification && (
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm
                        ${isEnded ? 'bg-gray-800 text-white' : 'bg-white/90 text-blue-900'}
                    `}>
                        {isEnded ? 'CLOSED' : formatTime(timeLeft)}
                    </div>
                )}
            </div>
            
            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                
                <div className="flex justify-between items-end mb-4 mt-4">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Current Price</p>
                        <p className={`text-2xl font-bold transition-colors ${flash ? 'text-green-600' : 'text-blue-600'}`}>
                            {formatDollar(item.currentPrice)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Highest Bidder</p>
                        <p className="text-sm font-medium text-gray-700">
                            {isWinning ? 'You' : (item.highestBidder?.username || 'No Bids')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        disabled={isWinning || isEnded}
                        onClick={() => onBid(item._id, item.currentPrice + 1000)}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                            (isWinning || isEnded) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                        }`}
                    >
                        + $10
                    </button>
                    <button 
                        disabled={isWinning || isEnded}
                        onClick={() => onBid(item._id, item.currentPrice + 5000)}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm shadow-lg transition-all ${
                            (isWinning || isEnded) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                        }`}
                    >
                        + $50
                    </button>
                </div>
            </div>
        </div>
    );
}