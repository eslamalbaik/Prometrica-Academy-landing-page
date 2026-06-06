import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Stethoscope, ClipboardCheck, MessageSquare,
  FlaskConical, Compass, Sparkles, ShieldCheck, Globe2, Users,
  Headphones, Briefcase, ArrowRight, CheckCircle2, Calendar, BookOpen, Star, Gift,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroVisual } from "@/components/HeroVisual";
import { Counter } from "@/components/Counter";
import { api } from "@/lib/api";
import { Link } from "@tanstack/react-router";
import { PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } }),
};

function Index() {
  const { t } = useTranslation();

  const { data: dynamicCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['landingCourses'],
    queryFn: async () => {
      const res = await api.get('/landing/courses');
      return res.data;
    }
  });

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
                        <Link 
                          to="/courses/$id"
                          params={{ id: String(c.id) }}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-accent cursor-pointer">
                          {t('landing.courses.viewCourse')} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </Link>
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

      {/* PROCESS */}
      <section id="process" className="relative bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.process.badge')}</p>
            <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">
              {t('landing.process.title1')}<span className="text-gradient">{t('landing.process.title2')}</span>
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 hidden h-full w-px bg-gradient-to-b from-accent via-accent/60 to-transparent md:block" />
            <div className="space-y-6">
              {[
                { n: "01", ...t('landing.process.s1', { returnObjects: true }) as any },
                { n: "02", ...t('landing.process.s2', { returnObjects: true }) as any },
                { n: "03", ...t('landing.process.s3', { returnObjects: true }) as any },
                { n: "04", ...t('landing.process.s4', { returnObjects: true }) as any },
                { n: "05", ...t('landing.process.s5', { returnObjects: true }) as any }
              ].map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex flex-col gap-4 md:flex-row md:items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className="md:w-1/2">
                    <div className={`rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] ${i % 2 === 1 ? "md:ml-auto" : ""} max-w-md`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-accent">{t('landing.process.step')} {s.n}</div>
                      <h3 className="mt-1 text-xl font-semibold text-primary">{s.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  </div>
                  <div className="relative hidden h-5 w-5 shrink-0 items-center justify-center md:flex">
                    <div className="h-3 w-3 rounded-full bg-accent shadow-[0_0_0_6px_oklch(0.78_0.16_175/0.2)]" />
                  </div>
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('landing.testimonials.badge')}</p>
            <h2 className="mt-3 text-4xl font-bold text-primary md:text-5xl">{t('landing.testimonials.title')}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              t('landing.testimonials.t1', { returnObjects: true }) as any,
              t('landing.testimonials.t2', { returnObjects: true }) as any,
              t('landing.testimonials.t3', { returnObjects: true }) as any
            ].map((t_item, i) => (
              <motion.figure
                key={i}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="relative rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]"
              >
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-primary/90">
                  "{t_item.q}"
                </blockquote>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <div className="text-sm font-semibold text-primary">{t_item.a}</div>
                  <div className="text-xs text-muted-foreground">{t_item.r}</div>
                </figcaption>
              </motion.figure>
            ))}
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
    </div>
  );
}
