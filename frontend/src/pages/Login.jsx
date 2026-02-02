import { useState } from 'react';
import { login, register } from '../services/api';

export default function Login({ onLoginSuccess }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await register(formData.username, formData.email, formData.password);
            } else {
                await login(formData.email, formData.password);
            }
            onLoginSuccess(); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            {/* LEFT SIDE - BRANDING */}
            <div className="hidden lg:flex w-1/2 bg-blue-900 text-white flex-col justify-center px-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 opacity-90"></div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">Let's Visualize Change.</h1>
                    <p className="text-xl text-blue-100 max-w-lg leading-relaxed">
                        Experience the next generation of real-time bidding operations. 
                        Secure, Scalable, and Human-led.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {isRegistering ? 'Join the Network' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        {isRegistering ? 'Create your account to start bidding.' : 'Enter your credentials to access the floor.'}
                    </p>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100 flex items-center gap-2">⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegistering && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Work Email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30">
                            {isRegistering ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="text-sm text-gray-500 hover:text-blue-600 font-medium transition"
                        >
                            {isRegistering ? 'Already have an ID? Login' : 'Need an account? Register'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}