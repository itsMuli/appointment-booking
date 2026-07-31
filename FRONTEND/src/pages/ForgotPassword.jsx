import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend doesn't currently implement a forgot-password route; attempt to POST and handle gracefully
      const res = await api.post('/api/user/forgot-password', { email });
      if (res.data?.success) {
        toast.success(res.data.message || 'Password reset email sent');
      } else {
        // If backend returns structured failure
        toast.error(res.data?.message || 'Failed to request password reset');
      }
    } catch (err) {
      // If endpoint is missing, inform the user that they should check their email or contact support
      const message = err.response?.data?.message || err.message || 'Unable to send reset email. Please contact support.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="text-center mb-6">
            <h2 className="prata-regular text-2xl text-gray-800">Forgot Password</h2>
            <div className="mt-1 h-[2px] w-16 bg-gray-800 mx-auto" />
          </div>

          <p className="text-sm text-gray-600 mb-4">Enter your account email and we&apos;ll send reset instructions (if supported).</p>

          <div className="mb-4">
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium py-2 px-8 rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
