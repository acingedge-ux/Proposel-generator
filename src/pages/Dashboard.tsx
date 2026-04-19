import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Trash2, FileText, ExternalLink, Moon, Sun, Settings, LayoutDashboard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';


export default function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'proposals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setProposals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await deleteDoc(doc(db, 'proposals', id));
      setProposals(prev => prev.filter(p => p.id !== id));
      toast.success('Proposal deleted');
    } catch (error: any) {
      toast.error('Failed to delete proposal');
    }
  };

  return (
    <main className="p-6 md:p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-head tracking-tight uppercase">Active Proposals</h2>
          <p className="opacity-70 font-bold">Manage your generated client drafts</p>
        </div>
        <Link to="/create" className="theme-btn">
          <Plus size={20} /> New Proposal
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--theme-text)] border-t-transparent"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="theme-card text-center py-20">
          <FileText size={64} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-2xl font-head uppercase">No proposals yet</h3>
          <p className="mb-8 opacity-60">Start by creating your first AI-generated proposal.</p>
          <Link to="/create" className="theme-btn inline-block">Create Now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {proposals.map((proposal) => (
            <motion.div 
              layout
              key={proposal.id}
              className="theme-card p-6 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs font-bold uppercase px-2 py-1 bg-[var(--theme-bg)] border-[var(--theme-border-width)] border-[var(--theme-border-color)] mb-2 inline-block">
                    {proposal.tone}
                  </span>
                  <h3 className="text-xl font-head uppercase mb-1">{proposal.projectTitle}</h3>
                  <p className="font-bold opacity-60">{proposal.clientName} — {proposal.companyName}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/proposal/${proposal.id}`} className="p-2 border-[var(--theme-border-width)] border-[var(--theme-border-color)] hover:bg-[var(--theme-bg)] transition-colors rounded-[var(--theme-radius)]">
                    <ExternalLink size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(proposal.id)}
                    className="p-2 border-[var(--theme-border-width)] border-[var(--theme-border-color)] hover:bg-red-100 hover:text-red-600 transition-colors rounded-[var(--theme-radius)]"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="border-t-[var(--theme-border-width)] border-[var(--theme-border-color)] pt-4 flex justify-between items-center">
                <span className="text-xs font-bold opacity-50">CREATED: {formatDate(proposal.createdAt)}</span>
                <Link to={`/proposal/${proposal.id}`} className="text-xs font-bold underline decoration-2 decoration-[var(--theme-accent)] underline-offset-4 uppercase">
                  View Proposal
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
