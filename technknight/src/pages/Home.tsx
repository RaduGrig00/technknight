import { useState, useEffect, useCallback } from 'react';

// Homepage Portfolio - Sviluppatore Freelance
// Compatibile con React + Vite + TypeScript + Tailwind v4

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  images?: string[]; // Array di immagini per il carousel
  link?: string;     // Link al progetto live o repository
}

interface Service {
  icon: string;
  title: string;
  description: string;
}

interface FormData {
  name: string;
  email: string;
  budget: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'rate_limited';

// Costanti per sicurezza
const RATE_LIMIT_MS = 30000; // 30 secondi tra invii
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Costanti carousel
const CAROUSEL_INTERVAL_MS = 4000; // Cambio immagine ogni 4 secondi

// Funzione per sanitizzare input (rimuove tag HTML pericolosi)
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '') // Rimuove tag HTML
    .replace(/[<>]/g, '') // Rimuove < e > residui
    .trim();
};

// Componente Carousel per le immagini dei progetti
interface ProjectCarouselProps {
  images: string[];
  title: string;
  index: number;
}

const ProjectCarousel = ({ images, title, index }: ProjectCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  // Auto-play: pausa on hover
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(nextSlide, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [images.length, isHovered, nextSlide]);

  const handleImageError = (imgIndex: number) => {
    setImageErrors(prev => new Set(prev).add(imgIndex));
  };

  // Se non ci sono immagini o tutte hanno errori, mostra fallback
  const showFallback = images.length === 0 || imageErrors.size === images.length;

  return (
    <div 
      className="aspect-[16/10] bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0e] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fallback: numero progetto */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showFallback ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-8xl text-[#c9f869]/10 font-bold">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Immagini */}
      {images.length > 0 && images.map((image, imgIndex) => (
        <div
          key={imgIndex}
          className={`absolute inset-0 transition-opacity duration-500 ${
            imgIndex === currentIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
        >
          {!imageErrors.has(imgIndex) && (
            <img
              src={image}
              alt={`${title} - screenshot ${imgIndex + 1}`}
              loading={imgIndex === 0 ? "eager" : "lazy"}
              className="w-full h-full object-contain"
              onError={() => handleImageError(imgIndex)}
            />
          )}
        </div>
      ))}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/40 via-transparent to-transparent z-[2] pointer-events-none" />

      {/* Frecce navigazione - visibili solo se più di un'immagine */}
      {images.length > 1 && !showFallback && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0a0a0b]/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#c9f869] hover:text-[#0a0a0b] text-white z-10"
            aria-label="Immagine precedente"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0a0a0b]/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#c9f869] hover:text-[#0a0a0b] text-white z-10"
            aria-label="Immagine successiva"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicatori (dots) */}
      {images.length > 1 && !showFallback && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, dotIndex) => (
            <button
              key={dotIndex}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(dotIndex);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIndex === currentIndex 
                  ? 'bg-[#c9f869] w-6' 
                  : 'bg-white/40 hover:bg-white/60 w-2'
              }`}
              aria-label={`Vai all'immagine ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#c9f869]/0 group-hover:bg-[#c9f869]/5 transition-colors duration-500 pointer-events-none z-[3]" />
    </div>
  );
};

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    budget: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [honeypot, setHoneypot] = useState(''); // Campo trappola per bot
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

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
      description: 'Aggiornamenti, bug fixing e miglioramenti per progetti esistenti.'
    }
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: 'Portfolio Fotografo',
      description: 'Portfolio fotografico con gallerie personalizzate',
      tags: ['React', 'Tailwind', 'TypeScript'],
      images: [
        '/projects/portfolio-fotografico-1.webp',
        '/projects/portfolio-fotografico-2.webp',
        '/projects/portfolio-fotografico-3.webp',
      ],
      link: ''
    },
    {
      id: 2,
      title: 'Gestionale scorte e consumabili',
      description: 'Gestionale per le scorte di consumabili di MFP con alert',
      tags: ['React', 'Tailwind', 'TypeScript', 'Python', 'FastAPI'],
      images: [
        '/projects/gestionale-consumabili-1.webp',
        '/projects/gestionale-consumabili-2.webp',
        '/projects/gestionale-consumabili-3.webp'
      ],
      link: ''
    },
    {
      id: 3,
      title: 'E-commerce Lego',
      description: 'Negozio online per prodotti lego e servizi di telefonia',
      tags: ['WordPress', 'WooCommerce', 'CSS'],
      images: [
        '/projects/ecommerce-lego-1.webp',
        '/projects/ecommerce-lego-2.webp',
        '/projects/ecommerce-lego-3.webp',
        '/projects/ecommerce-lego-4.webp'
      ],
      link: ''
    },
    // {
    //   id: 4,
    //   title: 'App Prenotazioni',
    //   description: 'Sistema di booking per studio professionale',
    //   tags: ['React', 'Node.js', 'PostgreSQL'],
    //   images: [
    //     '/projects/app-prenotazioni-1.jpg',
    //     '/projects/app-prenotazioni-2.jpg',
    //   ],
    //   link: 'https://esempio.com/progetto4'
    // }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Validazione singolo campo
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Il nome è obbligatorio';
        if (value.trim().length < MIN_NAME_LENGTH) return `Minimo ${MIN_NAME_LENGTH} caratteri`;
        if (value.length > MAX_NAME_LENGTH) return `Massimo ${MAX_NAME_LENGTH} caratteri`;
        return undefined;
      
      case 'email':
        if (!value.trim()) return 'L\'email è obbligatoria';
        if (!EMAIL_REGEX.test(value)) return 'Inserisci un\'email valida';
        return undefined;
      
      case 'message':
        if (!value.trim()) return 'Il messaggio è obbligatorio';
        if (value.trim().length < 10) return 'Descrivi meglio il tuo progetto (min 10 caratteri)';
        if (value.length > MAX_MESSAGE_LENGTH) return `Massimo ${MAX_MESSAGE_LENGTH} caratteri`;
        return undefined;
      
      default:
        return undefined;
    }
  };

  // Validazione completa del form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const messageError = validateField('message', formData.message);
    
    if (nameError) errors.name = nameError;
    if (emailError) errors.email = emailError;
    if (messageError) errors.message = messageError;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Sanitizza l'input
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Valida in tempo reale (rimuove errore se corretto)
    if (formErrors[name as keyof FormErrors]) {
      const error = validateField(name, sanitizedValue);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Valida on blur per feedback immediato
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Controllo honeypot (bot trap)
    if (honeypot) {
      // Bot detected - simula successo ma non inviare
      console.warn('Bot detected via honeypot');
      setFormStatus('success');
      return;
    }
    
    // 2. Rate limiting
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      const secondsLeft = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
      setFormStatus('rate_limited');
      setFormErrors({ message: `Attendi ${secondsLeft} secondi prima di inviare di nuovo` });
      setTimeout(() => {
        setFormStatus('idle');
        setFormErrors({});
      }, 3000);
      return;
    }
    
    // 3. Validazione completa
    if (!validateForm()) {
      return;
    }
    
    setFormStatus('submitting');
    setLastSubmitTime(now);

    try {
      // Prepara dati sanitizzati per l'invio
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email).toLowerCase(),
        budget: formData.budget,
        message: sanitizeInput(formData.message),
        // Metadati utili (opzionali)
        _subject: `Nuovo contatto da ${sanitizeInput(formData.name)}`,
      };

      const response = await fetch('https://formspree.io/f/mykkyeyp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', budget: '', message: '' });
        setFormErrors({});
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        throw new Error('Errore invio');
      }
    } catch {
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
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
                {/* Carousel immagini */}
                <ProjectCarousel 
                  images={project.images || []} 
                  title={project.title}
                  index={index}
                />
                
                {/* Link indicator */}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 w-10 h-10 bg-[#0a0a0b]/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-[#c9f869] hover:text-[#0a0a0b] text-white z-20"
                    aria-label={`Visita ${project.title}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-[#c9f869] transition-colors flex items-center gap-2">
                    {project.link ? (
                      <a 
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {project.title}
                      </a>
                    ) : (
                      project.title
                    )}
                    {project.link && (
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
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
            {['React', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Python'].map((tech) => (
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
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#c9f869] text-sm tracking-widest uppercase mb-4 block">
              Iniziamo
            </span>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Hai un progetto in mente?
            </h2>
            <p className="text-xl text-[#8a8a8a] max-w-2xl mx-auto">
              Raccontami la tua idea. Ti risponderò entro 24 ore con una 
              valutazione gratuita e senza impegno.
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-12">
            {/* Form */}
            <div className="md:col-span-3">
              <div className="bg-[#111113] rounded-2xl border border-[#1a1a1c] p-8">
                {formStatus === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#c9f869]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-8 h-8 text-[#c9f869]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Messaggio inviato!</h3>
                    <p className="text-[#8a8a8a]">Ti risponderò il prima possibile.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Honeypot field - nascosto agli utenti, visibile ai bot */}
                    <div className="absolute -left-[9999px]" aria-hidden="true">
                      <label htmlFor="_gotcha">Non compilare questo campo</label>
                      <input
                        type="text"
                        id="_gotcha"
                        name="_gotcha"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm text-[#8a8a8a] mb-2">
                          Nome *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          maxLength={MAX_NAME_LENGTH}
                          className={`w-full px-4 py-3 bg-[#0a0a0b] border rounded-xl text-[#e8e6e3] placeholder-[#4a4a4a] focus:outline-none transition-colors ${
                            formErrors.name 
                              ? 'border-red-500/50 focus:border-red-500' 
                              : 'border-[#2a2a2c] focus:border-[#c9f869]'
                          }`}
                          placeholder="Il tuo nome"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm text-[#8a8a8a] mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          className={`w-full px-4 py-3 bg-[#0a0a0b] border rounded-xl text-[#e8e6e3] placeholder-[#4a4a4a] focus:outline-none transition-colors ${
                            formErrors.email 
                              ? 'border-red-500/50 focus:border-red-500' 
                              : 'border-[#2a2a2c] focus:border-[#c9f869]'
                          }`}
                          placeholder="tua@email.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="budget" className="block text-sm text-[#8a8a8a] mb-2">
                        Budget indicativo
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#2a2a2c] rounded-xl text-[#e8e6e3] focus:border-[#c9f869] focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Seleziona un range</option>
                        <option value="< 500€">Meno di 500€</option>
                        <option value="500€ - 1.000€">500€ - 1.000€</option>
                        <option value="1.000€ - 2.500€">1.000€ - 2.500€</option>
                        <option value="> 2.500€">Più di 2.500€</option>
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="message" className="block text-sm text-[#8a8a8a]">
                          Descrivi il tuo progetto *
                        </label>
                        <span className="text-xs text-[#4a4a4a]">
                          {formData.message.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        rows={5}
                        maxLength={MAX_MESSAGE_LENGTH}
                        className={`w-full px-4 py-3 bg-[#0a0a0b] border rounded-xl text-[#e8e6e3] placeholder-[#4a4a4a] focus:outline-none transition-colors resize-none ${
                          formErrors.message 
                            ? 'border-red-500/50 focus:border-red-500' 
                            : 'border-[#2a2a2c] focus:border-[#c9f869]'
                        }`}
                        placeholder="Raccontami cosa hai in mente, le tempistiche e qualsiasi dettaglio utile..."
                      />
                      {formErrors.message && (
                        <p className="mt-1 text-xs text-red-400">{formErrors.message}</p>
                      )}
                    </div>
                    
                    {formStatus === 'error' && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        Si è verificato un errore. Riprova o contattami direttamente via email.
                      </div>
                    )}

                    {formStatus === 'rate_limited' && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                        Troppi tentativi. Attendi qualche secondo prima di riprovare.
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={formStatus === 'submitting' || formStatus === 'rate_limited'}
                      className="w-full px-8 py-4 bg-[#c9f869] text-[#0a0a0b] rounded-xl font-semibold text-lg hover:bg-[#d4ff7a] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {formStatus === 'submitting' ? (
                        <>
                          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          Invia messaggio
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact Info Sidebar */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contatto diretto</h3>
                <a 
                  href="mailto:info@techknight.it"
                  className="text-[#c9f869] hover:underline text-lg"
                >
                  info@techknight.it
                </a>
              </div>
              
              <div className="p-6 bg-[#111113] rounded-xl border border-[#1a1a1c]">
                <h3 className="font-semibold mb-3">💡 Come funziona</h3>
                <ol className="space-y-3 text-sm text-[#8a8a8a]">
                  <li className="flex gap-3">
                    <span className="text-[#c9f869] font-medium">1.</span>
                    Mi racconti il progetto
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#c9f869] font-medium">2.</span>
                    Ti invio preventivo gratuito
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#c9f869] font-medium">3.</span>
                    Iniziamo a lavorare insieme
                  </li>
                </ol>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-[#c9f869]/10 to-transparent rounded-xl border border-[#c9f869]/20">
                <p className="text-sm text-[#8a8a8a]">
                  <span className="text-[#c9f869] font-medium">Prestazione occasionale</span>
                  <br />
                  Lavoro con ritenuta d'acconto, senza partita IVA. Riceverai regolare ricevuta fiscale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#8a8a8a]">
          <p>© 2026 tuonome.dev — Tutti i diritti riservati</p>
          <p>Realizzato con React, Tailwind & TypeScript</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;