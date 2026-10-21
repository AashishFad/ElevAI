import React from 'react';
import { Sparkles, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AIWritingModal({
  isOpen,
  onClose,
  originalText,
  improvedText,
  explanation,
  onApply,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Writing Suggestion</h3>
              <p className="text-xs text-slate-400">Review AI-enhanced professional wording & active verb phrasing.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factual Safety Disclaimer */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            ElevAI AI improves grammar, active verbs, and technical clarity. It strictly preserves your facts and will never invent non-existent experience.
          </span>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Original Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Original Content</span>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 min-h-28 leading-relaxed font-sans">
              {originalText || '(Empty)'}
            </div>
          </div>

          {/* AI Refined Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Refined Suggestion</span>
            </span>
            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/30 text-xs text-white min-h-28 leading-relaxed font-sans">
              {improvedText || '(No suggestion generated)'}
            </div>
          </div>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-white block mb-1">Why this is better:</span>
            <p className="text-slate-400 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Keep Original
          </button>

          <button
            type="button"
            onClick={() => {
              onApply(improvedText);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Use Suggestion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
