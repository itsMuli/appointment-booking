import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = query.get('token');
    if (t) setToken(t);
  }, [query]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Missing reset token');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    if (password !== confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/user/reset-password`, { token, password });
      if (res.data?.success) {
        toast.success('Password reset successful — please login');
        navigate('/login');
      } else {
        toast.error(res.data?.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl text-gray-800">Reset Password</h2>
            <div className="mt-1 h-[2px] w-16 bg-gray-800 mx-auto" />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Reset Token (from email)</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Paste token here if not from link"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">New password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="New password"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Confirm password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-2 rounded-md">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
