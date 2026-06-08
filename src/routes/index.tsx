import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Stethoscope, ClipboardCheck, MessageSquare,
  FlaskConical, Compass, Sparkles, ShieldCheck, Globe2, Users,
  Headphones, Briefcase, ArrowRight, CheckCircle2, Calendar, BookOpen, Star, Gift,
  CreditCard, Lock, ShoppingBag, Loader2, FileText, Check, AlertCircle, X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PricingPlans } from "@/components/landing/PricingPlans";
import { FaqSection } from "@/components/landing/FaqSection";
import { HeroVisual } from "@/components/HeroVisual";
import { Counter } from "@/components/Counter";
import { api } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getLoginUrl } from "@/lib/authSession";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prometrica Academy | Excellence in Pharmacy Education and Licensing Exams" },
      { name: "description", content: "The leading educational platform for qualifying pharmacists, passing Prometric exams, and developing clinical skills with the latest accredited curricula." },
      { property: "og:title", content: "Prometrica Academy | Pharmacy Licensing & Clinical Excellence" },
      { property: "og:description", content: "Strategic learning pathways, mock exams, and mentorship to help pharmacists pass Prometric exams and advance their careers." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: Index,
});

const why = [
  { icon: Globe2, title: "Learn from anywhere", text: "Fully online platform built for pharmacists worldwide." },
  { icon: Users, title: "Elite faculty", text: "Lectures led by top clinical experts and exam strategists." },
  { icon: BookOpen, title: "Every specialty", text: "Curricula covering Prometric, clinical, and practice areas." },
  { icon: Gift, title: "Free starter materials", text: "Sample question banks and study guides on signup." },
];
const programs = [
  { icon: GraduationCap, title: "Prometric Prep", text: "Intensive, targeted programs to pass health professional certification exams." },
  { icon: Stethoscope, title: "Clinical Pharmacy", text: "Develop evidence-based decision-making for real clinical practice." },
  { icon: ClipboardCheck, title: "Mock Exams", text: "Realistic simulations of testing environments to assess readiness." },
  { icon: MessageSquare, title: "Interview Readiness", text: "Pass interviews at leading hospitals and pharmaceutical companies." },
  { icon: FlaskConical, title: "Modern Practice", text: "Stay current with the latest treatment protocols and guidelines." },
  { icon: Compass, title: "Strategic Mentorship", text: "Custom study plans tailored to your level and target exam date." },
];

const courses = [
  { date: { d: "12", m: "Jun" }, day: "Wednesday", title: "Prometric DHA Pharmacy", subtitle: "Full preparation track", price: 150, classes: 12, tag: "Bestseller" },
  { date: { d: "20", m: "Jun" }, day: "Thursday", title: "Clinical Pharmacy Essentials", subtitle: "Evidence-based decision making", price: 180, classes: 10, tag: "New" },
  { date: { d: "05", m: "Jul" }, day: "Saturday", title: "Saudi SCFHS Exam Prep", subtitle: "Targeted intensive program", price: 200, classes: 14, tag: "Live" },
  { date: { d: "18", m: "Jul" }, day: "Friday", title: "Hospital Interview Mastery", subtitle: "Realistic interview drills", price: 120, classes: 6, tag: "Limited" },
];

const whyCards = [
  { icon: Users, title: "Elite Faculty", text: "A select group of lecturers and clinical experts guiding every cohort." },
  { icon: Sparkles, title: "Continuous Updates", text: "Medical curricula refreshed against the latest international standards." },
  { icon: Globe2, title: "Flexible Distance Learning", text: "Access world-class training from anywhere, at your own pace." },
  { icon: ShieldCheck, title: "Smart Exam Strategies", text: "Innovative test-solving frameworks engineered for high-pressure exams." },
  { icon: Headphones, title: "24/7 Support", text: "Ongoing technical and academic support whenever you need it." },
  { icon: Briefcase, title: "Career Insight", text: "A complete view of the medical job market and hiring landscape." },
];

const steps = [
  { n: "01", title: "Discovery & Analysis", text: "Initial assessment to determine your current level and gaps." },
  { n: "02", title: "Personalized Plan", text: "A tailored roadmap built around your exam date and goal." },
  { n: "03", title: "Interactive Learning", text: "Live sessions, recorded modules, and case-based practice." },
  { n: "04", title: "Mock Exams & Review", text: "Realistic simulations with deep diagnostic feedback." },
  { n: "05", title: "Certification & Success", text: "Pass your licensing exam and step into your career." },
];

