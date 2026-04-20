import { motion } from "framer-motion";
import { Card } from "../common/Card";
import { SectionHeader } from "../common/SectionHeader";
import { Badge } from "../common/Badge";

interface JobMatch {
  title: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  reason: string;
}

export function JobMatchingPanel({ matches }: { matches: JobMatch[] }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="space-y-4">
      <SectionHeader 
        title="Job Recommendations" 
        subtitle="Roles that match your skill profile" 
      />
      
      <div className="grid gap-4">
        {matches.map((job, idx) => (
          <motion.div
            key={job.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:border-primary/40 transition-colors group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-text group-hover:text-primary transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-[11px] text-muted leading-relaxed mt-1">
                    {job.reason}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    job.match_percentage >= 80 ? 'text-green-500' : 
                    job.match_percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {job.match_percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${job.match_percentage}%` }}
                  className={`h-full rounded-full ${
                    job.match_percentage >= 80 ? 'bg-green-500' : 
                    job.match_percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>

              {/* Skills Breakdown */}
              <div className="flex flex-wrap gap-1.5">
                {job.matched_skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 font-medium">
                    {skill}
                  </span>
                ))}
                {job.missing_skills.slice(0, 2).map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 font-medium">
                    -{skill}
                  </span>
                ))}
              </div>

              <button className="w-full mt-4 py-2 rounded-lg border border-border/60 text-[11px] font-bold uppercase tracking-wider hover:bg-primary/10 hover:border-primary/40 transition-all">
                View Detailed Requirements
              </button>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
