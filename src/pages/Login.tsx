import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, User, Activity, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!register) throw new Error('Registration hook unavailable.');
        await register(username, password);
        setSuccess('Account officially registered! Logging you in...');
      } else {
        await login(username, password);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl shadow-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-success/20 rounded-full blur-3xl shadow-2xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30 mb-6 transition-all duration-300">
            {isRegistering ? <UserPlus size={32} className="text-white" /> : <Activity size={32} className="text-white" />}
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight transition-all">
            Tracker<span className="text-primary">Pro</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            {isRegistering ? 'Create a secure new identity.' : 'Sign in to track your course batches'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="glass bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-danger/10 text-danger border border-danger/20 rounded-lg p-3 text-sm flex items-start">
                   <div className="flex-1 text-center">{error}</div>
                </div>
              )}
              {success && (
                <div className="bg-success/10 text-success border border-success/20 rounded-lg p-3 text-sm flex items-start">
                   <div className="flex-1 text-center">{success}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Username</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-slate-50 text-slate-800 transition-colors"
                    placeholder="E.g., professor_smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-slate-50 text-slate-800 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Create Account' : 'Secure Login')}
                </button>
              </div>
            </form>
            
            <div className="mt-6 border-t border-slate-100 pt-6">
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="w-full text-center text-sm text-primary hover:text-blue-800 font-medium transition-colors"
              >
                 {isRegistering ? 'Already have an account? Sign In.' : "Don't have an identity? Create Account."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