const testimonials = [
  { q: "Prometrica Academy completely changed my study method, and I passed the licensing exam on my first attempt.", a: "Layla H.", r: "Licensed Pharmacist" },
  { q: "The level of professionalism and the practice questions were exceptional and realistic.", a: "Omar S.", r: "Clinical Pharmacist" },
  { q: "Finally, an educational partner that focuses on deep understanding and confidence — not rote memorization.", a: "Dr. Sara M.", r: "Hospital Pharmacist" },
];

const allStudentReviews = [
  // Row 1
  { q: 'اسامة التميمي عم الجميع', a: 'خالد جودت', r: 'طالب صيدلة', rating: 4, color: '#1e4b8f' },
  { q: 'كل الاحترام للمعلمين', a: 'ماجد أخمد', r: 'طالب صيدلة', rating: 5, color: '#0e7a6e' },
  { q: 'الله يجزيكم الخير', a: 'ياسمين ابراهيم', r: 'صيدلانية', rating: 4, color: '#8b4513' },
  { q: 'غيرت أكاديمية بروميتريكا طريقة دراستي تماماً، واجتزت امتحان الترخيص من المحاولة الأولى.', a: 'ليلى هـ.', r: 'صيدلانية مرخصة', rating: 5, color: '#6b21a8' },
  { q: 'كان مستوى الاحترافية وأسئلة التدريب استثنائياً وواقعياً.', a: 'عمر س.', r: 'صيدلاني سريري', rating: 5, color: '#0f5132' },
  { q: 'أخيراً، شريك تعليمي يركز على الفهم العميق والثقة — وليس الحفظ عن ظهر قلب.', a: 'د. سارة م.', r: 'صيدلانية مستشفى', rating: 5, color: '#92400e' },
  // Row 2
  { q: 'منصة جدا جميلة وشرح ممتاز', a: 'NASR Alsayed', r: 'Pharmacist', rating: 5, color: '#1e3a5f' },
  { q: 'يعطيكم العافية لكل الاساتذه واتمنا التوفيق والنجاح الي وللجميع', a: 'سيف الدين ايمن براسنه', r: 'طالب صيدلة', rating: 5, color: '#065f46' },
  { q: 'ماشاء على الاستاذ احمد الحطبه افضل مدرس وسريع الفهم منه', a: 'هيا القضاه', r: 'صيدلانية', rating: 5, color: '#7c2d12' },
  { q: 'برنامج الإعداد أعطاني الثقة الكاملة قبل الاختبار، ونجحت بامتياز.', a: 'أحمد م.', r: 'صيدلاني مرخص', rating: 5, color: '#1e4b8f' },
  { q: 'المحتوى منظم ومركّز — لا وقت ضائع، كل ثانية لها قيمة.', a: 'نور ع.', r: 'صيدلانية', rating: 5, color: '#5b21b6' },
  { q: 'تجربة تعلم احترافية من أول يوم حتى آخر يوم — أنصح بها كل صيدلاني.', a: 'فيصل ر.', r: 'صيدلاني سريري', rating: 5, color: '#0e7a6e' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Index() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const queryClient = useQueryClient();

  const [checkoutProduct, setCheckoutProduct] = useState<any | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const { data: dynamicCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['landingCourses'],
    queryFn: async () => {
      const res = await api.get('/landing/courses');
      return res.data;
    }
  });

  const { data: digitalProductsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['landingDigitalProducts'],
    queryFn: async () => {
      const res = await api.get('/landing/digital-products');
      return res.data;
    }
  });
  const dynamicProducts = digitalProductsData?.products || [];

  const handleOpenCheckout = (product: any) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl(window.location.href);
      return;
    }
    if (product.is_free) {
      handleInstantFreePurchase(product);
      return;
    }
    setCheckoutProduct(product);
    setCheckoutError(null);
    setCheckoutSuccess(false);
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvv('');
  };

  const handleInstantFreePurchase = async (product: any) => {
    setCheckoutProduct(product);
    setCheckoutSuccess(false);
    setIsPaying(true);
    setCheckoutError(null);

    try {
      const res = await api.post(`/v1/digital-products/${product.id}/purchase`);
      queryClient.invalidateQueries({ queryKey: ['landingDigitalProducts'] });
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutProduct(null);
        setCheckoutSuccess(false);
      }, 3000);
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || t('auth.server_error', 'An error occurred. Please try again.'));
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!checkoutProduct) return;
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setCheckoutError(t('validation.required', 'Please fill in all payment details.'));
      return;
    }
    setIsPaying(true);
    setCheckoutError(null);

    try {
      const res = await api.post(`/v1/digital-products/${checkoutProduct.id}/purchase`);
      queryClient.invalidateQueries({ queryKey: ['landingDigitalProducts'] });
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutProduct(null);
        setCheckoutSuccess(false);
      }, 3000);
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || t('auth.server_error', 'An error occurred. Please try again.'));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div id="top" className="relative min-h-screen overflow-x-clip bg-background">
      <Navbar />

      {/* Top announcement strip */}
      <div className="relative z-40 mt-0 hidden bg-primary/95 py-2 text-xs text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <span>{t('landing.announcement.t1')}</span>
            <span className="text-primary-foreground/60">•</span>
            <span>{t('landing.announcement.t2')}</span>
          </div>
          <div className="flex items-center gap-4 text-primary-foreground/80">
            <span>{t('landing.announcement.t3')}</span>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative pt-24 pb-20 md:pt-28 md:pb-28">
        <div className="absolute inset-0 grid-soft" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-[oklch(0.78_0.16_55/0.12)] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" style={{ animation: "pulse-ring 1.6s cubic-bezier(0,0,0.2,1) infinite" }} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t('landing.hero.badge')}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-balance text-5xl font-bold leading-[1.05] text-primary md:text-6xl lg:text-7xl"
            >
              {t('landing.hero.h1_1')}{" "}
              <span className="relative inline-block">
                <span className="text-gradient">{t('landing.hero.h1_2')}</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <motion.path
                    d="M2 8 C 80 2, 220 2, 298 8"
                    stroke="oklch(0.78 0.16 175)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 0.6 }}
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="mt-6 max-w-xl text-lg text-muted-foreground">
              Prometrica Academy delivers strategic learning paths, realistic exams, and complete
              professional development — built so pharmacists pass Prometric exams and excel in
              competitive job markets.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110">
                {t('landing.hero.btn1')}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <a href="#programs" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-primary transition hover:border-accent">
                {t('landing.hero.btn2')}
              </a>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              {[t('landing.hero.feat1'), t('landing.hero.feat2'), t('landing.hero.feat3')].map((feat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> {feat}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <div className="flex justify-center">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* MARQUEE / TRUST */}
      <section className="relative overflow-hidden border-y border-border bg-card/60 py-5">
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap text-sm font-medium text-muted-foreground">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex items-center gap-16">
              {["DHA", "MOH", "HAAD / DOH", "SCFHS", "QCHP", "NHRA", "OMSB", "Prometric"].map((t) => (
                <span key={t} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* WHY ROW (mirrors reference 4 columns) */}
      <section id="why" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.why.badge')}</p>
            <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">
              {t('landing.why.title1')}<span className="text-gradient">{t('landing.why.title2')}</span>
            </h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Globe2, ...t('landing.why.c1', { returnObjects: true }) as any },
              { icon: Users, ...t('landing.why.c2', { returnObjects: true }) as any },
              { icon: BookOpen, ...t('landing.why.c3', { returnObjects: true }) as any },
              { icon: Gift, ...t('landing.why.c4', { returnObjects: true }) as any }
            ].map((w, i) => (
              <motion.div
                key={w.title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-card)]"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-primary">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT band */}
      <section id="about" className="relative py-10">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-primary md:text-5xl">
            {t('landing.about.title1')}
            <span className="text-gradient">{t('landing.about.title2')}</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Stay at the edge of healthcare with our specialist webinars. Build deep understanding,
            present your expertise, and grow your professional reach.
          </motion.p>
          <a href="#programs" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:bg-accent hover:text-accent-foreground">
            {t('landing.about.btn')} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.programs.badge')}</p>
              <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">{t('landing.programs.title')}</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              {t('landing.programs.desc')}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: GraduationCap, ...t('landing.programs.c1', { returnObjects: true }) as any },
              { icon: Stethoscope, ...t('landing.programs.c2', { returnObjects: true }) as any },
              { icon: ClipboardCheck, ...t('landing.programs.c3', { returnObjects: true }) as any },
              { icon: MessageSquare, ...t('landing.programs.c4', { returnObjects: true }) as any },
              { icon: FlaskConical, ...t('landing.programs.c5', { returnObjects: true }) as any },
              { icon: Compass, ...t('landing.programs.c6', { returnObjects: true }) as any }
            ].map((p, i) => (
              <motion.article
                key={p.title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-card)]"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition group-hover:bg-accent/25" />
                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-primary">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-accent">
                    Learn more <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES (reference-inspired cards) */}
      <section id="courses" className="relative bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.courses.badge')}</p>
              <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">{t('landing.courses.title')}</h2>
            </div>
            <a href="#contact" className="text-sm font-semibold text-accent hover:text-primary">
              {t('landing.courses.viewAll')}
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {isLoadingCourses ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
                  <div className="flex gap-6">
                    <div className="h-12 w-12 rounded bg-muted"></div>
                    <div className="space-y-3 flex-1">
                      <div className="h-4 w-1/3 bg-muted rounded"></div>
                      <div className="h-6 w-2/3 bg-muted rounded"></div>
                      <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-border pt-5 flex justify-between">
                    <div className="h-8 w-16 bg-muted rounded"></div>
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              dynamicCourses.map((c: any, i: number) => {
                const date = new Date(c.created_at);
                const day = date.getDate();
                const month = date.toLocaleString('default', { month: 'short' });
                return (
                  <motion.div
                    key={c.id}
                    variants={fadeUp}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent"
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                      <img 
                        src={c.thumbnail ? `http://localhost:8000/storage/${c.thumbnail}` : 'https://placehold.co/600x400/1e293b/ffffff?text=Pharmacy+Course'} 
                        alt={c.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold leading-none text-primary">{day}</div>
                            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{month}</div>
                          </div>
                          <div className="h-12 w-px bg-border" />
                          <div>
                            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.category || 'Category'} • {c.difficulty || 'All Levels'}</div>
                            <h3 className="mt-1 text-lg font-semibold text-primary">{c.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{c.short_description}</p>
                          </div>
                        </div>
                        {c.average_rating > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
                            <Star className="h-3 w-3 fill-current" /> {Number(c.average_rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {c.is_free ? (
                            <div className="text-2xl font-bold text-accent">{t('free', 'Free')}</div>
                          ) : (
                            <>
                              <div className="text-2xl font-bold text-accent">${c.discount_price || c.price}</div>
                              {c.discount_price && c.price > c.discount_price && (
                                 <div className="text-sm line-through text-muted-foreground">${c.price}</div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {c.lessons_count || 0} {t('landing.courses.lessons')}</span>
                          <span className="flex items-center gap-1"><PlayCircle className="h-4 w-4" /> {c.total_duration || 0}m</span>
                        </div>
                        {c.is_free ? (
                          <Link
                            to="/courses/$id"
                            params={{ id: String(c.id) }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
                          >
                            {t('free', 'Free')} <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : isInCart(c.id, 'course') ? (
                          <Link
                            to="/cart"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                          >
                            <Check className="h-4 w-4" /> {t('cart.in_cart', 'In Cart')}
                          </Link>
                        ) : (
                          <button
                            onClick={() => addToCart({
                              id: c.id,
                              type: 'course',
                              title: c.title,
                              price: Number(c.discount_price || c.price || 0),
                              thumbnail: c.thumbnail ? `http://localhost:8000/storage/${c.thumbnail}` : null,
                            })}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
                          >
                            <ShoppingBag className="h-4 w-4" /> {t('landing.courses.viewCourse')}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <button className="rounded-full border border-border bg-card px-7 py-3 text-sm font-semibold text-primary transition hover:border-accent hover:text-accent">
              {t('landing.courses.loadMore')}
            </button>
          </div>
        </div>
      </section>

      {/* DIGITAL PRODUCTS (eBooks & Study Materials) */}
      <section id="digital-products" className="relative bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.digital_products.badge')}</p>
              <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">{t('landing.digital_products.title')}</h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              {t('landing.digital_products.desc')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingProducts ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-pulse">
                  <div className="h-48 w-full bg-muted rounded-xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-6 w-2/3 bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-8 w-1/3 bg-muted rounded"></div>
                  </div>
                </div>
              ))
            ) : dynamicProducts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card/35">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20 text-accent" />
                <p className="font-medium">No digital products available right now.</p>
              </div>
            ) : (
              dynamicProducts.map((p: any, i: number) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:border-accent"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-muted relative">
                    <img
                      src={p.thumbnail_path ? `http://localhost:8000/storage/${p.thumbnail_path}` : 'https://placehold.co/600x400/1e293b/ffffff?text=Pharmacy+eBook'}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 end-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
                      {p.is_free ? t('free', 'Free') : `$${Number(p.price).toFixed(2)}`}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6">{p.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-4 w-4 text-accent" /> {p.files_count || 0} {t('landing.digital_products.files')}
                      </span>
                      
                      {p.is_owned ? (
                        <Link
                          to="/student/library"
                          className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-4 py-2 text-xs font-bold text-accent transition hover:bg-accent/20"
                        >
                          {t('landing.digital_products.go_to_library')}
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleOpenCheckout(p)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-accent hover:text-accent-foreground cursor-pointer"
                        >
                          {t('landing.digital_products.buy_now')}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <PricingPlans />

      {/* FAQ */}
      <FaqSection limit={6} />

      {/* STATS */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground md:px-14">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[oklch(0.78_0.16_55/0.35)] blur-3xl" />
            <div className="relative grid gap-10 text-center md:grid-cols-4 md:text-left">
              {[
                { v: 10, s: "+", l: "{t('landing.stats.s1')}" },
                { v: 5000, s: "+", l: "{t('landing.stats.s2')}" },
                { v: 98, s: "%", l: "{t('landing.stats.s3')}" },
                { v: 24, s: "/7", l: "{t('landing.stats.s4')}" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-5xl font-bold md:text-6xl">
                    <span className="bg-gradient-to-r from-accent to-[oklch(0.78_0.16_55)] bg-clip-text text-transparent">
                      <Counter to={s.v} suffix={s.s} />
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-primary-foreground/70">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE (cards grid) */}
      <section id="speakers" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.trust.badge')}</p>
            <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">
              {t('landing.trust.title1')}<span className="text-gradient">{t('landing.trust.title2')}</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, ...t('landing.trust.c1', { returnObjects: true }) as any },
              { icon: Sparkles, ...t('landing.trust.c2', { returnObjects: true }) as any },
              { icon: Globe2, ...t('landing.trust.c3', { returnObjects: true }) as any },
              { icon: ShieldCheck, ...t('landing.trust.c4', { returnObjects: true }) as any },
              { icon: Headphones, ...t('landing.trust.c5', { returnObjects: true }) as any },
              { icon: Briefcase, ...t('landing.trust.c6', { returnObjects: true }) as any }
            ].map((w, i) => (
              <motion.div
                key={w.title}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-[var(--shadow-card)]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-primary">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative overflow-hidden py-28" style={{ background: 'oklch(0.19 0.055 250)' }}>
        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: 'linear-gradient(oklch(1 0 0/0.025) 1px,transparent 1px),linear-gradient(90deg,oklch(1 0 0/0.025) 1px,transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full blur-[140px]" style={{ background: 'oklch(0.78 0.16 175/0.14)' }} />
        <div className="pointer-events-none absolute -bottom-40 right-1/3 h-[500px] w-[500px] rounded-full blur-[140px]" style={{ background: 'oklch(0.78 0.16 55/0.1)' }} />

        {/* Header */}
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.p variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {t('landing.testimonials.badge')}
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mt-3 text-4xl font-bold text-white md:text-5xl">
            {t('landing.testimonials.title_pre', 'ما يقوله')}{' '}
            <span className="text-gradient">{t('landing.testimonials.title_hl', 'طلابنا')}</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mx-auto mt-4 max-w-xl text-sm text-white/50">
            {t('landing.testimonials.subtitle', 'اقرأ شهادات طلابنا الراضين حول العالم')}
          </motion.p>

          {/* Stats strip */}
          <motion.div variants={fadeUp} custom={3} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mt-10 inline-flex flex-wrap justify-center items-center gap-0 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm overflow-hidden">
            {[
              { val: '500+', lbl: t('landing.testimonials.stat1', 'طالب راضٍ') },
              { val: '4.9 ★', lbl: t('landing.testimonials.stat2', 'متوسط التقييم') },
              { val: '98%', lbl: t('landing.testimonials.stat3', 'نسبة النجاح') },
            ].map((s, i) => (
              <div key={i} className={`px-8 py-4 text-center ${i > 0 ? 'border-s border-white/10' : ''}`}>
                <div className="text-2xl font-extrabold text-accent">{s.val}</div>
                <div className="mt-0.5 text-[11px] text-white/40">{s.lbl}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Marquee rows */}
        <div className="relative mt-16 space-y-4">
          {/* Row 1 — left */}
          <div className="flex overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <div className="flex gap-4 flex-nowrap" style={{ animation: 'marquee 40s linear infinite', width: 'max-content' }}>
              {[...allStudentReviews.slice(0, 6), ...allStudentReviews.slice(0, 6)].map((item, i) => (
                <ReviewCard key={i} item={item} />
              ))}
            </div>
          </div>
          {/* Row 2 — right */}
          <div className="flex overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
            <div className="flex gap-4 flex-nowrap" style={{ animation: 'marquee-reverse 40s linear infinite', width: 'max-content' }}>
              {[...allStudentReviews.slice(6), ...allStudentReviews.slice(6)].map((item, i) => (
                <ReviewCard key={i} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative pb-12 pt-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-8 py-16 text-center shadow-[var(--shadow-card)] md:px-16">
            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[oklch(0.78_0.16_55/0.12)] blur-3xl" />
            <Calendar className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-6 text-4xl font-bold text-primary md:text-5xl">
              {t('landing.cta.title1')}{" "}<span className="text-gradient">{t('landing.cta.title2')}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              Begin your journey with Prometrica Academy to secure your professional license,
              sharpen your clinical knowledge, and excel in healthcare.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110">
                {t('landing.cta.btn1')} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-primary transition hover:border-accent">
                Contact Advisor
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* MOCK CHECKOUT MODAL */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPaying && setCheckoutProduct(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                disabled={isPaying}
                onClick={() => setCheckoutProduct(null)}
                className="absolute top-4 end-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>

              {checkoutSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">{t('auth.success', 'Success!')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.digital_products.purchase_success')}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">{t('landing.digital_products.checkout_title')}</h3>
                      <p className="text-xs text-muted-foreground">{t('landing.digital_products.pay_sim')}</p>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {checkoutError}
                    </div>
                  )}

                  <div className="mb-5 rounded-2xl bg-secondary/50 p-4 border border-border">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Product</div>
                    <div className="font-bold text-primary">{checkoutProduct.title}</div>
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Price</span>
                      <span className="text-xl font-extrabold text-accent">${Number(checkoutProduct.price).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Card Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        {t('landing.digital_products.card_number')}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                          className="w-full rounded-xl border border-border bg-background py-2.5 ps-10 pe-4 text-sm outline-none focus:border-accent"
                        />
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        {t('landing.digital_products.cardholder')}
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          {t('landing.digital_products.expiry')}
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          {t('landing.digital_products.cvv')}
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            maxLength={3}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full rounded-xl border border-border bg-background py-2.5 ps-4 pe-10 text-sm outline-none focus:border-accent text-center font-mono"
                          />
                          <Lock className="absolute right-3 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmPurchase}
                      disabled={isPaying}
                      className="w-full mt-6 inline-flex justify-center items-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-75"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('landing.digital_products.processing')}
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          {t('landing.digital_products.pay_confirm')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewCard({ item }: { item: typeof allStudentReviews[0] }) {
  return (
    <div className="w-72 flex-shrink-0 rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'oklch(1 0 0/0.06)', border: '1px solid oklch(1 0 0/0.09)' }}>
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5"
            style={{ fill: i < item.rating ? 'oklch(0.78 0.16 55)' : 'oklch(1 0 0/0.15)', color: i < item.rating ? 'oklch(0.78 0.16 55)' : 'oklch(1 0 0/0.15)' }} />
        ))}
      </div>
      {/* Quote */}
      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'oklch(1 0 0/0.78)' }}>
        "{item.q}"
      </p>
      {/* Author */}
      <div className="mt-auto flex items-center gap-3 border-t pt-3" style={{ borderColor: 'oklch(1 0 0/0.08)' }}>
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: item.color }}>
          {item.a[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">{item.a}</p>
          <p className="text-[10px]" style={{ color: 'oklch(1 0 0/0.4)' }}>{item.r}</p>
        </div>
      </div>
    </div>
  );
}
