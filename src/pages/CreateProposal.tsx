import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Sparkles, Save, ArrowLeft, Loader2, SaveAll } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

export default function CreateProposal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    projectTitle: '',
    projectDescription: '',
    scopeOfWork: '',
    timeline: '',
    budget: '',
    notes: '',
    tone: 'Professional'
  });

  // AI Client - initialized inside component or at module level
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // ... (rest of the autosave logic)
  useEffect(() => {
    const saved = localStorage.getItem('proposal-draft');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('proposal-draft', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prompt = `
        You are a highly professional development agency named "Xyron Labs".
        Generate a comprehensive project proposal based on the following details:
        
        Client: ${formData.clientName}
        Company: ${formData.companyName || 'Not specified'}
        Project Title: ${formData.projectTitle}
        Project Description: ${formData.projectDescription}
        Scope of Work: ${formData.scopeOfWork}
        Timeline: ${formData.timeline}
        Budget: ${formData.budget}
        Additional Notes: ${formData.notes || 'None'}
        Tone: ${formData.tone}
        
        The proposal must include these exact sections in Markdown format:
        1. Introduction
        2. Project Overview
        3. Scope of Work
        4. Timeline
        5. Pricing
        6. Conclusion
        
        Make it persuasive, detailed, and formatted professionally.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (!response.text) throw new Error('No content returned');
      
      setGeneratedContent(response.text);
      toast.success('Proposal generated!');
    } catch (error: any) {
      console.error(error);
      toast.error('AI generation failed. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!user || !generatedContent) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'proposals'), {
        ...formData,
        userId: user.uid,
        content: generatedContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Proposal saved to dashboard');
      localStorage.removeItem('proposal-draft');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to save proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user) return;
    const name = prompt('Enter a name for this template:');
    if (!name) return;

    try {
      await addDoc(collection(db, 'templates'), {
        ...formData,
        userId: user.uid,
        name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Template saved!');
    } catch (error: any) {
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Side */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="theme-card h-fit p-8">
              <div className="flex justify-between items-center mb-8 border-b-[var(--theme-border-width)] border-[var(--theme-border-color)] pb-4">
                <h2 className="text-3xl font-head uppercase">Project Details</h2>
                <button onClick={handleSaveTemplate} className="text-xs font-bold underline underline-offset-4 decoration-[var(--theme-text)] decoration-2 uppercase flex items-center gap-1">
                   <SaveAll size={14} /> Save as Template
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2">Client Name*</label>
                    <input name="clientName" value={formData.clientName} onChange={handleChange} required className="w-full theme-input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2">Company*</label>
                    <input name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full theme-input" placeholder="Acme Corp" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2">Project Title*</label>
                  <input name="projectTitle" value={formData.projectTitle} onChange={handleChange} required className="w-full theme-input" placeholder="Modern E-commerce Platform" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2">Project Description</label>
                  <textarea name="projectDescription" value={formData.projectDescription} onChange={handleChange} className="w-full theme-input min-h-[100px]" placeholder="Briefly describe the requirements..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2">Timeline</label>
                    <input name="timeline" value={formData.timeline} onChange={handleChange} className="w-full theme-input" placeholder="e.g. 12 Weeks" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-2">Budget</label>
                    <input name="budget" value={formData.budget} onChange={handleChange} className="w-full theme-input" placeholder="e.g. $45,000" />
                  </div>
                </div>

                <div>
                   <label className="block text-xs font-bold uppercase mb-2">Proposal Tone</label>
                   <select name="tone" value={formData.tone} onChange={handleChange} className="w-full theme-input appearance-none">
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Persuasive</option>
                      <option>Aggressive</option>
                   </select>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="theme-btn w-full text-xl py-4 mt-8"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
                  {loading ? 'Generating...' : 'Generate Proposal'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Preview Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className={cn(
              "theme-card min-h-[600px] flex-1 prose max-w-none prose-neutral p-8",
              generatedContent ? "bg-[var(--theme-surface)]" : "bg-[rgba(0,0,0,0.02)] flex items-center justify-center border-dashed"
            )}>
              {generatedContent ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center opacity-40">
                  <Sparkles size={48} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest">Preview will appear here</p>
                </div>
              )}
            </div>

            {generatedContent && (
              <div className="flex gap-4">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="theme-btn flex-1"
                >
                  {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Save to Dashboard
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedContent);
                    toast.success('Copied to clipboard');
                  }}
                  className="theme-btn-secondary flex-1"
                >
                  Copy Markdown
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
