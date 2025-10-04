import React, { useState, useEffect, useRef } from 'react';
import LargeSolarSystem from './LargeSolarSystem';
import { GoogleIcon, PhoneIcon } from './Icons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'main' | 'phone' | 'otp'>('main');
  
  // State for controlled inputs
  const [username, setUsername] = useState('guest');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [notification, setNotification] = useState('');
  
  const prevCooldownRef = useRef<number | undefined>(undefined);

  // Main countdown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timerId = window.setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => window.clearInterval(timerId);
    }
  }, [resendCooldown]);

  // Effect to show notification when cooldown ends
  useEffect(() => {
    if (typeof prevCooldownRef.current === 'number' && prevCooldownRef.current > 0 && resendCooldown === 0) {
      setNotification('You can now request a new code.');
      const notificationTimerId = window.setTimeout(() => setNotification(''), 5000);
      return () => window.clearTimeout(notificationTimerId);
    }
    prevCooldownRef.current = resendCooldown;
  }, [resendCooldown]);
  
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required.';
        if (value.trim().length < 3) return 'Username must be at least 3 characters.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
      case 'phoneNumber':
        const phoneRegex = /^\+?[\d\s-]{7,}$/;
        if (!value.trim()) return 'Mobile number is required.';
        if (!phoneRegex.test(value)) return 'Please enter a valid mobile number.';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };
  
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);

    if (usernameError || passwordError) {
      setErrors({ username: usernameError, password: passwordError });
      return;
    }
    onLogin();
  };


  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneError = validateField('phoneNumber', phoneNumber);
    if (phoneError) {
      setErrors({ phoneNumber: phoneError });
      return;
    }
    
    console.log(`Sending verification code to ${phoneNumber}`);
    setResendCooldown(30);
    setView('otp');
    setErrors({});
    setNotification(`A verification code has been sent to ${phoneNumber}.`);
    window.setTimeout(() => setNotification(''), 5000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim()) {
      console.log('Verifying OTP and signing in.');
      onLogin(); // Simulate successful login
    }
  };
  
  const handleResendCode = () => {
      if (resendCooldown === 0) {
          console.log(`Resending verification code to ${phoneNumber}`);
          setResendCooldown(30);
          setNotification('A new code has been sent.');
          window.setTimeout(() => setNotification(''), 5000);
      }
  }

  const renderMainView = () => (
    <>
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-amber-400">Exoplanet Detector Login</h2>
      <form onSubmit={handleSignIn} noValidate>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className={`shadow-inner appearance-none border rounded-lg w-full py-3 px-3 text-gray-200 bg-slate-900/60 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 ${errors.username ? 'border-red-500' : 'border-slate-600 focus:border-amber-500'}`}
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={handleBlur}
            aria-label="Username"
            aria-invalid={!!errors.username}
            aria-describedby="username-error"
          />
          {errors.username && <p id="username-error" className="text-red-500 text-xs italic mt-2">{errors.username}</p>}
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className={`shadow-inner appearance-none border rounded-lg w-full py-3 px-3 text-gray-200 bg-slate-900/60 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 ${errors.password ? 'border-red-500' : 'border-slate-600 focus:border-amber-500'}`}
            id="password"
            name="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handleBlur}
            aria-label="Password"
            aria-invalid={!!errors.password}
            aria-describedby="password-error"
          />
          {errors.password && <p id="password-error" className="text-red-500 text-xs italic mt-2">{errors.password}</p>}
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
            type="submit"
          >
            Sign In
          </button>
        </div>
        <div className="text-center">
          <a className="inline-block align-baseline font-bold text-sm text-amber-400 hover:text-amber-300" href="#">
            Forgot Password?
          </a>
        </div>
      </form>

      <div className="text-center my-6">
        <span className="text-sm text-gray-400">Don't have an account? </span>
        <a href="#" className="inline-block align-baseline font-bold text-sm text-amber-400 hover:text-amber-300">
            Sign Up
        </a>
      </div>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-slate-600"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
        <div className="flex-grow border-t border-slate-600"></div>
      </div>

      <div className="space-y-3 mt-6">
        <button onClick={onLogin} type="button" className="w-full inline-flex items-center justify-center py-2 px-4 border border-slate-600 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-slate-800/80 hover:bg-slate-700/90 hover:border-slate-500 transition-all duration-300 transform hover:scale-105">
          <GoogleIcon className="w-5 h-5 mr-3" />
          Sign in with Google
        </button>
        <button onClick={() => setView('phone')} type="button" className="w-full inline-flex items-center justify-center py-2 px-4 border border-slate-600 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-slate-800/80 hover:bg-slate-700/90 hover:border-slate-500 transition-all duration-300 transform hover:scale-105">
          <PhoneIcon className="w-5 h-5 mr-3" />
          Sign in with Mobile Number
        </button>
      </div>
    </>
  );

  const renderPhoneInputView = () => (
    <>
      <button onClick={() => { setView('main'); setErrors({}); }} className="text-amber-400 hover:text-amber-300 text-sm font-bold mb-4">&larr; Back to Login</button>
      <div className="flex items-center justify-center mb-6">
        <PhoneIcon className="w-6 h-6 mr-3 text-amber-400" />
        <h2 className="text-xl font-bold text-center text-amber-400">Enter Mobile Number</h2>
      </div>
      <form onSubmit={handleSendCode} noValidate>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
            Mobile Number
          </label>
          <input
            className={`shadow-inner appearance-none border rounded-lg w-full py-3 px-3 text-gray-200 bg-slate-900/60 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-300 ${errors.phoneNumber ? 'border-red-500' : 'border-slate-600 focus:border-amber-500'}`}
            id="phone"
            name="phoneNumber"
            type="tel"
            placeholder="e.g., +1 555-555-5555"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onBlur={handleBlur}
            required
            aria-label="Mobile Number"
            aria-invalid={!!errors.phoneNumber}
            aria-describedby="phone-error"
          />
          {errors.phoneNumber && <p id="phone-error" className="text-red-500 text-xs italic mt-2">{errors.phoneNumber}</p>}
        </div>
        <button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
          type="submit"
        >
          Send Code
        </button>
      </form>
    </>
  );
  
  const renderOtpInputView = () => (
    <>
      <button onClick={() => setView('phone')} className="text-amber-400 hover:text-amber-300 text-sm font-bold mb-4">&larr; Change Number</button>
      <h2 className="text-xl font-bold mb-2 text-center text-amber-400">Verify Your Number</h2>
      <p className="text-center text-gray-400 text-sm mb-6">Enter the code sent to {phoneNumber}</p>

      {notification && (
        <div className="p-3 mb-4 text-sm rounded-lg text-center bg-green-900/70 text-green-300 animate-slide-down-fade" role="alert">
          {notification}
        </div>
      )}

      <form onSubmit={handleVerifyOtp}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="otp">
            Verification Code
          </label>
          <input
            className="shadow-inner appearance-none border rounded-lg w-full py-3 px-3 text-gray-200 bg-slate-900/60 border-slate-600 leading-tight focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 text-center font-mono tracking-[.5em] text-lg"
            id="otp"
            type="text"
            placeholder="_ _ _ _ _ _"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            aria-label="Verification Code"
          />
        </div>
        <button
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-amber-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
          type="submit"
          disabled={otp.length < 6}
        >
          Verify & Sign In
        </button>
      </form>
      <div className="text-center mt-6">
        <button 
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
            className="inline-block align-baseline font-bold text-sm text-amber-400 hover:text-amber-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
            Resend Code
        </button>
        {resendCooldown > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            <p>You can request a new code in {resendCooldown}s</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ 
                    width: `${((30 - resendCooldown) / 30) * 100}%`,
                    transition: 'width 1s linear'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
    <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-form {
            animation: fade-in 0.6s ease-out forwards;
        }
        @keyframes slide-down-fade {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down-fade {
            animation: slide-down-fade 0.5s ease-out forwards;
        }
    `}</style>
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden p-4">
      <LargeSolarSystem />
      <div className="relative z-10 p-6 sm:p-8 bg-slate-900/70 border border-amber-500/30 rounded-lg shadow-2xl w-full max-w-sm animate-fade-in-form backdrop-blur-sm">
        {view === 'main' && renderMainView()}
        {view === 'phone' && renderPhoneInputView()}
        {view === 'otp' && renderOtpInputView()}
      </div>
    </div>
    </>
  );
};

export default LoginPage;