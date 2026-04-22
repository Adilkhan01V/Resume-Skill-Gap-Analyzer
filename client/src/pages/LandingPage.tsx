import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { SectionHeader } from "../components/common/SectionHeader";
import { AnalysisLoadingOverlay } from "../components/common/AnalysisLoadingOverlay";
import { analyzeResume, getScore } from "../services/api";
import { storage } from "../services/storage";

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, index));
      index++;
      if (index > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

const BackgroundEffects = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
    
    {/* Floating Orbs */}
    <motion.div
      animate={{ y: [0, -30, 0], scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[10%] left-[15%] w-64 h-64 bg-primary/20 rounded-full blur-[80px]"
    ></motion.div>
    <motion.div
      animate={{ y: [0, 40, 0], scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-[40%] right-[10%] w-72 h-72 bg-accent/20 rounded-full blur-[90px]"
    ></motion.div>
    <motion.div
      animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[10%] left-[30%] w-56 h-56 bg-secondary/20 rounded-full blur-[70px]"
    ></motion.div>
  </div>
);

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [fileStatus, setFileStatus] = useState<"idle" | "uploading" | "success" | "analyzing" | "error">("idle");
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const jobRoles = [
    { 
      id: "frontend", 
      label: "Frontend Developer", 
      area: "Development",
      description: "Focuses on building the user interface and user experience using React, Vue, or Angular. Requires skills in HTML, CSS, JavaScript, and modern frontend frameworks."
    },
    { 
      id: "backend", 
      label: "Backend Developer", 
      area: "Development",
      description: "Specializes in server-side logic, database management, and API design. Requires proficiency in Python, Node.js, Java, or Go, along with SQL and NoSQL databases."
    },
    { 
      id: "fullstack", 
      label: "Full Stack Developer", 
      area: "Development",
      description: "Handles both frontend and backend development. Requires proficiency in React, Node.js, JavaScript, TypeScript, HTML, CSS, Python, SQL, PostgreSQL, MongoDB, REST APIs, Git, Docker, and modern web frameworks like Next.js or Express."
    },
    { 
      id: "data-scientist", 
      label: "Data Scientist", 
      area: "Data Science",
      description: "Analyzes complex data sets to extract insights. Requires skills in Python, R, machine learning, statistics, and data visualization."
    },
    { 
      id: "devops", 
      label: "DevOps Engineer", 
      area: "Infrastructure",
      description: "Focuses on automation, CI/CD pipelines, and infrastructure management. Requires knowledge of Docker, Kubernetes, AWS/Azure/GCP, and scripting."
    },
    { 
      id: "ui-ux", 
      label: "UI/UX Designer", 
      area: "Design",
      description: "Focuses on the visual aspects and user experience of a product. Requires skills in Figma, Adobe XD, user research, and prototyping."
    },
    { 
      id: "mobile-dev", 
      label: "Mobile Developer", 
      area: "Development",
      description: "Specializes in creating applications for mobile devices (iOS/Android). Requires skills in React Native, Flutter, Swift, or Kotlin."
    },
    { 
      id: "cyber-security", 
      label: "Cybersecurity Analyst", 
      area: "Security",
      description: "Protects systems and networks from digital attacks. Requires knowledge of network security, cryptography, and threat analysis."
    },
    { 
      id: "product-manager", 
      label: "Product Manager", 
      area: "Management",
      description: "Guides the development of a product from start to finish. Requires skills in market research, strategy, and project management."
    },
    { 
      id: "qa-engineer", 
      label: "QA Engineer", 
      area: "Testing",
      description: "Ensures the quality of software products through testing. Requires skills in manual testing, automation (Selenium, Jest), and bug tracking."
    }
  ];

  const [selectedArea, setSelectedArea] = useState<string>("All");
  const areas = ["All", ...Array.from(new Set(jobRoles.map(r => r.area)))];

  const filteredRoles = selectedArea === "All" 
    ? jobRoles 
    : jobRoles.filter(r => r.area === selectedArea);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 12 } }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileStatus("uploading");
      setUploadProgress(0);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setFileStatus("success");
            return 100;
          }
          return prev + 15;
        });
      }, 250);
    }
  };

  const handleAnalyze = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    const role = jobRoles.find(r => r.id === selectedRole);
    if (!file || !role || fileStatus !== "success") return;
    
    try {
      setFileStatus("analyzing");
      setCurrentAnalysisStep(0);
      
      // Step 0: Reading resume
      await new Promise(r => setTimeout(r, 800));
      setCurrentAnalysisStep(1);
      

      // Step 1: Analysis engine (extracting skills)
      const resumeData = await analyzeResume(file, role.description);

      
      setCurrentAnalysisStep(2);
      await new Promise(r => setTimeout(r, 600));
      
      // Step 3: Checking JD requirements
      setCurrentAnalysisStep(3);

      // Step 4: Scoring engine
      const scoreData = await getScore(resumeData, role.description);

      
      setCurrentAnalysisStep(4);
      await new Promise(r => setTimeout(r, 800));
      
      setCurrentAnalysisStep(5);
      await new Promise(r => setTimeout(r, 1000));
      
      // Save to history for persistence
      const historyItem = storage.saveResume({
        resumeData,
        scoreData,
        jdText: role.description,
        roleTitle: role.label
      });
      
      // Navigate only after BOTH promises resolve successfully
      navigate('/dashboard', { 
        state: { 
          resumeData, 
          scoreData, 
          rawJd: role.description,
          roleTitle: role.label,
          historyId: historyItem.id
        } 
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during analysis.");
      setFileStatus("error");
    }
  };

  const isAnalyzeEnabled = fileStatus === "success" && selectedRole !== "";
  const isAnalyzing = fileStatus === "analyzing";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col pt-8 space-y-10">
      <BackgroundEffects />
      <AnalysisLoadingOverlay isVisible={isAnalyzing} currentStepIndex={currentAnalysisStep} />
      
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="relative z-10 w-full max-w-5xl mx-auto space-y-10"
      >
        <motion.section variants={itemVariants} className="text-center px-4 space-y-6 flex flex-col items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-block px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-md mb-2"
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">AI-Powered Career Assistant</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="text-text">Resume Skill Gap</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Analyzer</span>
          </h1>
          
          <p className="max-w-2xl text-base md:text-lg text-muted/90 h-[54px] mx-auto">
            <TypewriterText text="Compare your resume with job requirements, uncover missing skills, and get guided improvement suggestions in a modern workspace." />
          </p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 pt-6 relative z-20">
            <Button 
              onClick={handleAnalyze}
              disabled={!isAnalyzeEnabled && !isAnalyzing}
              className={`px-8 py-3 text-base leading-relaxed border transition-all ${
                isAnalyzeEnabled || isAnalyzing
                  ? "shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] border-primary/50 cursor-pointer" 
                  : "opacity-60 cursor-not-allowed hover:transform-none border-transparent bg-primary/30"
              }`}
            >
              {isAnalyzing ? "Analyzing Document..." : "Analyze Resume"}
            </Button>
          </motion.div>
        </motion.section>

        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2 px-4 pb-12 w-full mt-12 relative z-20">
          <Card className={`backdrop-blur-xl bg-card/60 border shadow-xl transition-colors duration-300 relative overflow-hidden group ${fileStatus === "success" ? "border-green-500/50" : "border-border/50 hover:border-primary/40"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <SectionHeader title="Upload Resume" subtitle="PDF / DOCX formats supported" />
              <label className="cursor-pointer group/drop relative mt-4 overflow-hidden rounded-xl border-2 border-dashed border-border/80 bg-bg/40 p-10 text-center transition-all hover:bg-bg/60 hover:border-primary/50 block min-h-[160px] flex items-center justify-center">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover/drop:opacity-100 transition-opacity"></div>
                
                {fileStatus === "idle" && (
                  <div className="w-full">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="mx-auto w-12 h-12 mb-4 text-muted group-hover/drop:text-primary transition-colors flex items-center justify-center rounded-full bg-border/20 group-hover/drop:bg-primary/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </motion.div>
                    <p className="text-sm font-medium text-text relative z-10">Drag and drop resume file here</p>
                    <p className="text-xs text-muted mt-1 relative z-10">or click to browse</p>
                  </div>
                )}

                {fileStatus === "uploading" && (
                  <div className="w-full max-w-[80%] mx-auto relative z-10 flex flex-col items-center">
                    <div className="w-full bg-border/40 rounded-full h-2 mb-4 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full transition-all duration-200" style={{ width: `${Math.min(uploadProgress, 100)}%` }}></div>
                    </div>
                    <span className="text-sm text-primary animate-pulse font-medium">Processing Document... {Math.min(uploadProgress, 100)}%</span>
                  </div>
                )}

                {fileStatus === "success" && (
                  <div className="w-full relative z-10 flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-green-500 mb-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </motion.div>
                    <p className="text-base font-semibold text-text">Successfully saved!</p>
                    <p className="text-xs text-muted mt-1">Ready for analysis</p>
                  </div>
                )}

              </label>
            </div>
          </Card>

          <Card className="backdrop-blur-xl bg-card/60 border border-border/50 shadow-xl hover:border-secondary/40 transition-colors duration-300 relative overflow-hidden group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col h-full">
              <SectionHeader title="Select Job Role" subtitle="Choose your target career path" />
              
              {/* Area Filter */}
              <div className="flex flex-wrap gap-2 mt-4 mb-4">
                {areas.map(area => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedArea === area 
                        ? "bg-primary/20 border-primary text-primary" 
                        : "bg-bg/40 border-border/60 text-muted hover:border-muted"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                <div className="grid grid-cols-1 gap-2">
                  {filteredRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center p-3 rounded-xl border transition-all text-left group ${
                        selectedRole === role.id
                          ? "bg-secondary/20 border-secondary shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                          : "bg-bg/20 border-border/40 hover:border-secondary/30 hover:bg-bg/40"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-sm truncate ${selectedRole === role.id ? "text-secondary" : "text-text"}`}>
                            {role.label}
                          </span>
                          <span className="text-[10px] text-muted px-2 py-0.5 rounded-full bg-border/20 ml-2">
                            {role.area}
                          </span>
                        </div>
                        {selectedRole === role.id && (
                          <p className="text-[11px] text-muted mt-1 line-clamp-1 leading-relaxed animate-in fade-in slide-in-from-top-1">
                            {role.description}
                          </p>
                        )}
                      </div>
                      {selectedRole === role.id && (
                        <motion.div layoutId="activeRole" className="ml-3 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(59,130,246,0.8)] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
