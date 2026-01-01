// components/Login.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, verifyOTP, googleAuth } from '../store/slices/authSlice';
import { getOrCreateDeviceFingerprint, getDeviceInfo } from '../utils/fingerprint';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Smartphone, Monitor, Tablet } from 'lucide-react';


function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Two-step login: credentials first, then OTP
  const [step, setStep] = useState('credentials'); // 'credentials', 'otp-sent', or 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);

  // Initialize fingerprint on component mount
  useEffect(() => {
    const initFingerprint = () => {
      try {
        const fingerprint = getOrCreateDeviceFingerprint();
        const deviceData = getDeviceInfo();
        
        setDeviceFingerprint(fingerprint);
        setDeviceInfo(deviceData);
      } catch (error) {
        console.error('Failed to generate fingerprint:', error);
      }
    };

    initFingerprint();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (otpError) {
      setOtpError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Include device fingerprint in login request
    const loginData = {
      ...formData,
      deviceFingerprint: deviceFingerprint
    };

    const result = await dispatch(login(loginData));
    if (result.payload) {
      // If response includes OTP requirement, show sent confirmation first
      if (result.payload.requiresOTP || result.payload.message?.includes('OTP')) {
        setStep('otp-sent'); // Show confirmation screen
        // After 3 seconds, move to OTP input
        setTimeout(() => {
          setStep('otp');
        }, 3000);
      } else {
        // Direct login without OTP (backward compatibility)
        navigate('/');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    
    // Include device fingerprint in OTP verification
    const otpData = {
      email: formData.email,
      otp: otp,
      deviceFingerprint: deviceFingerprint
    };

    const result = await dispatch(verifyOTP(otpData));

    if (result.type === verifyOTP.fulfilled.type) {
      // Store device fingerprint in localStorage for future requests
      localStorage.setItem('deviceFingerprint', deviceFingerprint);
      // OTP verification successful, redirect to home
      navigate('/');
    } else {
      // OTP verification failed
      const errorPayload = result.payload;
      if (typeof errorPayload === 'object' && errorPayload.message) {
        setOtpError(errorPayload.message);
        // Show remaining attempts if available
        if (errorPayload.remainingAttempts !== undefined) {
          setOtpError(`${errorPayload.message} (${errorPayload.remainingAttempts} attempts remaining)`);
        }
        
        // If device limit reached, show upgrade option
        if (errorPayload.code === 'DEVICE_LIMIT_REACHED') {
          setOtpError(
            <span>
              {errorPayload.message} 
              <br />
              <button 
                onClick={() => navigate('/upgrade')}
                className="text-blue-300 underline mt-1"
              >
                Upgrade to Premium
              </button>
            </span>
          );
        }
      } else {
        setOtpError('Invalid OTP');
      }
    }
    setOtpLoading(false);
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      // Include device fingerprint in resend request
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          deviceFingerprint: deviceFingerprint 
        })
      });

      if (response.ok) {
        setOtpError('');
        setResendCountdown(60);
        const interval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        const errorData = await response.json();
        setOtpError(errorData.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      setOtpError('Error resending OTP');
    }
    setOtpLoading(false);
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
    setOtpError('');
  };

  const handleGoogleLoginSuccess = async () => {
    try {
      // Store fingerprint in session storage for Google OAuth redirect
      sessionStorage.setItem('pendingDeviceFingerprint', deviceFingerprint);
      // Initiate Google OAuth flow
      await dispatch(googleAuth());
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Get device icon based on user agent
  const getDeviceIcon = () => {
    if (!deviceInfo) return <Smartphone className="w-4 h-4" />;
    
    const ua = deviceInfo.userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-4 h-4" />;
    } else {
      return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 pt-24 pb-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Film Nyarwanda
          </h1>
          <p className="text-gray-400">
            {step === 'credentials' ? 'Welcome back to your favorite movies' : 'Verify your identity'}
          </p>
          
          {/* Device Info Badge */}
          {deviceInfo && (
            <div className="mt-4">
              <button
                onClick={() => setShowDeviceInfo(!showDeviceInfo)}
                className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 border border-gray-700 rounded-full text-xs hover:bg-gray-800 transition-colors"
              >
                {getDeviceIcon()}
                <span>Device: {deviceInfo.platform}</span>
              </button>
              
              {showDeviceInfo && (
                <div className="mt-2 p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-xs text-left">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400">Screen:</span>
                      <div className="font-medium">{deviceInfo.screenResolution}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Language:</span>
                      <div className="font-medium">{deviceInfo.language}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Timezone:</span>
                      <div className="font-medium">{deviceInfo.timezone}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Browser:</span>
                      <div className="font-medium truncate">
                        {deviceInfo.userAgent.split(' ').slice(-2).join(' ')}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <span className="text-gray-400">Fingerprint:</span>
                    <div className="font-mono text-xs truncate">
                      {deviceFingerprint.substring(0, 30)}...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step Indicator */}
        {step === 'otp' && (
          <div className="flex justify-center gap-2 mb-6">
            <div className="flex-1 h-1 bg-blue-500 rounded-full"></div>
            <div className="flex-1 h-1 bg-gray-600 rounded-full"></div>
          </div>
        )}

        {/* Credentials Form */}
        {step === 'credentials' && (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 space-y-6"
          >
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm text-blue-400">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border rounded-lg outline-none transition-all ${
                    validationErrors.email
                      ? 'border-blue-500 focus:border-blue-500'
                      : 'border-gray-600 focus:border-blue-400'
                  } focus:bg-gray-700`}
                />
              </div>
              {validationErrors.email && (
                <p className="text-blue-400 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-gray-700/50 border rounded-lg outline-none transition-all ${
                    validationErrors.password
                      ? 'border-blue-500 focus:border-blue-500'
                      : 'border-gray-600 focus:border-blue-400'
                  } focus:bg-gray-700`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-blue-400 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Device Security Note */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  <strong>Device Recognition:</strong> This device will be remembered for secure login.
                  Free accounts allow 1 device, premium allows 2 devices.
                  <a href="/upgrade" className="text-blue-400 text-lg hover:text-blue-300 ml-1">
                    upgrade now
                  </a>
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !deviceFingerprint}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold py-2.5 rounded-lg transition-all duration-200"
            >
              {loading ? 'Logging in...' : !deviceFingerprint ? 'Initializing...' : 'Login'}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm">
                Forgot password?
              </a>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-400 text-sm">Or continue with</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLoginSuccess}
              disabled={loading || !deviceFingerprint}
              className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-400 text-black font-semibold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Signing in...' : !deviceFingerprint ? 'Loading...' : 'Continue with Google'}
            </button>
          </form>
        )}

        {/* OTP Sent Confirmation Screen */}
        {step === 'otp-sent' && (
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 space-y-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">OTP Sent Successfully!</h2>
              <p className="text-gray-400">
                We sent a 6-digit verification code to
                <br />
                <strong className="text-white">{formData.email}</strong>
              </p>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-300">
                Check your inbox and spam folder for the code. You'll be redirected to enter it shortly...
              </p>
            </div>

            {/* Loading Indicator */}
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        {/* OTP Verification Form */}
        {step === 'otp' && (
          <form
            onSubmit={handleOtpSubmit}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 space-y-6"
          >
            {/* Device Info Banner */}
            {deviceInfo && (
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  {getDeviceIcon()}
                  <div>
                    <div className="text-xs font-medium">{deviceInfo.platform}</div>
                    <div className="text-xs text-gray-400">This device will be registered</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {deviceInfo.screenResolution}
                </div>
              </div>
            )}

            {/* OTP Info */}
            <div className="flex items-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Shield className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
              <p className="text-sm text-blue-300">
                We sent a 6-digit code to<br />
                <strong>{formData.email}</strong>
              </p>
            </div>

            {/* OTP Error Message */}
            {otpError && (
              <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="text-sm text-blue-400">
                  {typeof otpError === 'string' ? otpError : otpError}
                </div>
              </div>
            )}

            {/* OTP Input Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                maxLength="6"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest bg-gray-700/50 border border-gray-600 rounded-lg outline-none focus:border-blue-400 focus:bg-gray-700 transition-all"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                {otp.length}/6 digits
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold py-2.5 rounded-lg transition-all duration-200"
            >
              {otpLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {resendCountdown > 0 ? (
                <p className="text-sm text-gray-400">
                  Resend OTP in <strong>{resendCountdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Resend Code
                </button>
              )}
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={handleBackToCredentials}
              className="w-full text-gray-400 hover:text-gray-300 text-sm py-2 rounded-lg transition-all"
            >
              ← Back to Login
            </button>
          </form>
        )}

        {/* Register Link */}
        {step === 'credentials' && (
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;