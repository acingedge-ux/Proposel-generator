import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, UserPlus, Github } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--theme-bg)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card p-8 w-full max-w-md"
      >
        <h1 className="text-4xl font-head font-black mb-2 text-center italic tracking-tighter">XYRON LABS</h1>
        <p className="text-center mb-8 opacity-70 font-bold uppercase text-xs tracking-widest">Proposal Generator Access</p>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="theme-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="theme-input"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="theme-btn w-full mt-4"
          >
            {loading ? 'Processing...' : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t-[var(--theme-border-width)] border-[var(--theme-border-color)]"></span></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="px-2 bg-[var(--theme-surface)] font-bold opacity-60">Or continue with</span></div>
          </div>
          
          <button 
            onClick={signInWithGoogle}
            className="theme-btn-secondary w-full"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
            Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm font-bold opacity-80">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="underline decoration-[var(--theme-accent)] decoration-2 underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
