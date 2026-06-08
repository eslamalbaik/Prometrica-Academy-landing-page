import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import { 
  User, 
  BookOpen, 
  Award, 
  Settings, 
  Lock, 
  HelpCircle,
  PlayCircle,
  LogOut,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Camera,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { pageTitle } from "@/lib/siteMeta";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [{ title: pageTitle("My Dashboard") }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) setActiveTab(tab);
  }, []);
  
  const tabs = [
    { id: "subscriptions", label: t('tab_subscriptions', 'Subscriptions'), icon: PlayCircle },
    { id: "courses", label: t('tab_courses', 'Courses'), icon: BookOpen },
    { id: "certificates", label: t('tab_certificates', 'Certificates'), icon: Award },
    { id: "account", label: t('tab_account', 'Account'), icon: Settings },
    { id: "profile", label: t('tab_profile', 'Profile'), icon: User },
    { id: "password", label: t('tab_change_password', 'Change Password'), icon: Lock },
    { id: "help", label: t('tab_help', 'Help'), icon: HelpCircle },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        
        {/* Tab Navigation (Horizontal Scrollable) */}
        <div className="mb-8 overflow-x-auto hide-scrollbar rounded-2xl bg-white p-2 shadow-sm border border-gray-100">
          <div className="flex w-max items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition-all duration-200 ${
                    isActive 
                      ? 'text-emerald-700 bg-emerald-50' 
                      : 'text-gray-500 hover:text-slate-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'account' && <AccountTab user={user} />}
              {activeTab === 'password' && <PasswordTab />}
              {activeTab === 'courses' && <CoursesTab />}
              {activeTab === 'subscriptions' && <SubscriptionsTab />}
              {activeTab === 'certificates' && <CertificatesTab />}
              {activeTab === 'profile' && <ProfileTab user={user} />}
              {activeTab === 'help' && <HelpTab />}
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// Tab Components
// ---------------------------------------------------------

function AccountTab({ user }: { user: any }) {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.put('/student/profile', data);
    },
    onSuccess: (res) => {
      setSuccessMsg(t('profile_updated_successfully', 'Profile updated successfully'));
      setErrors({});
      updateUser(res.data.user);
      setTimeout(() => setSuccessMsg(""), 5000);
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('account_details', 'Account Details')}</h2>
      
      {successMsg && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('first_name', 'First Name')}</label>
            <input 
              type="text" 
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              dir="auto"
            />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('last_name', 'Last Name')}</label>
            <input 
              type="text" 
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              dir="auto"
            />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('phone', 'Phone')}</label>
            <div className="relative">
              <Smartphone className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 234 567 890"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 ps-10 pe-4 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-start"
                dir="ltr"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('email', 'Email')}</label>
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 ps-10 pe-4 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-start"
                dir="ltr"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('password_preview', 'Password Preview')}</label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
              <input 
                type="password" 
                value="********"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 ps-10 pe-4 py-2.5 text-sm font-medium text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full sm:w-auto rounded-lg bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? t('updating', 'Updating...') : t('update_account', 'Update Account')}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordTab() {
  const { t } = useTranslation();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [successMsg, setSuccessMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return api.put('/student/password', data);
    },
    onSuccess: (res) => {
      setSuccessMsg(t('password_updated_successfully', 'Password updated successfully'));
      setErrors({});
      setFormData({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setSuccessMsg(""), 5000);
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_change_password', 'Change Password')}</h2>
      
      {successMsg && (
        <div className="mb-6 rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-center gap-3 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('current_password', 'Current Password')}</label>
          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
            <input 
              type={showCurrent ? "text" : "password"} 
              value={formData.current_password}
              onChange={(e) => setFormData({...formData, current_password: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 ps-10 pe-10 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-start"
              dir="ltr"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('new_password', 'New Password')}</label>
          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
            <input 
              type={showNew ? "text" : "password"} 
              value={formData.new_password}
              onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 ps-10 pe-10 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-start"
              dir="ltr"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute top-1/2 -translate-y-1/2 end-3 text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.new_password && <p className="text-xs text-red-500 mt-1">{errors.new_password[0]}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('confirm_new_password', 'Confirm New Password')}</label>
          <div className="relative">
            <Lock className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-gray-400" />
            <input 
              type={showNew ? "text" : "password"} 
              value={formData.new_password_confirmation}
              onChange={(e) => setFormData({...formData, new_password_confirmation: e.target.value})}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 ps-10 pe-4 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors text-start"
              dir="ltr"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full sm:w-auto rounded-lg bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-70"
          >
            {mutation.isPending ? t('updating', 'Updating...') : t('update_password', 'Update Password')}
          </button>
        </div>
      </form>
    </div>
  );
}

function CoursesTab() {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-dashboard-data'],
    queryFn: async () => {
      const res = await api.get('/student/dashboard');
      return res.data;
    }
  });

  const courseList = data?.courses || [];

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_courses', 'Courses')}</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" /></div>
      ) : isError ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
          Failed to load courses.
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('watching_now', 'Watching Now')}</h3>
            {courseList.length === 0 ? (
              <EmptyState message={t('no_courses_watched', "You haven't watched any courses yet.")} icon={<PlayCircle className="h-10 w-10 text-gray-300" />} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courseList.map((course: any) => (
                  <CourseCard key={course.id} course={course} t={t} />
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('favorites', 'Favorites')}</h3>
            <EmptyState message={t('no_courses_watched', "You haven't watched any courses yet.")} icon={<BookOpen className="h-10 w-10 text-gray-300" />} />
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('archived', 'Archived')}</h3>
            <EmptyState message={t('no_courses_watched', "You haven't watched any courses yet.")} icon={<BookOpen className="h-10 w-10 text-gray-300" />} />
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, t }: { course: any, t: any }) {
  const progress = course.pivot?.progress || 0;
  return (
    <Link 
      to="/student/learn/$id" 
      params={{ id: String(course.id) }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-emerald-500/50"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img 
          src={course.thumbnail ? `${API_BASE}/storage/${course.thumbnail}` : 'https://placehold.co/600x400/f8fafc/94a3b8?text=Course'}
          alt={course.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {course.title}
        </h3>
        
        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-gray-500">{t('progress', 'Progress')}</span>
            <span className="font-bold text-emerald-600">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 mb-3">
            <div 
              className="h-full rounded-full bg-emerald-500 transition-all duration-1000" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="text-sm font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1">
            {t('open_course', 'Open Course')} &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}

interface Subscription {
  type: 'course' | 'product';
  id: number;
  title: string;
  thumbnail: string | null;
  progress: number | null;
  started_at: string | null;
  expires_at: string | null;
  is_lifetime: boolean;
  is_active: boolean;
  days_remaining: number | null;
}

function SubscriptionsTab() {
  const { t } = useTranslation();

  const { data: subs = [], isLoading, isError } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: async () => {
      const res = await api.get('/v1/my-subscriptions');
      return (res.data?.subscriptions ?? []) as Subscription[];
    },
  });

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_subscriptions', 'Subscriptions')}</h2>

      {isLoading ? (
        <div className="flex justify-center py-16"><PlayCircle className="h-8 w-8 animate-pulse text-gray-300" /></div>
      ) : isError ? (
        <EmptyState message={t('subs_load_error', 'Could not load your subscriptions.')} icon={<AlertCircle className="h-10 w-10 text-gray-300" />} />
      ) : subs.length === 0 ? (
        <EmptyState message={t('no_subscriptions', 'You have no active subscriptions yet.')} icon={<PlayCircle className="h-10 w-10 text-gray-300" />} />
      ) : (
        <div className="space-y-3">
          {subs.map((s, i) => {
            const expiringSoon = s.is_active && s.days_remaining !== null && s.days_remaining <= 7;
            return (
              <div
                key={`${s.type}-${s.id}-${i}`}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 ${
                  s.is_active ? 'border-gray-100' : 'border-red-100 bg-red-50/40'
                }`}
              >
                {/* Thumbnail */}
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {s.thumbnail ? (
                    <img src={`${API_BASE}/storage/${s.thumbnail}`} alt={s.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {s.type === 'course'
                        ? <BookOpen className="h-6 w-6 text-gray-300" />
                        : <FileText className="h-6 w-6 text-gray-300" />}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      {s.type === 'course' ? t('subs_course', 'Course') : t('subs_product', 'File')}
                    </span>
                    <h3 className="truncate font-semibold text-slate-900">{s.title}</h3>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {s.is_lifetime ? (
                      <span>{t('subs_lifetime', 'Lifetime access')}</span>
                    ) : (
                      <span>
                        {t('subs_expires', 'Expires')}: {fmtDate(s.expires_at)}
                        {s.is_active && s.days_remaining !== null && (
                          <> · {s.days_remaining} {t('subs_days_left', 'days left')}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  {s.is_active ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      expiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {expiringSoon ? t('subs_expiring', 'Expiring soon') : t('subs_active', 'Active')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {t('subs_expired', 'Expired')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CertificatesTab() {
  const { t } = useTranslation();
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState('');

  const { data: certificates = [], isLoading, isError } = useQuery({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const res = await api.get('/student/certificates');
      return res.data;
    },
  });

  const handleVerify = async (cert: any) => {
    setVerifying(cert.ulid);
    setVerifyResult(null);
    setVerifyError('');
    try {
      const res = await api.get(`/certificates/${cert.ulid}/verify`, {
        params: {
          signature: cert.signature,
          userId: cert.user_id,
          courseId: cert.course_id
        }
      });
      setVerifyResult(res.data);
    } catch {
      setVerifyError(t('certificate_invalid', 'Could not verify this certificate.'));
    } finally {
      setVerifying(null);
    }
  };

  const [downloading, setDownloading] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const handleRegenerate = async (cert: any) => {
    setRegenerating(cert.ulid);
    try {
      await api.post(`/student/certificates/${cert.ulid}/regenerate`);
      toast.info(t('certificate_regenerating', 'Certificate is being updated. Please wait a few seconds then download again.'));
    } catch {
      toast.error(t('regenerate_failed', 'Failed to update certificate. Please try again.'));
    } finally {
      setRegenerating(null);
    }
  };

  const handleDownload = async (cert: any) => {
    setDownloading(cert.ulid);
    try {
      const res = await api.get(`/v1/certificates/${cert.ulid}/download`);
      const signedUrl = res.data.download_url;
      if (signedUrl) {
        // Fetch file via Axios (using blob) to handle 409 Conflict/pending gracefully
        const fileRes = await api.get(signedUrl, { responseType: 'blob' });
        
        const blob = new Blob([fileRes.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        const cleanCourseTitle = cert.course?.title 
          ? cert.course.title.toLowerCase().replace(/\s+/g, '-') 
          : 'certificate';
        link.setAttribute('download', `certificate-${cleanCourseTitle}.pdf`);
        
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(t('download_success', 'Certificate downloaded successfully!'));
      }
    } catch (err: any) {
      console.error('Download failed', err);
      if (err.response?.status === 409) {
        toast.info(t('certificate_generating', 'Your certificate is being generated. Please wait a moment...'));
      } else {
        toast.error(t('download_failed', 'Failed to download certificate. Please try again.'));
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_certificates', 'Certificates')}</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : isError ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
          {t('failed_to_load', 'Failed to load certificates.')}
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <Award className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">{t('no_certificates_yet', 'No certificates yet')}</h3>
          <p className="text-sm text-gray-500">{t('complete_course_to_earn', 'Complete a course 100% to earn your certificate.')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifyResult && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-emerald-800 mb-1">{t('valid_certificate', 'Valid Certificate')}</p>
                <p className="text-emerald-700">{t('student', 'Student')}: <strong>{verifyResult.student}</strong></p>
                <p className="text-emerald-700">{t('course', 'Course')}: <strong>{verifyResult.course}</strong></p>
                <p className="text-emerald-700">{t('issued', 'Issued')}: <strong>{verifyResult.issued_at}</strong></p>
              </div>
              <button onClick={() => setVerifyResult(null)} className="ms-auto text-emerald-400 hover:text-emerald-600">✕</button>
            </div>
          )}

          {verifyError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {verifyError}
              <button onClick={() => setVerifyError('')} className="ms-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert: any) => (
              <div key={cert.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
                {/* Course thumbnail */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {cert.course?.thumbnail ? (
                      <img
                        src={`${API_BASE}/storage/${cert.course.thumbnail}`}
                        alt={cert.course?.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm line-clamp-2">{cert.course?.title}</p>
                    {cert.course?.category && (
                      <span className="inline-block mt-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {cert.course.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <Award className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-emerald-800">{t('certificate_of_completion', 'Certificate of Completion')}</p>
                    <p className="text-xs text-emerald-600 truncate">
                      {t('issued', 'Issued')}: {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* ULID */}
                <p className="text-xs text-gray-400 font-mono truncate">{cert.ulid}</p>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Download PDF */}
                  <button
                    disabled={downloading === cert.ulid}
                    onClick={() => handleDownload(cert)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    {downloading === cert.ulid
                      ? t('downloading', 'Downloading…')
                      : t('download_pdf', 'Download PDF')}
                  </button>

                  {/* Verify */}
                  <button
                    disabled={verifying === cert.ulid}
                    onClick={() => handleVerify(cert)}
                    className="flex-1 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-60"
                  >
                    {verifying === cert.ulid
                      ? t('verifying', 'Verifying…')
                      : t('verify_certificate', 'Verify')}
                  </button>

                  {/* Regenerate */}
                  <button
                    disabled={regenerating === cert.ulid}
                    onClick={() => handleRegenerate(cert)}
                    title={t('regenerate_certificate', 'Update Certificate')}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${regenerating === cert.ulid ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Instant local preview while the upload is in flight.
  const [preview, setPreview] = useState<string | null>(null);

  const avatarSrc = preview
    ? preview
    : user?.avatar
      ? `${API_BASE}/storage/${user.avatar}`
      : `https://placehold.co/200x200/0f172a/ffffff?text=${encodeURIComponent(user?.name?.[0] ?? "U")}`;

  const onPick = () => fileInputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/v1/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Sync auth context so navbar + dashboard reflect the new picture.
      if (res.data?.user) updateUser(res.data.user);
      toast.success(t("avatar_updated", "Profile picture updated."));
    } catch {
      setError(t("avatar_failed", "Could not upload the image. Use JPG/PNG up to 4MB."));
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_profile', 'Profile')}</h2>
      <div className="max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-6 flex items-start gap-6">
        <div className="relative shrink-0">
          <img
            src={avatarSrc}
            alt={user?.name}
            className="h-24 w-24 rounded-xl object-cover border border-gray-200 shadow-sm"
          />
          {/* Camera button overlay */}
          <button
            type="button"
            onClick={onPick}
            disabled={uploading}
            className="absolute -bottom-2 -end-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-white hover:bg-primary/90 disabled:opacity-60"
            aria-label={t("change_photo", "Change photo")}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={onFile}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 capitalize">
            {user?.role}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            {t("avatar_hint", "Click the camera icon to upload a new photo (JPG/PNG, max 4MB).")}
          </p>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function HelpTab() {
  const { t } = useTranslation();
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{t('tab_help', 'Help')}</h2>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 max-w-xl">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 mt-1">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Contact Support</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {t('help_contact_text', 'If you need any assistance, please contact our support team at:')}
            </p>
            <a href="mailto:support@prometrica.com" className="inline-flex text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
              support@prometrica.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// Shared Components
// ---------------------------------------------------------

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 px-4 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}
