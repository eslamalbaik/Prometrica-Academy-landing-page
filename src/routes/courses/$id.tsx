import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PlayCircle, Star, CheckCircle2, AlertCircle, Clock, User as UserIcon, CreditCard, Lock, Loader2, X, ShoppingBag, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLoginUrl } from "@/lib/authSession";
import { pageTitle } from "@/lib/siteMeta";

export const Route = createFileRoute("/courses/$id")({
  head: () => ({
    meta: [{ title: pageTitle("Course") }],
  }),
  component: CourseDetails,
});

function CourseDetails() {
  const { id } = Route.useParams();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const res = await api.get(`/landing/courses/${id}`);
      return res.data;
    }
  });

  useEffect(() => {
    if (course?.title)
      document.title = pageTitle(course.title)
  }, [course?.title])

  const reviews = course?.reviews || [];
  const totalReviews = reviews.length;

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r: any) => {
    const rating = Math.round(Number(r.rating));
    if (rating >= 1 && rating <= 5) {
      counts[rating]++;
    }
  });

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars] || 0;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, pct, count };
  });

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl(window.location.href);
      return;
    }

    setIsEnrolling(true);
    setEnrollError(null);

    try {
      const res = await api.post(`/courses/${id}/enroll`);
      if (res.data.requires_payment) {
        setShowCheckout(true);
        setCardNumber('');
        setCardHolder('');
        setCardExpiry('');
        setCardCvv('');
      } else {
        queryClient.invalidateQueries({ queryKey: ['my-courses'] });
        setEnrollSuccess(true);
      }
    } catch (err: any) {
      setEnrollError(err.response?.data?.message || t('enroll_error', 'An error occurred during enrollment.'));
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setEnrollError(t('validation.required', 'Please fill in all payment details.'));
      return;
    }
    setIsPaying(true);
    setEnrollError(null);

    try {
      const res = await api.post(`/courses/${id}/enroll`, { payment_confirmed: true });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      setEnrollSuccess(true);
      setShowCheckout(false);
    } catch (err: any) {
      setEnrollError(err.response?.data?.message || t('enroll_error', 'An error occurred during enrollment.'));
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar variant="solid" />
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar variant="solid" />
        <div className="flex h-screen flex-col items-center justify-center text-center px-4">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold text-foreground">{t('course_not_found', 'Course not found')}</h1>
          <p className="mt-2 text-muted-foreground">{t('course_removed_msg', 'This course may have been removed or doesn\'t exist.')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar variant="solid" />
      
      {/* 1. Premium Hero Section */}
      <div className="bg-slate-900 py-16 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/40 z-0"></div>
        <div className="mx-auto max-w-7xl px-4 md:px-6 relative z-10">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6 lg:pe-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-xs font-semibold tracking-wide text-accent mb-6 uppercase">
                  {course.category || t('category_general', 'Pharmacy')}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                  {course.title}
                </h1>
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-3xl">
                  {course.short_description || course.description}
                </p>
                
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-slate-300">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-accent" /> 
                    <span>{course.lessons_count || 0} {t('lessons', 'Lessons')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-accent" /> 
                    <span>{course.total_duration || 0} {t('minutes', 'Minutes')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" /> 
                    <span>{Number(course.average_rating || 0).toFixed(1)} {t('rating', 'Rating')}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 w-full flex-1">
        <div className="grid gap-12 lg:grid-cols-3 relative">
          
          {/* Left Column: Course Content */}
          <div className="lg:col-span-2 space-y-16 py-12 lg:pe-8">
            
            {/* About This Course */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('about_this_course', 'About This Course')}</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{course.description || course.short_description}</p>
              </div>
            </section>

            {/* Course Curriculum */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">{t('course_curriculum', 'Course Curriculum')}</h2>
                <span className="text-sm font-medium text-muted-foreground">
                  {course.modules?.length || 0} {t('modules', 'modules')} • {course.lessons_count || 0} {t('lessons', 'lessons')}
                </span>
              </div>
              
              <div className="space-y-4">
                {course.modules?.map((mod: any, idx: number) => (
                  <div key={mod.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="bg-secondary/30 p-5 font-semibold text-foreground border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm">
                          {idx + 1}
                        </div>
                        {mod.title}
                      </div>
                      <span className="text-sm font-normal text-muted-foreground">
                        {mod.lessons?.length || 0} {t('lessons', 'lessons')}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {mod.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-muted/30 transition-colors ps-6 md:ps-16">
                          <div className="flex items-center gap-3">
                            <PlayCircle className="h-5 w-5 text-muted-foreground/70" />
                            <span className="font-medium text-foreground/90">{lesson.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                            {lesson.duration_minutes || 15}m
                          </span>
                        </div>
                      ))}
                      {(!mod.lessons || mod.lessons.length === 0) && (
                        <div className="p-5 text-sm text-muted-foreground text-center bg-card">{t('no_lessons_yet', 'No lessons in this module yet.')}</div>
                      )}
                    </div>
                  </div>
                ))}
                {(!course.modules || course.modules.length === 0) && (
                  <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    {t('curriculum_preparing', 'Curriculum is being prepared. Check back later!')}
                  </div>
                )}
              </div>
            </section>

            {/* Instructor Profile */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('instructor', 'Instructor')}</h2>
              <div className="rounded-3xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start shadow-sm">
                <img 
                  src="https://placehold.co/150x150/1e293b/ffffff?text=Instructor" 
                  alt="Instructor" 
                  className="h-24 w-24 rounded-full object-cover border-4 border-muted"
                />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Dr. Ahmed Al-Rashid</h3>
                  <p className="text-sm text-primary font-medium mb-4">Senior Clinical Pharmacist</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    With over 15 years of experience in clinical pharmacy and academia, Dr. Ahmed has helped thousands of students pass their licensing exams and excel in their careers. 
                  </p>
                </div>
              </div>
            </section>

            {/* Student Reviews */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6">{t('student_reviews', 'Student Reviews')}</h2>
              <div className="grid gap-8 md:grid-cols-12 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
                
                {/* Rating Breakdown */}
                <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-e border-border pb-6 md:pb-0 md:pe-6">
                  <div className="text-6xl font-extrabold text-foreground mb-2">
                    {Number(course.average_rating || 0).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 mb-2">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star 
                        key={k} 
                        className={`h-5 w-5 ${k < Math.round(Number(course.average_rating || 0)) ? 'fill-current' : 'opacity-30'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('based_on_reviews', 'Based on {{count}} reviews', { count: totalReviews })}
                  </p>
                </div>

                {/* Progress Bars */}
                <div className="md:col-span-8 space-y-3">
                  {breakdown.map((r) => (
                    <div key={r.stars} className="flex items-center gap-4">
                      <div className="w-24 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                        {r.stars} <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <div className="w-12 text-end text-sm font-medium text-muted-foreground">{r.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Real Comments */}
              <div className="mt-8 space-y-6">
                {reviews.map((r: any) => {
                  const userName = r.user?.name || "Anonymous";
                  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || "U";
                  return (
                    <div key={r.id} className="border-b border-border pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{userName}</h4>
                          <div className="flex items-center text-yellow-400 gap-0.5">
                            {Array.from({ length: 5 }).map((_, k) => (
                              <Star 
                                key={k} 
                                className={`h-3 w-3 ${k < Math.round(Number(r.rating)) ? 'fill-current' : 'opacity-30'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ps-12 whitespace-pre-line">
                        {r.review}
                      </p>
                    </div>
                  );
                })}
                {reviews.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t('no_reviews_yet', 'No reviews for this course yet.')}
                  </p>
                )}
              </div>
            </section>
            
          </div>

          {/* Right Column: Floating Enrollment Card */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-28 lg:-mt-64 rounded-3xl border border-border bg-card p-6 shadow-2xl z-20 flex flex-col">
              
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted mb-6 shadow-inner">
                <img 
                  src={course.thumbnail ? `http://localhost:8000/storage/${course.thumbnail}` : 'https://placehold.co/600x400/1e293b/ffffff?text=Course'} 
                  alt={course.title} 
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-extrabold text-foreground">
                    {course.is_free ? t('free', 'Free') : `$${course.discount_price || course.price}`}
                  </span>
                  {course.discount_price && course.price > course.discount_price && (
                    <span className="text-lg line-through text-muted-foreground mb-1">${course.price}</span>
                  )}
                </div>
              </div>

              {enrollError && (
                <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {enrollError}
                </div>
              )}

              {user?.role === 'admin' ? (
                <a 
                  href="http://localhost:5173/dashboards/lms"
                  className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                >
                  {t('open_course', 'Open Course')}
                </a>
              ) : enrollSuccess || course.is_enrolled ? (
                <Link 
                  to="/student/learn/$id"
                  params={{ id: String(course.id) }}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-green-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-green-700 shadow-lg shadow-green-600/20 hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="h-5 w-5" /> {t('go_to_course', 'Go to Course')}
                </Link>
              ) : (
                <button 
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
                >
                  {isEnrolling ? t('enrolling', 'Enrolling...') : t('enroll_now', 'Enroll Now')}
                </button>
              )}

              <div className="mt-8 space-y-4 text-sm font-medium text-muted-foreground">
                <h4 className="text-foreground font-bold mb-2 uppercase tracking-wider text-xs">{t('this_course_includes', 'This course includes:')}</h4>
                <div className="flex items-center gap-3"><PlayCircle className="h-4 w-4 text-accent" /> {course.total_duration || 15} {t('hours_on_demand_video', 'hours on-demand video')}</div>
                <div className="flex items-center gap-3"><BookOpen className="h-4 w-4 text-accent" /> {course.lessons_count || 10} {t('downloadable_resources', 'downloadable resources')}</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-accent" /> {t('full_lifetime_access', 'Full lifetime access')}</div>
                <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-accent" /> {t('access_on_mobile_and_web', 'Access on mobile and web')}</div>
                <div className="flex items-center gap-3"><UserIcon className="h-4 w-4 text-accent" /> {t('certificate_of_completion', 'Certificate of completion')}</div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                {t('money_back_guarantee', '30-Day Money-Back Guarantee')}
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />

      {/* COURSE CHECKOUT MODAL */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPaying && setShowCheckout(false)}
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
                onClick={() => setShowCheckout(false)}
                className="absolute top-4 end-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">{t('landing.digital_products.checkout_title', 'Secure Checkout')}</h3>
                    <p className="text-xs text-muted-foreground">{t('landing.digital_products.pay_sim', 'Simulated Secure Payment')}</p>
                  </div>
                </div>

                {enrollError && (
                  <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive border border-destructive/20 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {enrollError}
                  </div>
                )}

                <div className="mb-5 rounded-2xl bg-secondary/50 p-4 border border-border">
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Course</div>
                  <div className="font-bold text-primary">{course.title}</div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Price</span>
                    <span className="text-xl font-extrabold text-accent">${course.discount_price || course.price}</span>
                  </div>
                </div>

                {/* Card Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      {t('landing.digital_products.card_number', 'Card Number')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        className="w-full rounded-xl border border-border bg-background py-2.5 ps-10 pe-4 text-sm outline-none focus:border-accent text-foreground"
                      />
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      {t('landing.digital_products.cardholder', 'Cardholder Name')}
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        {t('landing.digital_products.expiry', 'MM/YY')}
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent text-center text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        {t('landing.digital_products.cvv', 'CVV')}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full rounded-xl border border-border bg-background py-2.5 ps-4 pe-10 text-sm outline-none focus:border-accent text-center font-mono text-foreground"
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
                        {t('landing.digital_products.processing', 'Processing...')}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {t('landing.digital_products.pay_confirm', 'Confirm Payment')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
