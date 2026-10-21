import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  Send,
  FastForward,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  ArrowRight,
  XCircle,
  BookOpen,
  Keyboard,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import {
  getInterviewByIdApi,
  submitAnswerApi,
  abandonInterviewApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import AIOrb from '../components/ui/AIOrb';
import Alert from '../components/ui/Alert';

export default function MockInterviewSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const fetchSession = () => {
    setLoading(true);
    getInterviewByIdApi(sessionId)
      .then((data) => {
        if (data.success) {
          const sess = data.session;
          setSession(sess);

          if (sess.status === 'COMPLETED') {
            navigate(`/mock-interview/${sessionId}/result`, { replace: true });
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview session');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSession();
    setStartTime(Date.now());
  }, [sessionId]);

  const questions = session?.questions || [];
  const currentIndex = session?.currentQuestionIndex || 0;
  const currentQuestion = questions[currentIndex] || questions[questions.length - 1];

  const handleSubmitAnswer = async (isSkipped = false) => {
    if (!currentQuestion) return;

    if (!isSkipped && (!answerText || answerText.trim().length === 0)) {
      setError('Please type your response before submitting, or choose "Skip Question".');
      return;
    }

    setError('');
    setSubmitting(true);

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const wordCount = answerText.trim().split(/\s+/).filter(Boolean).length;

    try {
      const data = await submitAnswerApi(sessionId, currentQuestion.id, {
        answerText: isSkipped ? '(Skipped)' : answerText.trim(),
        inputMode: 'TEXT',
        durationSeconds: elapsedSeconds,
        wordCount: isSkipped ? 0 : wordCount,
        isSkipped,
      });

      const evalObj = data.evaluation || data.answer;
      if (data.success && evalObj) {
        setEvaluation(evalObj);
        setShowIdealAnswer(false);
      } else if (data.success && data.progress?.isCompleted) {
        navigate(`/mock-interview/${sessionId}/result`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length || session?.status === 'COMPLETED') {
      navigate(`/mock-interview/${sessionId}/result`, { replace: true });
      return;
    }
    setEvaluation(null);
    setAnswerText('');
    setShowIdealAnswer(false);
    setStartTime(Date.now());
    fetchSession();
  };

  const handleAbandon = async () => {
    if (window.confirm('Are you sure you want to exit this mock interview session?')) {
      try {
        await abandonInterviewApi(sessionId);
        navigate('/mock-interview');
      } catch (_) {
        navigate('/mock-interview');
      }
    }
  };

  if (loading && !session) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <AIOrb size="md" state="thinking" showIcon={false} />
        <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
          Loading Interview Session...
        </span>
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <GlassCard className="p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-[#F8FAFC]">Interview Session Not Found</h2>
          <p className="text-xs text-[#94A3B8]">{error || 'Unable to access this session.'}</p>
          <Link to="/mock-interview">
            <GradientButton variant="primary" size="sm">
              Back to Interview Setup
            </GradientButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + (evaluation ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GlowBadge variant="violet" size="xs">
              {session.type} Drill
            </GlowBadge>
            <GlowBadge variant="cyan" size="xs">
              {session.difficulty}
            </GlowBadge>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-[#F8FAFC]">
            {session.targetRole}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-[#F8FAFC] block">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-[10px] text-[#64748B] block">{progressPercent}% Completed</span>
          </div>

          <button
            onClick={handleAbandon}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Exit Session"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* QUESTION CARD */}
      <GlassCard glowVariant="cyan" className="p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AIOrb size="sm" state={submitting ? 'thinking' : 'speaking'} showIcon={false} />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#06B6D4] tracking-wider block">
                AI Technical Interviewer
              </span>
              <span className="text-xs text-[#64748B]">Question {currentIndex + 1}</span>
            </div>
          </div>
          <GlowBadge variant="cyan" size="xs">
            {currentQuestion?.category || session.type}
          </GlowBadge>
        </div>

        <div className="pt-2">
          <p className="text-sm sm:text-base font-semibold text-[#F8FAFC] leading-relaxed">
            "{currentQuestion?.questionText}"
          </p>
        </div>

        {/* Expected Key Topics */}
        {Array.isArray(currentQuestion?.expectedTopics) && currentQuestion.expectedTopics.length > 0 && (
          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mr-1">
              Expected Topics:
            </span>
            {currentQuestion.expectedTopics.map((topic) => (
              <span
                key={topic}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] text-[#94A3B8] border border-white/[0.06]"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      {/* ANSWER SECTION / EVALUATION SCORECARD */}
      {!evaluation ? (
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F8FAFC]">
              <Keyboard className="w-4 h-4 text-[#8B5CF6]" />
              <span>Your Typed Response</span>
            </div>
            <span className="text-[11px] text-[#64748B]">
              {answerText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={submitting}
            rows={7}
            placeholder="Type your structured answer here. Be specific, articulate trade-offs, and reference practical architectural or code experience..."
            className="w-full bg-[#070714]/80 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6] transition-colors resize-y leading-relaxed font-sans"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmitAnswer(true)}
              disabled={submitting}
              className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors py-2"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip Question</span>
            </button>

            <GradientButton
              type="button"
              variant="primary"
              size="md"
              icon={Send}
              loading={submitting}
              disabled={submitting || !answerText.trim()}
              onClick={() => handleSubmitAnswer(false)}
            >
              {submitting ? 'Evaluating with AI...' : 'Submit Answer for AI Review'}
            </GradientButton>
          </div>
        </GlassCard>
      ) : (
        /* INSTANT AI EVALUATION SCORECARD */
        <GlassCard glowVariant="green" className="p-6 sm:p-8 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F8FAFC]">AI Evaluation Scorecard</h3>
              </div>
              <p className="text-xs text-[#94A3B8]">Constructive technical feedback and scoring.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-2xl font-black text-emerald-400">
                  {evaluation.score?.toFixed(1) || '0.0'}
                </span>
                <span className="text-[9px] text-[#64748B] block uppercase font-bold">Overall Score / 10</span>
              </div>
            </div>
          </div>

          {/* Dimension Scores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
              <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Technical Depth</span>
              <span className="text-sm font-bold text-[#06B6D4] mt-0.5 block">
                {evaluation.technicalScore?.toFixed(1) || '—'}/10
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
              <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Communication</span>
              <span className="text-sm font-bold text-[#A78BFA] mt-0.5 block">
                {evaluation.communicationScore?.toFixed(1) || '—'}/10
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
              <span className="text-[10px] uppercase text-[#64748B] font-semibold block">Relevance</span>
              <span className="text-sm font-bold text-[#EC4899] mt-0.5 block">
                {evaluation.relevanceScore?.toFixed(1) || '—'}/10
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <span className="text-xs font-bold text-[#F8FAFC]">Evaluator Feedback:</span>
            <p className="text-xs text-[#94A3B8] leading-relaxed">{evaluation.feedback}</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Key Strengths
              </span>
              <ul className="text-xs text-[#94A3B8] space-y-1 list-disc list-inside">
                {(evaluation.strengths || []).map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Improvement Areas
              </span>
              <ul className="text-xs text-[#94A3B8] space-y-1 list-disc list-inside">
                {(evaluation.weaknesses || []).map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benchmark Ideal Answer */}
          {evaluation.idealAnswer && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                className="text-xs font-bold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showIdealAnswer ? 'Hide Benchmark Answer' : 'View Ideal Benchmark Answer'}</span>
              </button>

              {showIdealAnswer && (
                <div className="p-4 rounded-xl bg-[#070714] border border-[#8B5CF6]/30 text-xs text-[#E2E8F0] leading-relaxed animate-fade-in">
                  {evaluation.idealAnswer}
                </div>
              )}
            </div>
          )}

          {/* Next Action */}
          <div className="pt-2 flex justify-end">
            <GradientButton
              type="button"
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={handleNextQuestion}
            >
              {currentIndex + 1 < questions.length ? 'Next Question' : 'Complete & View Results'}
            </GradientButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
