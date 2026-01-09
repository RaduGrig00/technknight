import { useState, useEffect } from 'react';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

interface Service {
  icon: string;
  title: string;
  description: string;
}

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const sections = ['home', 'servizi', 'progetti', 'contatti'];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services: Service[] = [
    {
      icon: '◈',
      title: 'Siti Web',
      description: 'Landing page, siti vetrina e web app moderne con tecnologie all\'avanguardia. Design responsive e performance ottimizzate.'
    },
    {
      icon: '◇',
      title: 'E-Commerce',
      description: 'Soluzioni di vendita online personalizzate. Integrazione pagamenti, gestione prodotti e analytics.'
    },
    {
      icon: '○',
      title: 'Consulenza IT',
      description: 'Analisi tecnica, scelta delle tecnologie, ottimizzazione performance e supporto decisionale.'
    },
    {
      icon: '△',
      title: 'Manutenzione',
      description: 'Aggiornamenti, bug fixing, miglioramenti e supporto continuativo per progetti esistenti.'
    }
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: 'Portfolio Fotografo',
      description: 'Galleria minimalista con lazy loading e animazioni fluide',
      tags: ['React', 'Tailwind', 'Framer Motion']
    },
    {
      id: 2,
      title: 'Dashboard Analytics',
      description: 'Pannello di controllo per visualizzazione dati in tempo reale',
      tags: ['TypeScript', 'Chart.js', 'REST API']
    },
    {
      id: 3,
      title: 'E-commerce Artigianale',
      description: 'Negozio online per prodotti handmade con gestione ordini',
      tags: ['Next.js', 'Stripe', 'Prisma']
    },
    {
      id: 4,
      title: 'App Prenotazioni',
      description: 'Sistema di booking per studio professionale',
      tags: ['React', 'Node.js', 'PostgreSQL']
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e3] font-['Satoshi',_sans-serif] selection:bg-[#c9f869] selection:text-[#0a0a0b]">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-[#0a0a0b]/80 border-b border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}
            className="text-xl font-medium tracking-tight hover:text-[#c9f869] transition-colors"
          >
            tuonome<span className="text-[#c9f869]">.</span>dev
          </a>
          
          <div className="hidden md:flex gap-8 text-sm">
            {['servizi', 'progetti', 'contatti'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize transition-all duration-300 hover:text-[#c9f869] ${
                  activeSection === item ? 'text-[#c9f869]' : 'text-[#8a8a8a]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => scrollToSection('contatti')}
            className="px-4 py-2 text-sm bg-[#c9f869] text-[#0a0a0b] rounded-full font-medium hover:bg-[#d4ff7a] transition-all duration-300 hover:scale-105"
          >
            Parliamone
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        id="home" 
        className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1a2e_0%,_transparent_50%)]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#c9f869]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[#c9f869]/3 rounded-full blur-3xl" />
        
        <div className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs tracking-wider uppercase bg-[#1a1a1c] rounded-full border border-[#2a2a2c]">
            <span className="w-2 h-2 bg-[#c9f869] rounded-full animate-pulse" />
            Disponibile per nuovi progetti
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight mb-8">
            Creo esperienze
            <br />
            <span className="text-[#c9f869]">digitali</span> che
            <br />
            funzionano
          </h1>
          
          <p className="text-lg md:text-xl text-[#8a8a8a] max-w-2xl mx-auto mb-12 leading-relaxed">
            Sviluppatore web freelance specializzato in siti moderni, 
            web app e consulenza tecnica. Trasformo le tue idee in 
            soluzioni concrete.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('progetti')}
              className="group px-8 py-4 bg-[#c9f869] text-[#0a0a0b] rounded-full font-semibold text-lg hover:bg-[#d4ff7a] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Vedi i progetti
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button 
              onClick={() => scrollToSection('contatti')}
              className="px-8 py-4 border border-[#2a2a2c] rounded-full font-semibold text-lg hover:border-[#c9f869] hover:text-[#c9f869] transition-all duration-300"
            >
              Contattami
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8a8a8a]">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#8a8a8a] to-transparent" />
        </div>
      </section>

      {/* Services Section */}
      <section id="servizi" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_#0d0d0e_20%,_#0d0d0e_80%,_transparent)]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="mb-16">
            <span className="text-[#c9f869] text-sm tracking-widest uppercase mb-4 block">
              Cosa posso fare per te
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">Servizi</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group p-8 bg-[#111113] rounded-2xl border border-[#1a1a1c] hover:border-[#c9f869]/30 transition-all duration-500 hover:-translate-y-1"
              >
                <span className="text-4xl text-[#c9f869] mb-6 block group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </span>
                <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                <p className="text-[#8a8a8a] leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 p-8 bg-gradient-to-r from-[#c9f869]/10 to-transparent rounded-2xl border border-[#c9f869]/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Prestazione occasionale</h3>
                <p className="text-[#8a8a8a]">
                  Lavoro senza partita IVA con ritenuta d'acconto. 
                  Ideale per progetti singoli e collaborazioni mirate.
                </p>
              </div>
              <button 
                onClick={() => scrollToSection('contatti')}
                className="shrink-0 px-6 py-3 border border-[#c9f869] text-[#c9f869] rounded-full font-medium hover:bg-[#c9f869] hover:text-[#0a0a0b] transition-all duration-300"
              >
                Richiedi preventivo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="progetti" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-[#c9f869] text-sm tracking-widest uppercase mb-4 block">
              Portfolio
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">Progetti selezionati</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div 
                key={project.id}
                className="group relative overflow-hidden rounded-2xl bg-[#111113] border border-[#1a1a1c] hover:border-[#c9f869]/30 transition-all duration-500"
              >
                {/* Project image placeholder */}
                <div className="aspect-[16/10] bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0e] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl text-[#c9f869]/10 font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#c9f869]/0 group-hover:bg-[#c9f869]/5 transition-colors duration-500" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#c9f869] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-[#8a8a8a] mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 text-xs bg-[#1a1a1c] rounded-full text-[#8a8a8a]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 border-y border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[#8a8a8a] mb-8 text-sm tracking-widest uppercase">
            Tecnologie che utilizzo
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-2xl md:text-3xl font-light text-[#4a4a4a]">
            {['React', 'TypeScript', 'Node.js', 'Next.js', 'Tailwind', 'PostgreSQL'].map((tech) => (
              <span 
                key={tech}
                className="hover:text-[#c9f869] transition-colors duration-300 cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contatti" className="py-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c9f869]/5 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-[#c9f869] text-sm tracking-widest uppercase mb-4 block">
            Iniziamo
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Hai un progetto in mente?
          </h2>
          <p className="text-xl text-[#8a8a8a] mb-12 max-w-2xl mx-auto">
            Raccontami la tua idea. Ti risponderò entro 24 ore con una 
            valutazione gratuita e senza impegno.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="mailto:tua@email.com"
              className="group px-8 py-4 bg-[#c9f869] text-[#0a0a0b] rounded-full font-semibold text-lg hover:bg-[#d4ff7a] transition-all duration-300 hover:scale-105 flex items-center gap-3"
            >
              <span>tua@email.com</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            
            <div className="flex gap-4">
              <a 
                href="https://github.com/tuousername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full border border-[#2a2a2c] hover:border-[#c9f869] hover:text-[#c9f869] transition-all duration-300"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://linkedin.com/in/tuousername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center rounded-full border border-[#2a2a2c] hover:border-[#c9f869] hover:text-[#c9f869] transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#8a8a8a]">
          <p>© 2025 tuonome.dev — Tutti i diritti riservati</p>
          <p>Realizzato con React + Tailwind</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;