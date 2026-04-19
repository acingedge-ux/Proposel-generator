import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { ArrowLeft, Edit3, Save, Copy, Loader2, TableProperties, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';

export default function ProposalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'proposals', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProposal(docSnap.data());
          setEditedContent(docSnap.data().content);
        } else {
          toast.error('Proposal not found');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Error fetching proposal');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id, navigate]);

  const handleUpdate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'proposals', id), {
        content: editedContent,
        updatedAt: serverTimestamp()
      });
      setProposal((prev: any) => ({ ...prev, content: editedContent }));
      setIsEditing(false);
      toast.success('Proposal updated');
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
      const element = printRef.current;
      if (!element) return;
      
      setExportingPDF(true);
      const opt = {
        margin:       10,
        filename:     `${proposal.projectTitle.replace(/\s+/g, '_')}_Proposal.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
      };

      try {
        await html2pdf().set(opt).from(element).save();
        toast.success('PDF successfully downloaded!');
      } catch (error) {
        toast.error('Failed to download PDF.');
        console.error(error);
      } finally {
        setExportingPDF(false);
      }
  };

  const exportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData = [
        ["Proposal ID", id],
        ["Date Generated", formatDate(proposal.createdAt)],
        ["Client", proposal.clientName],
        ["Company", proposal.companyName],
        ["Project Title", proposal.projectTitle],
        ["Budget", proposal.budget],
        ["Timeline", proposal.timeline],
        ["Tone", proposal.tone],
        [],
        ["Content"],
        [proposal.content]
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      const wscols = [ {wch: 20}, {wch: 60} ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Proposal_Data");
      XLSX.writeFile(wb, `${proposal.projectTitle.replace(/\s+/g, '_')}_Data.xlsx`);
      toast.success('Excel schema exported!');
    } catch(err) {
      toast.error('Failed to export Excel data');
    }
  };

  if (loading) return (
    <div className="flex h-full min-h-[500px] items-center justify-center">
      <Loader2 className="animate-spin text-[var(--theme-text)]" size={48} />
    </div>
  );

  return (
    <div className="flex flex-col h-full print:bg-white print:min-h-0">
      <header className="h-20 theme-nav flex items-center justify-between px-6 md:px-10 sticky top-0 z-10 print:hidden border-b-[var(--theme-border-width)] border-[var(--theme-border-color)]">
        <div className="flex items-center gap-8">
          <div className="hidden sm:flex gap-2">
            <span className="theme-badge px-3 py-1 text-xs font-bold uppercase tracking-widest">Workspace</span>
            <span className="px-3 py-1 bg-green-400 text-black border-[var(--theme-border-width)] border-[var(--theme-border-color)] text-xs font-bold uppercase tracking-widest">LIVE</span>
          </div>
        </div>
        
        <div className="flex gap-4">
           <button 
             onClick={exportExcel} 
             className="hidden lg:flex theme-btn-secondary text-sm px-6"
           >
             <TableProperties size={18} /> Export Excel
           </button>
           <button 
             onClick={handleDownloadPDF} 
             disabled={exportingPDF}
             className="hidden sm:flex theme-btn-secondary text-sm px-6"
           >
             {exportingPDF ? 'Generating...' : 'Export PDF'}
           </button>
           <button 
             onClick={() => setIsEditing(!isEditing)}
             className="theme-btn-secondary text-sm px-6"
           >
             {isEditing ? 'Preview' : 'Edit Mode'}
           </button>
           {isEditing && (
             <button 
               onClick={handleUpdate} 
               disabled={saving}
               className="theme-btn text-sm px-6"
             >
               {saving ? 'Saving...' : 'Save Draft'}
             </button>
           )}
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto print:overflow-visible print:p-0">
        <div className="max-w-5xl mx-auto print:max-w-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="theme-card relative print:border-none print:shadow-none print:bg-white print:p-0"
          >
            <div className="absolute top-0 right-0 p-2 theme-badge border-t-0 border-r-0 text-[10px] font-bold uppercase tracking-widest z-10 print:hidden">
              PROPOSAL ID: {id?.slice(-6).toUpperCase()}
            </div>
            
            {isEditing ? (
              <textarea 
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[700px] p-6 font-mono text-lg focus:outline-none bg-[rgba(0,0,0,0.02)] border-r-[var(--theme-border-width)] border-[var(--theme-border-color)]"
                placeholder="Edit your markdown proposal here..."
              />
            ) : (
              <div ref={printRef} className="p-8 md:p-20 py-20 prose max-w-none prose-neutral print:prose-p:text-black print:prose-headings:text-black print:w-full">
                 <div className="mb-16 border-b-[4px] border-neutral-200 pb-12 print:border-black">
                    <h1 className="text-5xl md:text-6xl font-head italic tracking-tighter m-0 mb-2">XYRON LABS</h1>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <p className="m-0 font-bold uppercase opacity-60 tracking-wider text-sm">Proposal Generation v2.4</p>
                      <div className="md:text-right">
                        <p className="m-0 font-head uppercase text-xl md:text-2xl">{proposal.projectTitle}</p>
                        <p className="m-0 font-bold opacity-60 text-sm">{formatDate(proposal.createdAt)}</p>
                      </div>
                    </div>
                 </div>
                 
                 <div className="h-full space-y-6 print:text-black">
                    <ReactMarkdown>{proposal.content}</ReactMarkdown>
                 </div>
                 
                 <div className="mt-24 theme-banner text-center text-2xl font-head uppercase font-bold print:border-2 print:border-black print:bg-white print:text-black">
                    ESTIMATED BUDGET: {proposal.budget || '$0.00'}
                 </div>

                 <div className="mt-20 pt-8 border-t-[var(--theme-border-width)] border-[var(--theme-border-color)] flex justify-between items-center font-bold text-xs uppercase opacity-40 print:border-black">
                    <span>© 2026 XYRON LABS INC.</span>
                    <span>SECURE_BLOCK_8892_B</span>
                 </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}


