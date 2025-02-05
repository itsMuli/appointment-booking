import { useContext, useState } from "react";
import { AppointmentContext } from '../context/salonContext';
import axios from 'axios';
import { toast } from "react-toastify";
import { AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const Login = () => {
  // eslint-disable-next-line no-unused-vars
  const { token, setToken, setUser } = useContext(AppointmentContext);
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState("Login");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setError(null);
  };

const onSubmitHandler = async (event) => {
  event.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const endpoint = currentState === 'Sign Up' ? '/api/user/register' : '/api/user/login';
    const payload = currentState === 'Sign Up' 
      ? formData 
      : { email: formData.email, password: formData.password };

    const response = await api.post(endpoint, payload);

    if (response && response.data.success) {
      if (currentState === 'Sign Up') {
        toast.success('Successfully signed up! Please login to continue.');
        setCurrentState("Login");
        setFormData({ name: '', email: '', password: '' });
      } else {
        setToken(response.data.token);
        setUser(response.data.user); // Assuming the API returns user details
        localStorage.setItem('token', response.data.token);
        toast.success('Successfully logged in!');
        navigate('/'); 
      }
    } else {
      throw new Error(response.data.message || 'Authentication failed');
    } 
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmitHandler} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="text-center mb-8">
            <h2 className="prata-regular text-3xl text-gray-800">{currentState}</h2>
            <div className="mt-1 h-[2px] w-16 bg-gray-800 mx-auto" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {currentState === "Sign Up" && (
            <div className="mb-4">
              <input
                name="name"
                onChange={handleInputChange}
                value={formData.name}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Name"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <input
              name="email"
              onChange={handleInputChange}
              value={formData.email}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Email"
              required
            />
          </div>

          <div className="mb-6">
            <input
              name="password"
              onChange={handleInputChange}
              value={formData.password}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Password"
              required
            />
          </div>

          <div className="flex items-center justify-between mb-6 text-sm">
            <button type="button" className="text-primary hover:text-primary">
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentState(currentState === "Login" ? "Sign Up" : "Login");
                setError(null);
                setFormData({ name: '', email: '', password: '' });
              }}
              className="text-primary hover:text-primary"
            >
              {currentState === "Login" ? "Create account" : "Login Here"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-medium py-2 px-8 rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              currentState === "Login" ? "Sign In" : "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;