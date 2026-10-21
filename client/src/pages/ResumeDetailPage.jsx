import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  ArrowLeft,
  AlertCircle,
  FileCheck,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Wand2,
  Briefcase,
  Layers,
  Send,
  Target,
  RefreshCw,
} from 'lucide-react';
import {
  getResumeByIdApi,
  getResumeDownloadUrlApi,
  getResumeAnalysesApi,
  analyzeResumeApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import Alert from '../components/ui/Alert';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getResumeByIdApi(id), getResumeAnalysesApi(id)])
      .then(([resData, analysisData]) => {
        if (isMounted) {
          if (resData.success) setResume(resData.resume);
          if (analysisData.success) setAnalyses(analysisData.analyses || []);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch resume details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDownload = async () => {
    try {
      const data = await getResumeDownloadUrlApi(id);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate download link');
    }
  };

  const handleAnalyze = async () => {
    setError('');
    setAnalyzing(true);
    try {
      const data = await analyzeResumeApi(id);
      if (data.success && data.analysis) {
        navigate(`/resume/${id}/analysis/${data.analysis.id}`);
      }
    } catch (err) {
      setError(err.message || 'AI analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyText = () => {
    if (resume?.extractedText) {
      navigator.clipboard.writeText(resume.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-16 animate-fade-in">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold">Loading resume dossier...</span>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-4 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#F8FAFC]">{error || 'Resume not found'}</h2>
        <Link to="/history">
          <GradientButton variant="glass" size="sm" icon={ArrowLeft}>
            Back to Resume History
          </GradientButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 animate-fade-in">
      {/* Back link */}
      <div>
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resume Archive</span>
        </Link>
      </div>

      {error && (
        <Alert variant="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Header Card */}
      <GlassCard className="p-6 sm:p-7 space-y-4" glowVariant="violet">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#06B6D4] border border-white/[0.1] flex items-center justify-center shrink-0 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-black text-[#F8FAFC]">{resume.originalFileName}</h1>
                <GlowBadge
                  variant={resume.status === 'READY' ? 'green' : resume.status === 'FAILED' ? 'pink' : 'amber'}
                  size="xs"
                >
                  {resume.status}
                </GlowBadge>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1 font-mono">
                Size: {formatBytes(resume.fileSize)} • Type: {resume.fileType} • Uploaded:{' '}
                {new Date(resume.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <GradientButton
              onClick={handleDownload}
              variant="glass"
              size="sm"
              icon={Download}
            >
              Download File
            </GradientButton>

            {resume.status === 'READY' && (
              <GradientButton
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="primary"
                size="sm"
                icon={analyzing ? RefreshCw : Sparkles}
              >
                {analyzing ? 'Evaluating...' : 'AI Analyze'}
              </GradientButton>
            )}
          </div>
        </div>

        {/* Quick Launch Pipeline */}
        <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/resumes/upload"
            className="p-3 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl hover:border-[#8B5CF6]/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC] group-hover:text-[#A78BFA]">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>AI Evaluation</span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Score vs Target Role</p>
          </Link>

          <Link
            to="/jobs"
            className="p-3 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl hover:border-[#06B6D4]/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC] group-hover:text-[#06B6D4]">
              <Briefcase className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Explore Jobs</span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Active Requisitions</p>
          </Link>

          <Link
            to="/applications"
            className="p-3 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl hover:border-[#3B82F6]/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC] group-hover:text-[#60A5FA]">
              <Send className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Applications</span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Track Submissions</p>
          </Link>

          <Link
            to="/mock-interview"
            className="p-3 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl hover:border-[#F59E0B]/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC] group-hover:text-[#FBBF24]">
              <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Mock Interview</span>
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">Practice AI Drill</p>
          </Link>
        </div>
      </GlassCard>

      {/* Analyses History Section */}
      <GlassCard className="p-6 space-y-4" glowVariant="violet">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">AI Evaluation History</h2>
          </div>
          <span className="text-xs text-[#94A3B8] font-mono">{analyses.length} Analysis Runs</span>
        </div>

        {analyses.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#94A3B8] space-y-2 bg-[rgba(10,12,25,0.7)] rounded-2xl border border-white/[0.06]">
            <p>This resume has not been evaluated by Gemini AI yet.</p>
            {resume.status === 'READY' && (
              <GradientButton
                onClick={handleAnalyze}
                disabled={analyzing}
                variant="primary"
                size="xs"
                icon={Sparkles}
              >
                Run First AI Analysis
              </GradientButton>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map((an) => (
              <div
                key={an.id}
                className="p-4 bg-[rgba(10,12,25,0.7)] border border-white/[0.08] rounded-2xl flex items-center justify-between gap-4 hover:border-white/[0.2] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F8FAFC]">
                      Target: {an.careerGoal?.targetRole || 'Software Role'}
                    </span>
                    <GlowBadge variant={an.overallScore >= 80 ? 'green' : 'violet'} size="xs">
                      Score: {an.overallScore}/100
                    </GlowBadge>
                  </div>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    Evaluated on {new Date(an.createdAt).toLocaleString()}
                  </p>
                </div>

                <Link to={`/resume/${id}/analysis/${an.id}`}>
                  <GradientButton variant="glass" size="xs" icon={ArrowRight}>
                    View Report
                  </GradientButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Extracted Text Section */}
      <GlassCard className="p-6 space-y-4" glowVariant="cyan">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Extracted Text (AI Knowledge Context)</h2>
          </div>

          {resume.extractedText && (
            <button
              type="button"
              onClick={handleCopyText}
              className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.2] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22D3A7]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          )}
        </div>

        {resume.extractedText ? (
          <pre className="p-4 bg-[rgba(10,12,25,0.9)] border border-white/[0.08] rounded-2xl text-xs font-mono text-[#CBD5E1] leading-relaxed overflow-x-auto max-h-96 whitespace-pre-wrap">
            {resume.extractedText}
          </pre>
        ) : (
          <div className="p-8 text-center text-[#64748B] text-xs italic">
            No extracted text available for this document. Status: {resume.status}.
          </div>
        )}
      </GlassCard>
    </div>
  );
}
