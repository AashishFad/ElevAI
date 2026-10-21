import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  History,
  FileCheck,
  Sparkles,
  Target,
  File,
  Zap,
} from 'lucide-react';
import { uploadResumeApi, getCareerGoalApi, analyzeResumeApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import AIOrb from '../components/ui/AIOrb';

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);

  const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
  const MAX_SIZE_MB = 5;

  useEffect(() => {
    let isMounted = true;
    getCareerGoalApi()
      .then((data) => {
        if (isMounted && data.success) {
          setCareerGoal(data.careerGoal);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const validateFile = (file) => {
    if (!file) return false;
    const name = file.name || '';
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Invalid file format. Please upload a PDF (.pdf) or Word (.docx) document.');
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Resume file size exceeds maximum limit of ${MAX_SIZE_MB} MB.`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError('');
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const data = await uploadResumeApi(formData);
      if (data.success && data.resume) {
        setUploadResult(data.resume);
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload and parse resume text.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzeClick = async (resumeId) => {
    if (!careerGoal) {
      setError('Please set your career goal before analyzing your resume.');
      return;
    }

    setError('');
    setAnalyzing(true);
    try {
      const data = await analyzeResumeApi(resumeId);
      if (data.success && data.analysis) {
        navigate(`/resume/${resumeId}/analysis/${data.analysis.id}`);
      }
    } catch (err) {
      setError(err.message || 'AI Resume evaluation encountered an error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="AI Resume Analyzer"
        subtitle="Upload your resume for multi-dimensional ATS scoring, recruiter readability feedback, and impact metric checks."
        action={
          <Link to="/history">
            <GradientButton variant="glass" size="sm" icon={History}>
              Resume History
            </GradientButton>
          </Link>
        }
      />

      {/* Target Benchmark Glass Card */}
      <GlassCard className="p-5" glowVariant="violet">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 flex items-center justify-center shrink-0 shadow-inner">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest">Active Benchmark Target</div>
              <div className="text-sm font-bold text-[#F8FAFC] mt-0.5">
                {careerGoal ? `${careerGoal.targetRole} (${careerGoal.experienceLevel})` : 'No career benchmark configured'}
              </div>
            </div>
          </div>

          {!careerGoal && (
            <Link to="/career-goal">
              <GradientButton variant="primary" size="xs">
                Set Career Goal
              </GradientButton>
            </Link>
          )}
        </div>
      </GlassCard>

      {error && (
        <Alert variant="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Interactive Dropzone */}
      <form onSubmit={handleUploadSubmit} className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all duration-300 flex flex-col items-center justify-center space-y-5 overflow-hidden backdrop-blur-xl ${
            dragActive
              ? 'border-[#8B5CF6] bg-[#8B5CF6]/15 shadow-[0_0_40px_rgba(139,92,246,0.3)] scale-[1.01]'
              : selectedFile
              ? 'border-[#22D3A7]/50 bg-[#22D3A7]/5 shadow-[0_0_30px_rgba(34,211,167,0.2)]'
              : 'border-white/[0.12] bg-[rgba(20,20,40,0.55)] hover:border-white/30 hover:bg-[rgba(24,24,48,0.7)]'
          }`}
        >
          {/* Scanning laser animation line if uploading or analyzing */}
          {(uploading || analyzing) && (
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent shadow-[0_0_15px_#06B6D4] animate-scan-line z-20" />
          )}

          <div className="relative">
            <AIOrb size="lg" state={uploading || analyzing ? 'thinking' : 'idle'} />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-base sm:text-lg font-black text-[#F8FAFC]">
              {selectedFile ? selectedFile.name : 'Drag & drop your resume file here'}
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {selectedFile
                ? `File size: ${formatBytes(selectedFile.size)} — Ready for upload`
                : 'Supports PDF (.pdf) and Microsoft Word (.docx) documents up to 5 MB'}
            </p>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFC] font-bold text-xs cursor-pointer transition-all border border-white/[0.12] hover:border-white/25 shadow-lg backdrop-blur-md">
              <File className="w-4 h-4 text-[#06B6D4]" />
              <span>Browse Local Files</span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Submit Upload Button */}
        {selectedFile && (
          <div className="flex justify-end animate-fade-in">
            <GradientButton
              type="submit"
              disabled={uploading}
              loading={uploading}
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
            >
              Upload & Extract Resume Text
            </GradientButton>
          </div>
        )}
      </form>

      {/* Upload Success Banner with Analyze Action */}
      {uploadResult && (
        <GlassCard className="p-6 space-y-4" glowVariant="green">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#22D3A7]" />
              <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC]">Resume Parsed & Ready for AI Evaluation</h2>
            </div>
            <GlowBadge variant="green" size="xs">
              {uploadResult.status}
            </GlowBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[rgba(10,12,25,0.7)] p-4 rounded-2xl border border-white/[0.08]">
            <div>
              <span className="text-[#94A3B8]">File Name:</span>
              <p className="font-bold text-[#F8FAFC] truncate mt-0.5">{uploadResult.originalFileName}</p>
            </div>
            <div>
              <span className="text-[#94A3B8]">File Size:</span>
              <p className="font-bold text-[#F8FAFC] mt-0.5">{formatBytes(uploadResult.fileSize)}</p>
            </div>
            <div>
              <span className="text-[#94A3B8]">Upload Date:</span>
              <p className="font-bold text-[#F8FAFC] mt-0.5">{new Date(uploadResult.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to={`/resume/${uploadResult.id}`}>
              <GradientButton variant="glass" size="sm" icon={FileCheck}>
                Preview Extracted Text
              </GradientButton>
            </Link>

            <GradientButton
              onClick={() => handleAnalyzeClick(uploadResult.id)}
              disabled={analyzing}
              loading={analyzing}
              variant="ai"
              size="sm"
              icon={Sparkles}
            >
              Analyze Resume with AI
            </GradientButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
