import { useState, useEffect, useCallback } from "react";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  images?: string[];
  link?: string;
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
type FormStatus = "idle" | "submitting" | "success" | "error" | "rate_limited";
type CookieConsent = "pending" | "accepted" | "rejected";

const RATE_LIMIT_MS = 30000;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 5000;
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const CAROUSEL_INTERVAL_MS = 4000;
const COOKIE_CONSENT_KEY = "techknight_cookie_consent";

const sanitizeInput = (input: string): string =>
  input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "");

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const enableAnalytics = () => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
  }
};
const disableAnalytics = () => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", { analytics_storage: "denied" });
  }
  document.cookie.split(";").forEach((c) => {
    if (c.trim().startsWith("_ga")) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    }
  });
};

const CookieBanner = ({
  onAccept,
  onReject,
  onOpenPrivacy,
}: {
  onAccept: () => void;
  onReject: () => void;
  onOpenPrivacy: () => void;
}) => (
  <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-[#111113] border-t border-[#2a2a2c] shadow-2xl animate-slide-up">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-[#e8e6e3] text-sm md:text-base">
          🍪 Questo sito utilizza cookie analitici per migliorare l'esperienza
          utente. I dati sono anonimizzati e non vengono condivisi con terze
          parti per scopi pubblicitari.
        </p>
        <button
          onClick={onOpenPrivacy}
          className="text-[#c9f869] text-sm hover:underline mt-1"
        >
          Leggi la Privacy Policy →
        </button>
      </div>
      <div className="flex gap-3 shrink-0">
        <button
          onClick={onReject}
          className="px-5 py-2.5 text-sm border border-[#2a2a2c] text-[#8a8a8a] rounded-full hover:border-[#c9f869] hover:text-[#c9f869] transition-all duration-300"
        >
          Rifiuta
        </button>
        <button
          onClick={onAccept}
          className="px-5 py-2.5 text-sm bg-[#c9f869] text-[#0a0a0b] rounded-full font-medium hover:bg-[#d4ff7a] transition-all duration-300"
        >
          Accetta
        </button>
      </div>
    </div>
  </div>
);

const PrivacyModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#111113] rounded-2xl border border-[#2a2a2c] overflow-hidden">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-[#2a2a2c] bg-[#111113]">
          <h2 className="text-2xl font-bold text-[#e8e6e3]">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a2a2c] transition-colors"
            aria-label="Chiudi"
          >
            <svg
              className="w-5 h-5 text-[#8a8a8a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] text-[#b8b8b8] text-sm leading-relaxed space-y-6">
          <p className="text-xs text-[#8a8a8a]">
            Ultimo aggiornamento: Gennaio 2025
          </p>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              1. Titolare del Trattamento
            </h3>
            <p>
              Il titolare del trattamento dei dati è TechKnight, contattabile
              all'indirizzo email:{" "}
              <a
                href="mailto:info@techknight.it"
                className="text-[#c9f869] hover:underline"
              >
                info@techknight.it
              </a>
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              2. Dati Raccolti
            </h3>
            <p className="mb-2">Raccogliamo i seguenti tipi di dati:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-[#e8e6e3]">Dati di contatto:</strong>{" "}
                nome, email, messaggio (forniti volontariamente tramite il form)
              </li>
              <li>
                <strong className="text-[#e8e6e3]">Dati di navigazione:</strong>{" "}
                dati anonimi tramite Google Analytics 4 (se acconsenti)
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              3. Finalità
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Rispondere alle richieste di contatto</li>
              <li>Analizzare in forma anonima l'utilizzo del sito</li>
              <li>Adempiere a obblighi di legge</li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              4. Cookie Utilizzati
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2a2a2c]">
                  <th className="py-2 pr-4 text-[#e8e6e3]">Cookie</th>
                  <th className="py-2 pr-4 text-[#e8e6e3]">Tipo</th>
                  <th className="py-2 text-[#e8e6e3]">Finalità</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#1a1a1c]">
                  <td className="py-2 pr-4 font-mono text-xs">_ga, _ga_*</td>
                  <td className="py-2 pr-4">Analitico</td>
                  <td className="py-2">Google Analytics (2 anni)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">
                    techknight_cookie_consent
                  </td>
                  <td className="py-2 pr-4">Tecnico</td>
                  <td className="py-2">Memorizza scelta cookie (1 anno)</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-[#8a8a8a]">
              Google Analytics è configurato con IP anonimizzato.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              5. Base Giuridica
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong className="text-[#e8e6e3]">Consenso:</strong> per cookie
                analitici (art. 6.1.a GDPR)
              </li>
              <li>
                <strong className="text-[#e8e6e3]">Legittimo interesse:</strong>{" "}
                per rispondere ai contatti (art. 6.1.f GDPR)
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              6. I Tuoi Diritti
            </h3>
            <p className="mb-2">
              Ai sensi del GDPR hai diritto di: accedere, rettificare,
              cancellare, limitare, opporti al trattamento e alla portabilità
              dei dati.
            </p>
            <p>
              Contattami a:{" "}
              <a
                href="mailto:info@techknight.it"
                className="text-[#c9f869] hover:underline"
              >
                info@techknight.it
              </a>
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-[#e8e6e3] mb-3">
              7. Servizi Terzi
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c9f869] hover:underline"
                >
                  Google Analytics - Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://formspree.io/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c9f869] hover:underline"
                >
                  Formspree - Privacy Policy
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

const ProjectCarousel = ({
  images,
  title,
  index,
}: {
  images: string[];
  title: string;
  index: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const nextSlide = useCallback(
    () => setCurrentIndex((prev) => (prev + 1) % images.length),
    [images.length]
  );
  const prevSlide = useCallback(
    () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length),
    [images.length]
  );
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const interval = setInterval(nextSlide, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [images.length, isHovered, nextSlide]);
  const showFallback =
    images.length === 0 || imageErrors.size === images.length;
  return (
    <div
      className="aspect-[16/10] bg-gradient-to-br from-[#1a1a2e] to-[#0d0d0e] relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showFallback ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-8xl text-[#c9f869]/10 font-bold">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      {images.map((image, imgIndex) => (
        <div
          key={imgIndex}
          className={`absolute inset-0 transition-opacity duration-500 ${
            imgIndex === currentIndex ? "opacity-100 z-[1]" : "opacity-0 z-0"
          }`}
        >
          {!imageErrors.has(imgIndex) && (
            <img
              src={image}
              alt={`${title} - ${imgIndex + 1}`}
              loading={imgIndex === 0 ? "eager" : "lazy"}
              className="w-full h-full object-contain"
              onError={() =>
                setImageErrors((prev) => new Set(prev).add(imgIndex))
              }
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/40 via-transparent to-transparent z-[2] pointer-events-none" />
      {images.length > 1 && !showFallback && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0a0a0b]/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#c9f869] hover:text-[#0a0a0b] text-white z-10"
            aria-label="Precedente"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#0a0a0b]/70 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#c9f869] hover:text-[#0a0a0b] text-white z-10"
            aria-label="Successiva"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
      {images.length > 1 && !showFallback && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "bg-[#c9f869] w-6"
                  : "bg-white/40 hover:bg-white/60 w-2"
              }`}
              aria-label={`Immagine ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    budget: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [honeypot, setHoneypot] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [cookieConsent, setCookieConsent] = useState<CookieConsent>("pending");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved === "accepted") {
      setCookieConsent("accepted");
      enableAnalytics();
    } else if (saved === "rejected") {
      setCookieConsent("rejected");
      disableAnalytics();
    }
  }, []);
  const handleAcceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setCookieConsent("accepted");
    enableAnalytics();
  };
  const handleRejectCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setCookieConsent("rejected");
    disableAnalytics();
  };
  const handleResetCookieConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setCookieConsent("pending");
    disableAnalytics();
  };

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => {
      const sections = ["home", "servizi", "progetti", "contatti"];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (
          el &&
          scrollPosition >= el.offsetTop &&
          scrollPosition < el.offsetTop + el.offsetHeight
        ) {
          setActiveSection(section);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const services: Service[] = [
    {
      icon: "◈",
      title: "Siti Web",
      description:
        "Landing page, siti vetrina e web app moderne. Design responsive e performance ottimizzate.",
    },
    {
      icon: "◇",
      title: "E-Commerce",
      description:
        "Soluzioni di vendita online personalizzate. Integrazione pagamenti e analytics.",
    },
    {
      icon: "○",
      title: "Consulenza IT",
      description: "Analisi tecnica, scelta tecnologie e supporto decisionale.",
    },
    {
      icon: "△",
      title: "Manutenzione",
      description:
        "Aggiornamenti, bug fixing e miglioramenti per progetti esistenti.",
    },
  ];

  const projects: Project[] = [
    {
      id: 1,
      title: "Portfolio Fotografo",
      description: "Portfolio fotografico con gallerie personalizzate",
      tags: ["React", "Tailwind", "TypeScript"],
      images: [
        "/projects/portfolio-fotografico-1.webp",
        "/projects/portfolio-fotografico-2.webp",
        "/projects/portfolio-fotografico-3.webp",
      ],
      link: "",
    },
    {
      id: 2,
      title: "Gestionale scorte e consumabili",
      description: "Gestionale per le scorte di consumabili di MFP con alert",
      tags: ["React", "Tailwind", "TypeScript", "Python", "FastAPI"],
      images: [
        "/projects/gestionale-consumabili-1.webp",
        "/projects/gestionale-consumabili-2.webp",
        "/projects/gestionale-consumabili-3.webp",
      ],
      link: "",
    },
    {
      id: 3,
      title: "E-commerce Lego",
      description: "Negozio online per prodotti lego e servizi di telefonia",
      tags: ["WordPress", "WooCommerce", "CSS"],
      images: [
        "/projects/ecommerce-lego-1.webp",
        "/projects/ecommerce-lego-2.webp",
        "/projects/ecommerce-lego-3.webp",
        "/projects/ecommerce-lego-4.webp",
      ],
      link: "",
    },
  ];

  const scrollToSection = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const validateField = (name: string, value: string): string | undefined => {
    if (name === "name") {
      if (!value.trim()) return "Il nome è obbligatorio";
      if (value.trim().length < MIN_NAME_LENGTH)
        return `Minimo ${MIN_NAME_LENGTH} caratteri`;
      if (value.length > MAX_NAME_LENGTH)
        return `Massimo ${MAX_NAME_LENGTH} caratteri`;
    }
    if (name === "email") {
      if (!value.trim()) return "L'email è obbligatoria";
      if (!EMAIL_REGEX.test(value)) return "Inserisci un'email valida";
    }
    if (name === "message") {
      if (!value.trim()) return "Il messaggio è obbligatorio";
      if (value.trim().length < 10) return "Descrivi meglio (min 10 caratteri)";
      if (value.length > MAX_MESSAGE_LENGTH)
        return `Massimo ${MAX_MESSAGE_LENGTH} caratteri`;
    }
    return undefined;
  };
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    ["name", "email", "message"].forEach((f) => {
      const err = validateField(f, formData[f as keyof FormData]);
      if (err) errors[f as keyof FormErrors] = err;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const sanitized = sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [name]: sanitized }));
    if (formErrors[name as keyof FormErrors])
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, sanitized),
      }));
  };
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setFormStatus("success");
      return;
    }
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setFormStatus("rate_limited");
      setTimeout(() => setFormStatus("idle"), 3000);
      return;
    }
    if (!validateForm()) return;
    setFormStatus("submitting");
    setLastSubmitTime(now);
    try {
      const response = await fetch("https://formspree.io/f/mykkyeyp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeInput(formData.name).trim(),
          email: sanitizeInput(formData.email).toLowerCase().trim(),
          budget: formData.budget,
          message: sanitizeInput(formData.message).trim(),
          _subject: `Nuovo contatto da ${sanitizeInput(formData.name).trim()}`,
        }),
      });
      if (response.ok) {
        setFormStatus("success");
        setFormData({ name: "", email: "", budget: "", message: "" });
        setFormErrors({});
        setTimeout(() => setFormStatus("idle"), 5000);
      } else throw new Error("Errore");
    } catch {
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e8e6e3] font-['Satoshi',_sans-serif] selection:bg-[#c9f869] selection:text-[#0a0a0b]">
      {cookieConsent === "pending" && (
        <CookieBanner
          onAccept={handleAcceptCookies}
          onReject={handleRejectCookies}
          onOpenPrivacy={() => setShowPrivacyModal(true)}
        />
      )}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-[#0a0a0b]/80 border-b border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home");
            }}
            className="text-xl font-medium tracking-tight hover:text-[#c9f869] transition-colors"
          >
            techknight<span className="text-[#c9f869]">.</span>it
          </a>
          <div className="hidden md:flex gap-8 text-sm">
            {["servizi", "progetti", "contatti"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize transition-all duration-300 hover:text-[#c9f869] ${
                  activeSection === item ? "text-[#c9f869]" : "text-[#8a8a8a]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollToSection("contatti")}
            className="px-4 py-2 text-sm bg-[#c9f869] text-[#0a0a0b] rounded-full font-medium hover:bg-[#d4ff7a] transition-all duration-300 hover:scale-105"
          >
            Parliamone
          </button>
        </div>
      </nav>

      <section
        id="home"
        className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1a2e_0%,_transparent_50%)]" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#c9f869]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-[#c9f869]/3 rounded-full blur-3xl" />
        <div
          className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
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
            Sviluppatore web freelance specializzato in siti moderni, web app e
            consulenza tecnica. Trasformo le tue idee in soluzioni concrete.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection("progetti")}
              className="group px-8 py-4 bg-[#c9f869] text-[#0a0a0b] rounded-full font-semibold text-lg hover:bg-[#d4ff7a] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Vedi i progetti
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            <button
              onClick={() => scrollToSection("contatti")}
              className="px-8 py-4 border border-[#2a2a2c] rounded-full font-semibold text-lg hover:border-[#c9f869] hover:text-[#c9f869] transition-all duration-300"
            >
              Contattami
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#8a8a8a]">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#8a8a8a] to-transparent" />
        </div>
      </section>

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
            {services.map((service, i) => (
              <div
                key={i}
                className="group p-8 bg-[#111113] rounded-2xl border border-[#1a1a1c] hover:border-[#c9f869]/30 transition-all duration-500 hover:-translate-y-1"
              >
                <span className="text-4xl text-[#c9f869] mb-6 block group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </span>
                <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                <p className="text-[#8a8a8a] leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 p-8 bg-gradient-to-r from-[#c9f869]/10 to-transparent rounded-2xl border border-[#c9f869]/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-semibold mb-2">
                  Prestazione occasionale
                </h3>
                <p className="text-[#8a8a8a]">
                  Lavoro senza partita IVA con ritenuta d'acconto. Ideale per
                  progetti singoli.
                </p>
              </div>
              <button
                onClick={() => scrollToSection("contatti")}
                className="shrink-0 px-6 py-3 border border-[#c9f869] text-[#c9f869] rounded-full font-medium hover:bg-[#c9f869] hover:text-[#0a0a0b] transition-all duration-300"
              >
                Richiedi preventivo
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="progetti" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-[#c9f869] text-sm tracking-widest uppercase mb-4 block">
              Portfolio
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Progetti selezionati
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-2xl bg-[#111113] border border-[#1a1a1c] hover:border-[#c9f869]/30 transition-all duration-500"
              >
                <ProjectCarousel
                  images={project.images || []}
                  title={project.title}
                  index={i}
                />
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

      <section className="py-20 px-6 border-y border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[#8a8a8a] mb-8 text-sm tracking-widest uppercase">
            Tecnologie che utilizzo
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-2xl md:text-3xl font-light text-[#4a4a4a]">
            {[
              "React",
              "TypeScript",
              "Python",
              "Tailwind",
              "PostgreSQL",
            ].map((tech) => (
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
              valutazione gratuita.
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
              <div className="bg-[#111113] rounded-2xl border border-[#1a1a1c] p-8">
                {formStatus === "success" ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#c9f869]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-8 h-8 text-[#c9f869]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                      Messaggio inviato!
                    </h3>
                    <p className="text-[#8a8a8a]">
                      Ti risponderò il prima possibile.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="absolute -left-[9999px]" aria-hidden="true">
                      <input
                        type="text"
                        name="_gotcha"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-[#8a8a8a] mb-2">
                          Nome *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          maxLength={MAX_NAME_LENGTH}
                          className={`w-full px-4 py-3 bg-[#0a0a0b] border rounded-xl text-[#e8e6e3] placeholder-[#4a4a4a] focus:outline-none transition-colors ${
                            formErrors.name
                              ? "border-red-500/50"
                              : "border-[#2a2a2c] focus:border-[#c9f869]"
                          }`}
                          placeholder="Il tuo nome"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-red-400">
                            {formErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-[#8a8a8a] mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 bg-[#0a0a0b] border rounded-xl text-[#e8e6e3] placeholder-[#4a4a4a] focus:outline-none transition-colors ${
                            formErrors.email
                              ? "border-red-500/50"
                              : "border-[#2a2a2c] focus:border-[#c9f869]"
                          }`}
                          placeholder="tua@email.com"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-red-400">
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[#8a8a8a] mb-2">
                        Budget indicativo
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#2a2a2c] rounded-xl text-[#e8e6e3] focus:border-[#c9f869] focus:outline-none"
                      >
                        <option value="">Seleziona un range</option>
                        <option value="< 500€">Meno di 500€</option>
                        <option value="500€ - 1.000€">500€ - 1.000€</option>
                        <option value="1.000€ - 2.500€">1.000€ - 2.500€</option>
                        <option value="> 2.500€">Più di 2.500€</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm text-[#8a8a8a]">
                          Descrivi il tuo progetto *
                        </label>
                        <span className="text-xs text-[#4a4a4a]">
                          {formData.message.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        rows={5}
                        maxLength={MAX_MESSAGE_LENGTH}
                        className={`w-full px-4 py-3 bg-[#0a0a0b] border rounded-xl text-[#e8e6e3] placeholder-[#4a4a4a] focus:outline-none resize-none ${
                          formErrors.message
                            ? "border-red-500/50"
                            : "border-[#2a2a2c] focus:border-[#c9f869]"
                        }`}
                        placeholder="Raccontami cosa hai in mente..."
                      />
                      {formErrors.message && (
                        <p className="mt-1 text-xs text-red-400">
                          {formErrors.message}
                        </p>
                      )}
                    </div>
                    {formStatus === "error" && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        Errore. Riprova o contattami via email.
                      </div>
                    )}
                    {formStatus === "rate_limited" && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                        Troppi tentativi. Attendi qualche secondo.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        formStatus === "submitting" ||
                        formStatus === "rate_limited"
                      }
                      className="w-full px-8 py-4 bg-[#c9f869] text-[#0a0a0b] rounded-xl font-semibold text-lg hover:bg-[#d4ff7a] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {formStatus === "submitting" ? (
                        <>
                          <svg
                            className="animate-spin w-5 h-5"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Invio...
                        </>
                      ) : (
                        <>Invia messaggio →</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
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
                    <span className="text-[#c9f869] font-medium">1.</span>Mi
                    racconti il progetto
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#c9f869] font-medium">2.</span>Ti
                    invio preventivo gratuito
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#c9f869] font-medium">3.</span>
                    Iniziamo a lavorare insieme
                  </li>
                </ol>
              </div>
              <div className="p-6 bg-gradient-to-br from-[#c9f869]/10 to-transparent rounded-xl border border-[#c9f869]/20">
                <p className="text-sm text-[#8a8a8a]">
                  <span className="text-[#c9f869] font-medium">
                    Prestazione occasionale
                  </span>
                  <br />
                  Lavoro con ritenuta d'acconto, senza partita IVA.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-[#1a1a1c]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#8a8a8a]">
          <p>© 2026 techknight.it — Tutti i diritti riservati</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-[#c9f869] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={handleResetCookieConsent}
              className="hover:text-[#c9f869] transition-colors"
            >
              Gestisci Cookie
            </button>
          </div>
        </div>
      </footer>

      <style>{`@keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.4s ease-out; }`}</style>
    </div>
  );
};

export default HomePage;
