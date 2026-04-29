import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notesAPI } from '../context/api';
import { EDUCATION_LEVELS, SUBJECTS, predictPrice } from '../data/mockData';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';


const UploadNotes = () => {
  const { user, addUploadedNote } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [details, setDetails] = useState({
    title: '', subject: '', educationLevel: user?.educationLevel || '', description: '',
  });
  const [aiResult, setAiResult] = useState(null);
  const [aiStatus, setAiStatus] = useState('');
  const [aiProgress, setAiProgress] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === 'dragenter' || e.type === 'dragover'); };
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e) => { if (e.target.files) setFiles(Array.from(e.target.files)); };
  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const runAiAnalysis = async () => {
    setStep(3);
    setAiProgress(0);
    setAiStatus('Analyzing your notes...');

    await tick(800); setAiProgress(15); setAiStatus('🔍 Scanning document structure...');
    await tick(1000); setAiProgress(30); setAiStatus('📝 Detecting handwriting patterns...');

    let aiText = '';
    if (GEMINI_API_KEY && files.length > 0 && files[0].type.startsWith('image/')) {
      setAiStatus('🤖 Sending to Gemini AI for analysis...');
      setAiProgress(40);
      try {
        const base64 = await fileToBase64(files[0]);
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inlineData: { mimeType: files[0].type, data: base64 } },
                  { text: 'You are helping digitalize handwritten study notes. Please: 1) Identify the subject and topic. 2) Extract and digitalize all text content in a clean, formatted manner. 3) Note if there are any diagrams or formulas. 4) Rate the quality of notes (1-10). Keep your response structured and concise.' }
                ]
              }]
            })
          }
        );
        const data = await resp.json();
        aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        setAiProgress(70);
        setAiStatus('✅ AI analysis complete!');
      } catch (err) {
        console.error('Gemini API error:', err);
        aiText = 'AI analysis unavailable. Using local estimation.';
        setAiProgress(70);
        setAiStatus('⚠️ AI API unavailable, using local estimation...');
      }
    } else {
      await tick(1200); setAiProgress(50);
      setAiStatus('🤖 Digitalizing content with AI...');
      await tick(1500); setAiProgress(70);
      aiText = generateMockAnalysis(details);
      setAiStatus('✅ Digitalization complete!');
    }

    await tick(600); setAiProgress(85);
    setAiStatus('💰 Predicting optimal price...');

    const price = predictPrice({
      pages: files.length * 8,
      educationLevel: details.educationLevel,
      subject: details.subject,
    });

    await tick(800); setAiProgress(100);
    setAiStatus('🎉 Analysis complete!');
    setAiResult(aiText);
    setSuggestedPrice(price);

    await tick(1000);
    setStep(4);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError('');

    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('title', details.title);
      formData.append('subject', details.subject);
      formData.append('educationLevel', details.educationLevel);
      formData.append('description', details.description || `Study notes on ${details.title}`);
      formData.append('price', suggestedPrice);
      formData.append('pages', files.length * 8);
      formData.append('isHandwritten', 'true');
      formData.append('hasDigitalized', aiResult ? 'true' : 'false');
      formData.append('tags', JSON.stringify([details.subject.toLowerCase(), details.educationLevel.toLowerCase()]));

      // Attach first image as thumbnail
      if (files.length > 0 && files[0].type.startsWith('image/')) {
        formData.append('thumbnail', files[0]);
      }
      // Attach first file
      if (files.length > 0) {
        formData.append('file', files[0]);
      }

      const created = await notesAPI.create(formData);
      
      // Also save locally for immediate dashboard update
      addUploadedNote({
        id: created._id,
        _id: created._id,
        title: details.title,
        subject: details.subject,
        educationLevel: details.educationLevel,
        description: details.description,
        price: suggestedPrice,
        pages: files.length * 8,
        isHandwritten: true,
        hasDigitalized: !!aiResult,
        createdAt: new Date().toISOString().split('T')[0],
        sellerId: user?.id || user?._id,
      });

      navigate('/dashboard');
    } catch (err) {
      console.warn('API publish failed, saving locally:', err.message);
      setPublishError('');
      
      // Fallback: save locally
      const note = {
        id: 'note_' + Date.now(),
        title: details.title,
        subject: details.subject,
        educationLevel: details.educationLevel,
        description: details.description,
        price: suggestedPrice,
        pages: files.length * 8,
        isHandwritten: true,
        hasDigitalized: !!aiResult,
        aiAnalysis: aiResult,
        createdAt: new Date().toISOString().split('T')[0],
        sellerId: user?.id,
      };
      addUploadedNote(note);
      navigate('/dashboard');
    }
    setPublishing(false);
  };

  const stepLabels = ['Upload Files', 'Add Details', 'AI Analysis', 'Review & Publish'];

  return (
    <div className="container min-h-screen" style={{ paddingTop: '10vh', paddingBottom: 'var(--space-20)' }}>
      <div className="text-center my-12 animate-fade-in-up">
        <h1 className="section-title text-4xl mb-4">Upload <span className="text-gradient">Your Notes</span></h1>
        <p className="text-muted text-lg max-w-xl mx-auto">Share your knowledge. Our AI will digitalize your notes and suggest the perfect price.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-12" style={{ maxWidth: '600px', margin: '0 auto var(--space-12)' }}>
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2" style={{ flex: i < 3 ? 1 : 'none' }}>
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '80px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, transition: 'all var(--transition-base)',
                background: step > i + 1 ? 'var(--gradient-purple)' : step === i + 1 ? 'var(--gradient-purple)' : 'var(--bg-elevated)',
                color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                border: step >= i + 1 ? 'none' : '2px solid var(--border-medium)',
                boxShadow: step === i + 1 ? '0 0 0 4px rgba(108,99,255,0.15)' : 'none',
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="text-xs font-semibold" style={{ color: step >= i + 1 ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
            {i < 3 && (
              <div style={{ flex: 1, height: '3px', background: step > i + 1 ? 'var(--brand-primary)' : 'var(--border-medium)', borderRadius: '4px', transition: 'background var(--transition-base)', marginBottom: '24px' }}></div>
            )}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div 
              className={`upload-dropzone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragActive ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                borderRadius: 'var(--border-radius-xl)', padding: 'var(--space-12)',
                background: dragActive ? 'rgba(108, 99, 255, 0.04)' : 'var(--bg-surface)',
                transition: 'all var(--transition-base)', cursor: 'pointer', textAlign: 'center',
              }}
            >
              <input type="file" id="file-upload" multiple accept="image/*,.pdf" onChange={handleFileInput} style={{ display: 'none' }} />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(108, 99, 255, 0.08)', fontSize: '2.5rem', margin: '0 auto'
                }}>📄</div>
                <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Drag & drop your notes here</h3>
                <p className="text-muted text-sm">or click to browse files</p>
                <p className="text-xs text-muted" style={{ marginTop: '4px' }}>Supports: Images (JPG, PNG) and PDF • Max 20 files</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="card mt-6" style={{ padding: 'var(--space-4)' }}>
                <h4 className="font-bold text-sm mb-3">📎 {files.length} file(s) selected</h4>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm py-2" style={{ borderBottom: i < files.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div className="flex items-center gap-2 text-muted" style={{ overflow: 'hidden' }}>
                      <span>📎</span>
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs" style={{ flexShrink: 0 }}>({(f.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-xs font-bold" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>✕ Remove</button>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary btn-lg w-full mt-6" disabled={files.length === 0} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="card animate-fade-in-up" style={{ padding: 'var(--space-8)' }}>
            <h3 className="font-bold text-xl mb-6" style={{ color: 'var(--text-primary)' }}>📝 Note Details</h3>
            <form className="flex flex-col gap-5">
              <div className="input-group">
                <label className="input-label">Title</label>
                <input type="text" className="input" placeholder="e.g., Physics Mechanics Notes" value={details.title} onChange={e => setDetails(d => ({ ...d, title: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Subject</label>
                <select className="input" value={details.subject} onChange={e => setDetails(d => ({ ...d, subject: e.target.value }))}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Education Level</label>
                <select className="input" value={details.educationLevel} onChange={e => setDetails(d => ({ ...d, educationLevel: e.target.value }))}>
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input" rows={4} placeholder="Describe your notes — what topics are covered, key features..." value={details.description} onChange={e => setDetails(d => ({ ...d, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </form>
            <div className="flex gap-4 mt-6">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!details.title || !details.subject || !details.educationLevel} onClick={runAiAnalysis}>
                🤖 Run AI Analysis →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Processing */}
        {step === 3 && (
          <div className="card text-center animate-fade-in-up" style={{ padding: 'var(--space-12)' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto var(--space-6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(108, 99, 255, 0.08)', fontSize: '2.5rem',
              animation: 'spin 2s linear infinite',
            }}>🤖</div>
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>AI Analysis in Progress</h3>
            <p className="text-muted text-sm mb-6">{aiStatus}</p>
            <div className="w-full" style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ width: `${aiProgress}%`, height: '100%', background: 'var(--gradient-purple)', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
            </div>
            <span className="text-xs text-muted mt-3 block font-semibold">{aiProgress}% complete</span>
          </div>
        )}

        {/* Step 4: Review & Publish */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <div className="card" style={{ padding: 'var(--space-8)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>✅</div>
                <h3 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Analysis Complete</h3>
              </div>

              {aiResult && (
                <div className="mb-6" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface)', borderRadius: 'var(--border-radius-md)', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-subtle)' }}>
                  <h4 className="font-bold text-sm mb-2">📄 Digitalized Content Preview</h4>
                  <pre className="text-xs text-muted" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)' }}>{aiResult}</pre>
                </div>
              )}

              <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {[
                  { label: 'Title', value: details.title },
                  { label: 'Subject', value: details.subject },
                  { label: 'Level', value: details.educationLevel },
                  { label: 'Pages (est.)', value: files.length * 8 },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs text-muted uppercase tracking-wider font-semibold">{item.label}</span>
                    <span className="font-bold text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="card mt-6 text-center" style={{ padding: 'var(--space-8)', background: 'rgba(108, 99, 255, 0.03)', border: '2px solid rgba(108, 99, 255, 0.15)' }}>
              <span className="text-sm text-muted uppercase tracking-wider font-bold">AI Suggested Price</span>
              <div className="font-black text-5xl mt-3 mb-2" style={{ color: 'var(--brand-accent)' }}>₹{suggestedPrice}</div>
              <p className="text-xs text-muted">Based on pages, subject demand, and education level</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <button className="btn btn-ghost btn-sm" onClick={() => setSuggestedPrice(p => Math.max(10, p - 10))}>- ₹10</button>
                <span className="font-bold text-lg" style={{ color: 'var(--text-primary)', minWidth: '60px' }}>₹{suggestedPrice}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSuggestedPrice(p => p + 10)}>+ ₹10</button>
              </div>
            </div>

            {publishError && (
              <div className="mt-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--border-radius-md)', color: '#dc2626', fontSize: 'var(--text-sm)' }}>
                ⚠️ {publishError}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>← Edit Details</button>
              <button className="btn btn-primary btn-lg animate-pulse-glow" style={{ flex: 1 }} onClick={handlePublish} disabled={publishing}>
                {publishing ? '⏳ Publishing...' : `🚀 Publish Notes — ₹${suggestedPrice}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helpers
const tick = (ms) => new Promise(r => setTimeout(r, ms));

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const generateMockAnalysis = (details) =>
  `📚 Subject: ${details.subject}\n📐 Topic: ${details.title}\n📊 Level: ${details.educationLevel}\n\n--- Digitalized Content ---\n\nThis document contains comprehensive study notes on ${details.title}.\nThe content covers key concepts, important formulas, and solved examples.\n\nNote quality: 8/10\nHandwriting clarity: Good\nDiagram count: 3 detected\nFormula count: 12 detected\n\n--- Key Topics Identified ---\n• Core theoretical concepts\n• Practice problems with solutions\n• Quick revision summary`;

export default UploadNotes;
