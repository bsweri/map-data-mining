import { ExternalLink, Code2, Cpu, Lightbulb, Zap, ArrowRight, CheckCircle2, User, BookOpen, Target } from 'lucide-react';
import Header from '../components/Header';

export default function Profile() {
  return (
    <div className="min-h-screen bg-surface font-inter text-on-surface">
      <Header />
      
      <main className="pt-24 pb-16 px-gutter max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-6">
            <User size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-hanken font-bold text-on-surface mb-4">
            Full Stack Web & Mobile Developer
          </h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
            I am a passionate Full Stack Web and Mobile Developer with a strong interest in modern cloud technologies, scalable backend architecture, and API-driven application development. My primary focus is building secure, efficient, and maintainable applications using modern development frameworks and Backend-as-a-Service (BaaS) platforms.
          </p>
          <a 
            href="https://www.upwork.com/freelancers/~01545f5502c1b483f0?mp_source=share" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Hire Me on Upwork
            <ExternalLink size={18} />
          </a>
        </div>

        <div className="space-y-8 text-on-surface-variant leading-relaxed">
          <p>
            I continuously explore new technologies and software engineering best practices to improve application performance, scalability, and developer productivity. I enjoy researching system architecture, backend optimization, cloud infrastructure, and mobile application development.
          </p>
          <p>
            My current technical interests include React Native, Supabase, REST APIs, Edge Functions, PostgreSQL, authentication systems, payment gateway integration, geolocation services, and cloud deployment.
          </p>
          <p>
            I have a strong analytical mindset and prefer understanding how technologies work internally rather than simply using them. Before adopting a technology, I typically evaluate its architecture, security model, pricing, scalability, performance, and long-term maintainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* Core Technical Skills */}
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/50 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <Code2 size={24} />
              <h2 className="text-xl font-bold font-hanken">Core Technical Skills</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Full Stack Web Development",
                "Mobile Application Development with React Native",
                "Backend Development using Supabase",
                "PostgreSQL Database Design",
                "RESTful API Design and Integration",
                "Authentication & Authorization",
                "Edge Functions and Serverless Computing",
                "SQL and Database Optimization",
                "Payment Gateway Integration (Midtrans, Tripay)",
                "Google Maps Platform & Places API",
                "Google AdSense Integration",
                "Cloud-based Application Architecture",
                "Git-based Development Workflow"
              ].map((skill, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{skill}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Interests */}
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/50 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <Cpu size={24} />
              <h2 className="text-xl font-bold font-hanken">Technical Interests</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Backend Architecture Design",
                "API Security and Performance Optimization",
                "Cloud Computing",
                "Serverless Applications",
                "Database Performance Optimization",
                "Mobile Application Architecture",
                "Software Engineering Best Practices",
                "Scalable System Design",
                "Cost Optimization for Cloud Services",
                "AI-assisted Software Development"
              ].map((interest, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Lightbulb size={18} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{interest}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Knowledge */}
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/50 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <BookOpen size={24} />
              <h2 className="text-xl font-bold font-hanken">Technical Knowledge</h2>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">Throughout my learning journey, I have explored and studied various modern development technologies, including:</p>
            <ul className="space-y-3">
              {[
                "React & React Native",
                "Supabase Platform",
                "PostgreSQL",
                "Edge Functions",
                "Remote Procedure Call (RPC)",
                "REST API Design",
                "Google Maps API",
                "WhatsApp Cloud API",
                "Payment Gateway Integration",
                "Google AdSense",
                "Backend-as-a-Service (BaaS)",
                "Authentication Systems",
                "Cloud Functions",
                "Mobile Application Development Lifecycle",
                "Software Architecture Principles"
              ].map((knowledge, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ArrowRight size={16} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{knowledge}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Professional Characteristics */}
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/50 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <Zap size={24} />
              <h2 className="text-xl font-bold font-hanken">Professional Characteristics</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Strong problem-solving ability",
                "Fast learner with high curiosity",
                "Detail-oriented and analytical",
                "Passionate about continuous learning",
                "Interested in researching new technologies",
                "Focused on writing scalable and maintainable software",
                "Comfortable working independently on complex technical problems",
                "Strong interest in backend engineering and cloud technologies"
              ].map((char, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{char}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Career Objective */}
        <div className="mt-12 bg-primary/10 border border-primary/20 p-8 rounded-2xl text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary text-on-primary rounded-full mb-4">
            <Target size={24} />
          </div>
          <h2 className="text-2xl font-bold font-hanken text-on-surface mb-4">Career Objective</h2>
          <p className="text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            My goal is to become a highly skilled Software Engineer specializing in Full Stack Development, Cloud Backend Engineering, and Mobile Application Development. I am committed to continuously improving my technical expertise while building secure, scalable, and high-performance applications that solve real-world problems.
          </p>
        </div>
      </main>
    </div>
  );
}
