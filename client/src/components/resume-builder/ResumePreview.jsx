import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

export default function ResumePreview({ doc, isPrint = false }) {
  if (!doc) return null;

  const {
    template = 'classic',
    personalInfo = {},
    summary,
    skills = [],
    education = [],
    projects = [],
    experience = [],
    certifications = [],
    achievements = [],
    languages = [],
    customSections = [],
    sectionOrder = [],
  } = doc;

  const order = sectionOrder.length > 0
    ? sectionOrder
    : ['summary', 'skills', 'projects', 'experience', 'education', 'certifications', 'achievements', 'languages', 'customSections'];

  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'summary':
        if (!summary || !summary.trim()) return null;
        return (
          <div key="summary" className="space-y-1.5 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Professional Summary
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        );

      case 'skills':
        if (!skills || skills.length === 0) return null;
        return (
          <div key="skills" className="space-y-2 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Technical & Professional Skills
            </h3>
            <div className="space-y-1 text-xs">
              {skills.map((sk, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-semibold text-slate-900">{sk.category}:</span>
                  <span className="text-slate-700">
                    {Array.isArray(sk.items) ? sk.items.join(', ') : sk.items}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!projects || projects.length === 0) return null;
        return (
          <div key="projects" className="space-y-3 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Key Technical Projects
            </h3>
            <div className="space-y-3">
              {projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{proj.name}</span>
                    {proj.startDate && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {proj.startDate} {proj.endDate ? `- ${proj.endDate}` : ''}
                      </span>
                    )}
                  </div>
                  {proj.technologies && (
                    <div className="text-[11px] font-semibold text-indigo-700">
                      Technologies: {Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">{proj.description}</p>
                  )}
                  {Array.isArray(proj.bullets) && proj.bullets.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 pl-1">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        if (!experience || experience.length === 0) return null;
        return (
          <div key="experience" className="space-y-3 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Professional Experience
            </h3>
            <div className="space-y-3">
              {experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{exp.position}</span>
                      <span className="text-xs font-semibold text-slate-700"> — {exp.company}</span>
                      {exp.location && <span className="text-[11px] text-slate-500"> ({exp.location})</span>}
                    </div>
                    {exp.startDate && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {exp.startDate} {exp.current ? '- Present' : exp.endDate ? `- ${exp.endDate}` : ''}
                      </span>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">{exp.description}</p>
                  )}
                  {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5 pl-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!education || education.length === 0) return null;
        return (
          <div key="education" className="space-y-2 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Education & Academic Background
            </h3>
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{edu.degree}</span>
                    {edu.field && <span className="text-xs text-slate-800"> in {edu.field}</span>}
                    <span className="text-xs text-slate-700"> — {edu.institution}</span>
                    {edu.gpa && <span className="text-[11px] font-semibold text-slate-600"> (CGPA/Grade: {edu.gpa})</span>}
                  </div>
                  {edu.startDate && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications || certifications.length === 0) return null;
        return (
          <div key="certifications" className="space-y-2 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Certifications & Training
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              {certifications.map((cert, idx) => (
                <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{cert.name}</span>
                    {cert.organization && <span> — {cert.organization}</span>}
                  </div>
                  {cert.issueDate && <span className="text-[11px] text-slate-500 font-mono">{cert.issueDate}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!achievements || achievements.length === 0) return null;
        return (
          <div key="achievements" className="space-y-2 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Key Achievements & Honors
            </h3>
            <div className="space-y-1 text-xs text-slate-700">
              {achievements.map((ach, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900">{ach.title}</span>
                    {ach.date && <span className="text-[11px] text-slate-500 font-mono">{ach.date}</span>}
                  </div>
                  {ach.description && <p className="text-[11px] text-slate-600">{ach.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages || languages.length === 0) return null;
        return (
          <div key="languages" className="space-y-1.5 break-inside-avoid">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
              Languages Spoken
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
              {languages.map((lang, idx) => (
                <span key={idx}>
                  <strong className="text-slate-900">{lang.language}</strong>
                  {lang.proficiency ? ` (${lang.proficiency})` : ''}
                </span>
              ))}
            </div>
          </div>
        );

      case 'customSections':
        if (!customSections || customSections.length === 0) return null;
        return (
          <React.Fragment key="customSections">
            {customSections.map((sec, idx) => {
              if (!sec.sectionTitle || !sec.items) return null;
              return (
                <div key={idx} className="space-y-1.5 break-inside-avoid">
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${template === 'modern' ? 'text-indigo-700 border-b border-indigo-200 pb-1' : template === 'minimal' ? 'text-slate-800 border-b border-slate-300 pb-1' : 'text-slate-900 border-b-2 border-slate-900 pb-1'}`}>
                    {sec.sectionTitle}
                  </h3>
                  <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {Array.isArray(sec.items) ? sec.items.join('\n') : sec.items}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div
      id="printable-resume"
      className={`w-full bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm font-sans space-y-6 ${
        template === 'modern' ? 'border-l-8 border-indigo-600' : ''
      } ${isPrint ? 'p-0 shadow-none' : ''}`}
      style={{ minHeight: '1056px', width: '100%', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Header Personal Info */}
      <div className={`space-y-2 pb-4 ${template === 'classic' ? 'text-center border-b-2 border-slate-900' : template === 'modern' ? 'border-b border-indigo-200' : 'border-b border-slate-300'}`}>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        {personalInfo.professionalTitle && (
          <div className="text-xs font-bold text-indigo-700 tracking-wider uppercase">
            {personalInfo.professionalTitle}
          </div>
        )}

        {/* Contact Info Pills */}
        <div className={`flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-medium ${template === 'classic' ? 'justify-center' : ''}`}>
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" />
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-slate-500" />
              <span>{personalInfo.linkedin}</span>
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <Github className="w-3 h-3 text-slate-500" />
              <span>{personalInfo.github}</span>
            </span>
          )}
          {personalInfo.portfolio && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-500" />
              <span>{personalInfo.portfolio}</span>
            </span>
          )}
        </div>
      </div>

      {/* Render Dynamic Ordered Sections */}
      <div className="space-y-5">
        {order.map((sectionKey) => renderSection(sectionKey))}
      </div>
    </div>
  );
}
