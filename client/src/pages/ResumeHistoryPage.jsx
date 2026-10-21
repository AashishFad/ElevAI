import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, FileText, Eye, Download, Trash2, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getResumesApi, deleteResumeApi, getResumeDownloadUrlApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchResumes = () => {
    setLoading(true);
    getResumesApi()
      .then((data) => {
        if (data.success) {
          setResumes(data.resumes || []);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch resume history');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume? This will remove the file from storage and database.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteResumeApi(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const data = await getResumeDownloadUrlApi(id);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate download link');
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
          <span className="text-xs font-bold">Loading resume history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Resume Archive"
        subtitle="Manage, inspect extracted text, evaluate, download, or purge your uploaded resume versions."
        action={
          <Link to="/resume/analyzer">
            <GradientButton variant="primary" size="sm" icon={PlusCircle}>
              Upload New Resume
            </GradientButton>
          </Link>
        }
      />

      {error && (
        <Alert variant="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* History List Table / Cards */}
      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes uploaded yet"
          description="Upload your first resume in PDF or DOCX format or create one with AI Resume Builder to start your career journey."
          actionText="Upload Resume"
          actionLink="/resume/analyzer"
        />
      ) : (
        <div className="bg-[rgba(20,20,40,0.65)] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#CBD5E1]">
              <thead className="bg-[rgba(10,12,25,0.85)] text-[9px] font-black text-[#94A3B8] uppercase tracking-widest border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Activity & Usage</th>
                  <th className="px-6 py-4">File Size</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.08]">
                {resumes.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#F8FAFC]">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#06B6D4] border border-white/[0.1] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            to={`/resume/${item.id}`}
                            className="hover:text-[#06B6D4] transition-colors truncate max-w-xs block font-bold"
                          >
                            {item.originalFileName}
                          </Link>
                          <span className="text-[10px] text-[#64748B] font-mono block">
                            ID: {item.id.substring(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <GlowBadge
                        variant={
                          item.status === 'READY'
                            ? 'green'
                            : item.status === 'PROCESSING'
                            ? 'amber'
                            : item.status === 'FAILED'
                            ? 'pink'
                            : 'violet'
                        }
                        size="xs"
                      >
                        {item.status}
                      </GlowBadge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        {item._count?.applications > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#22D3A7]/15 text-[#22D3A7] border border-[#22D3A7]/30 font-bold">
                            {item._count.applications} Applied
                          </span>
                        ) : null}
                        {item._count?.analyses > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 font-bold">
                            {item._count.analyses} Evaluated
                          </span>
                        ) : null}
                        {item._count?.jobOptimizations > 0 ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#06B6D4]/15 text-[#67E8F9] border border-[#06B6D4]/30 font-bold">
                            {item._count.jobOptimizations} Matched
                          </span>
                        ) : null}
                        {!item._count?.applications && !item._count?.analyses && !item._count?.jobOptimizations && (
                          <span className="text-[#64748B] italic">Fresh</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-[#94A3B8] font-mono text-xs">
                      {formatBytes(item.fileSize)}
                    </td>

                    <td className="px-6 py-4 text-[#94A3B8] text-xs font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/resume/${item.id}`}
                          title="View Details & Extracted Text"
                          className="p-2 text-[#94A3B8] hover:text-[#06B6D4] hover:bg-white/[0.08] rounded-xl transition-colors inline-block"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDownload(item.id, item.originalFileName)}
                          title="Download Resume via Signed URL"
                          className="p-2 text-[#94A3B8] hover:text-[#22D3A7] hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title={item._count?.applications > 0 ? 'Locked: Linked to active job application' : 'Delete Resume'}
                          className="p-2 text-[#94A3B8] hover:text-[#EC4899] hover:bg-[#EF4444]/10 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {deletingId === item.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-[#EC4899]" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
