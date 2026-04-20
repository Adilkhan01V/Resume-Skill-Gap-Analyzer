import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "../common/Badge";

interface StructuredResumeEditorProps {
  data: any;
  onChange: (newData: any) => void;
  readOnly?: boolean;
}

export function StructuredResumeEditor({ data, onChange, readOnly = false }: StructuredResumeEditorProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const handleFieldChange = useCallback((field: string, value: any) => {
    const newData = { ...data };
    if (field.includes('.')) {
      const parts = field.split('.');
      // Deep path: e.g. "experience.0.points.1"
      let target = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (Array.isArray(target[key]) && !isNaN(Number(parts[i + 1]))) {
          target[key] = [...target[key]];
        }
        if (typeof target[key] === 'object' && target[key] !== null) {
          target[key] = Array.isArray(target[key]) ? [...target[key]] : { ...target[key] };
        }
        target = target[key];
      }
      target[parts[parts.length - 1]] = value;
    } else {
      newData[field] = value;
    }
    onChange(newData);
  }, [data, onChange]);

  /** Inline editable text field */
  const EditableField = ({
    value,
    field,
    placeholder,
    multiline = false,
    className = "",
  }: {
    value: string;
    field: string;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
  }) => {
    const [localValue, setLocalValue] = useState(value || "");

    const handleSave = () => {
      handleFieldChange(field, localValue);
      setEditingField(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        handleSave();
      } else if (e.key === 'Escape') {
        setLocalValue(value || "");
        setEditingField(null);
      }
    };

    if (editingField === field && !readOnly) {
      return (
        <div className="relative">
          {multiline ? (
            <textarea
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={`w-full p-2 bg-bg border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text resize-none ${className}`}
              autoFocus
              rows={3}
            />
          ) : (
            <input
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={`w-full p-2 bg-bg border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-text ${className}`}
              autoFocus
            />
          )}
        </div>
      );
    }

    return (
      <div
        onClick={() => !readOnly && setEditingField(field)}
        className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-primary/10'} p-1.5 rounded-lg transition-colors ${className}`}
      >
        {value || <span className="text-muted italic text-sm">{placeholder || "Click to edit"}</span>}
      </div>
    );
  };

  // ── Helper: safely convert an experience/project/education item that might
  //    be a plain string (from legacy serialisation) into an object.
  const toExpObj = (item: any) =>
    typeof item === "string"
      ? { role: item, company: "", dates: "", points: [] }
      : item ?? {};

  const toProjObj = (item: any) =>
    typeof item === "string"
      ? { name: item, description: [], technologies: [] }
      : item ?? {};

  const toEduObj = (item: any) =>
    typeof item === "string"
      ? { degree: item, school: "", dates: "", points: [] }
      : { ...item, points: item?.points ?? [] };

  const hasContent = (data: any): boolean => {
    if (!data) return false;
    return (
      data.name ||
      data.summary ||
      (data.skills && data.skills.length > 0) ||
      (data.experience && data.experience.length > 0) ||
      (data.projects && data.projects.length > 0) ||
      (data.education && data.education.length > 0)
    );
  };

  if (!hasContent(data)) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 text-muted">
        <div className="text-5xl mb-4 opacity-40">📄</div>
        <p className="text-sm font-medium">Resume data will appear here</p>
        <p className="text-xs mt-1 opacity-60">Upload a resume to see your parsed content</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-6 bg-[#0f0f1b] text-text custom-scrollbar">

      {/* ── Header: Name + Contact ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1 pb-3 border-b border-border/30"
      >
        <EditableField
          value={data?.name}
          field="name"
          placeholder="Your Full Name"
          className="text-2xl font-bold text-primary text-center"
        />
        <div className="flex flex-wrap justify-center gap-2 text-xs text-muted">
          {data?.contact && (
            <span className="flex items-center gap-1">
              <span className="opacity-60">📧</span>
              <EditableField value={data?.contact} field="contact" placeholder="email | phone" />
            </span>
          )}
          {data?.location && (
            <span className="flex items-center gap-1">
              <span className="opacity-60">📍</span>
              <EditableField value={data?.location} field="location" placeholder="City, Country" />
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Summary ───────────────────────────────────────────────────── */}
      {(data?.summary || !readOnly) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-1.5"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary/80">Summary</h2>
          <EditableField
            value={data?.summary}
            field="summary"
            placeholder="Professional summary..."
            multiline
            className="text-sm leading-relaxed text-text/90"
          />
        </motion.div>
      )}

      {/* ── Skills ────────────────────────────────────────────────────── */}
      {(data?.skills?.length > 0 || !readOnly) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary/80">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {(data?.skills || []).map((skill: any, index: number) => (
              <Badge
                key={index}
                label={typeof skill === 'string' ? skill : (skill?.name ?? "")}
                tone="default"
              />
            ))}
            {(!data?.skills || data.skills.length === 0) && (
              <span className="text-xs text-muted italic">No skills detected</span>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Experience ────────────────────────────────────────────────── */}
      {(data?.experience?.length > 0 || !readOnly) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary/80">Experience</h2>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-primary/30" />
            {(data?.experience || []).map((rawExp: any, index: number) => {
              const exp = toExpObj(rawExp);
              return (
                <div key={index} className="relative group">
                  <div className="absolute -left-[21px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-[#0f0f1b] z-10" />
                  <div className="space-y-1.5 p-3 bg-card/20 rounded-xl border border-border/30 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <EditableField
                      value={exp?.role ?? ""}
                      field={`experience.${index}.role`}
                      placeholder="Job Title"
                      className="text-sm font-semibold"
                    />
                    {exp?.company && (
                      <EditableField
                        value={exp.company}
                        field={`experience.${index}.company`}
                        placeholder=""
                        className="text-xs text-primary"
                      />
                    )}
                  </div>
                  <EditableField
                    value={exp?.dates ?? ""}
                    field={`experience.${index}.dates`}
                    placeholder="Jan 2022 – Present"
                    className="text-xs text-muted shrink-0"
                  />
                </div>
                {(exp?.points?.length > 0) && (
                  <ul className="space-y-1 pl-1">
                    {(exp.points || []).map((point: string, pIndex: number) => (
                      <li key={pIndex} className="flex items-start gap-2">
                        <span className="text-primary/70 mt-0.5 text-xs shrink-0">•</span>
                        <EditableField
                          value={point ?? ""}
                          field={`experience.${index}.points.${pIndex}`}
                          placeholder="Achievement or responsibility..."
                          className="text-xs leading-relaxed flex-1"
                        />
                      </li>
                    ))}
                  </ul>
                )}
                </div>
              </div>
            );
          })}
          </div>
        </motion.div>
      )}

      {/* ── Projects ──────────────────────────────────────────────────── */}
      {(data?.projects?.length > 0 || !readOnly) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary/80">Projects</h2>
          {(data?.projects || []).length === 0 && (
            <p className="text-xs text-muted italic">No projects detected</p>
          )}
          {(data?.projects || []).map((rawProj: any, index: number) => {
            const project = toProjObj(rawProj);
            return (
              <div key={index} className="space-y-1.5 p-3 bg-card/20 rounded-xl border border-border/30">
                <EditableField
                  value={project?.name ?? ""}
                  field={`projects.${index}.name`}
                  placeholder="Project Name"
                  className="text-sm font-semibold"
                />
                <ul className="space-y-1 pl-1">
                  {(project?.description || []).map((desc: string, dIndex: number) => (
                    <li key={dIndex} className="flex items-start gap-2">
                      <span className="text-primary/70 mt-0.5 text-xs shrink-0">•</span>
                      <EditableField
                        value={desc ?? ""}
                        field={`projects.${index}.description.${dIndex}`}
                        placeholder="Feature or achievement..."
                        className="text-xs leading-relaxed flex-1"
                      />
                    </li>
                  ))}
                </ul>
                {(project?.technologies?.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(project.technologies || []).map((tech: string, tIndex: number) => (
                      <Badge key={tIndex} label={tech} tone="secondary" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── Education ─────────────────────────────────────────────────── */}
      {(data?.education?.length > 0 || !readOnly) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3 pb-4"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary/80">Education</h2>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-primary/30" />
            {(() => {
              const items = (data?.education || []).map(toEduObj);
              const grouped: any[] = [];
              
              items.forEach((item: any) => {
                const isSupplement = !item.school || 
                  /gpa|award|scholarship|dean|honor|society|list/i.test(item.degree);
                
                if (isSupplement && grouped.length > 0) {
                  // Add as a point to the previous entry
                  grouped[grouped.length - 1].points = [
                    ...(grouped[grouped.length - 1].points || []),
                    item.degree
                  ];
                } else {
                  grouped.push({ ...item });
                }
              });

              return grouped.map((edu: any, index: number) => (
                <div key={index} className="relative group">
                  <div className="absolute -left-[21px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-[#0f0f1b] z-10" />
                  <div className="space-y-1.5 p-3 bg-card/20 rounded-xl border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <EditableField
                            value={edu?.degree ?? ""}
                            field={`education.${index}.degree`}
                            placeholder="Degree Name"
                            className="text-sm font-semibold text-white inline-block"
                          />
                          {edu?.school && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted uppercase font-bold opacity-60">at</span>
                              <EditableField
                                value={edu.school}
                                field={`education.${index}.school`}
                                placeholder="Institution"
                                className="text-sm text-primary font-medium inline-block"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <EditableField
                        value={edu?.dates ?? ""}
                        field={`education.${index}.dates`}
                        placeholder="2020 – 2024"
                        className="text-xs text-muted font-medium shrink-0 bg-bg/40 px-2 py-1 rounded-md"
                      />
                    </div>
                    
                    {/* Education Points (Awards, GPA, etc.) */}
                    <ul className="space-y-1 mt-3 pl-1">
                      {(edu.points || []).map((point: string, pIndex: number) => (
                        <li key={pIndex} className="flex items-start gap-2 group/point">
                          <span className="text-primary/70 mt-1 text-[8px] shrink-0">●</span>
                          <EditableField
                            value={point ?? ""}
                            field={`education.${index}.points.${pIndex}`}
                            placeholder="Award, GPA, or minor detail..."
                            className="text-xs leading-relaxed text-muted flex-1"
                          />
                        </li>
                      ))}
                      {!readOnly && (
                        <button 
                          onClick={() => {
                            const newPoints = [...(edu.points || []), ""];
                            handleFieldChange(`education.${index}.points`, newPoints);
                          }}
                          className="text-[10px] text-primary/60 hover:text-primary transition-colors pl-4 mt-1"
                        >
                          + Add detail
                        </button>
                      )}
                    </ul>
                  </div>
                </div>
              ));
            })()}
          </div>
        </motion.div>
      )}
    </div>
  );
}