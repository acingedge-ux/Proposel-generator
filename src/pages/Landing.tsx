import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Zap, Shield, Globe } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Landing() {
  const { setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] font-body text-[var(--theme-text)]">
      <nav className="theme-nav p-6 flex justify-between items-center z-10 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          <h1 className="text-3xl font-head italic tracking-tighter">XYRON LABS</h1>
          <div className="flex gap-4 items-center">
            <Link to="/auth" className="font-head font-bold uppercase tracking-widest text-sm hover:underline underline-offset-8 decoration-4 decoration-[var(--theme-accent)]">Sign In</Link>
            <Link to="/create" className="theme-btn text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 md:py-20">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-5xl lg:text-8xl font-head font-black mb-8 leading-[0.9] tracking-tighter uppercase">
              PROPOSALS <br/> AT <span className="theme-badge px-4 inline-block transform -rotate-2">WARP</span> SPEED
            </h2>
            <p className="text-xl mb-12 font-bold max-w-lg leading-relaxed opacity-80">
              AI-powered client proposal generator for elite dev agencies. 
              Impress clients with stunning documents generated in seconds.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <Link to="/auth" className="theme-btn text-lg py-4 px-8">Launch App</Link>
              <div className="flex gap-3 theme-card-no-shadow p-3 ml-0 lg:ml-4">
                <button onClick={() => setTheme('brutalist')} className="w-8 h-8 rounded-full bg-[#FACC15] border-2 border-black hover:scale-110 transition-transform" title="Neo-Brutalist"></button>
                <button onClick={() => setTheme('minimalist')} className="w-8 h-8 rounded-full bg-[#fbfaf8] border-2 border-[#eaddd0] hover:scale-110 transition-transform" title="Minimalist"></button>
                <button onClick={() => setTheme('zine')} className="w-8 h-8 rounded-full bg-[#d4d4d4] border-2 border-black hover:scale-110 transition-transform" title="Print Zine"></button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: FileText, title: "Structured" },
              { icon: Zap, title: "Fast" },
              { icon: Shield, title: "Secure" },
              { icon: Globe, title: "Modern" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="theme-card flex flex-col items-center justify-center gap-4 py-12 aspect-square group"
              >
                <item.icon size={48} className="text-[var(--theme-accent)] group-hover:scale-110 transition-transform duration-300" />
                <span className="font-head font-black uppercase text-sm">{item.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t-[var(--theme-border-width)] border-[var(--theme-border-color)] mt-20 py-10 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center opacity-70">
          <p>© 2026 XYRON LABS. BUILT FOR BUILDERS.</p>
          <div className="flex gap-6 font-bold uppercase text-xs">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Github</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
