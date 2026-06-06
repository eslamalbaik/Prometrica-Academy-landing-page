import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import logo from '@/assets/prometrica-logo.png'
import { motion } from 'framer-motion'
import { GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  variant?: 'login' | 'register'
}

export function AuthLayout({ children, variant = 'login' }: AuthLayoutProps) {
  const { t } = useTranslation()

  const titleKey = variant === 'register' ? 'auth.register_hero_title' : 'auth.login_hero_title'
  const subtitleKey = variant === 'register' ? 'auth.register_hero_subtitle' : 'auth.login_hero_subtitle'

  const features = [
    { icon: GraduationCap, text: t('auth.hero_feature_1') },
    { icon: ShieldCheck, text: t('auth.hero_feature_2') },
    { icon: Sparkles, text: t('auth.hero_feature_3') },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-teal/30 opacity-90" />
          <div className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-16 -start-16 h-64 w-64 rounded-full bg-orange/15 blur-3xl" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logo} alt="Prometrica Academy" className="h-14 w-auto brightness-0 invert" />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 space-y-8"
          >
            <h2 className="text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
              {t(titleKey)}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-primary-foreground/80">
              {t(subtitleKey)}
            </p>
            <ul className="space-y-4 text-sm text-primary-foreground/90">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>

          <p className="relative z-10 text-xs text-primary-foreground/50">
            {t('auth.copyright')}
          </p>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
              <img src={logo} alt="Prometrica Academy" className="h-10 w-auto" />
            </Link>
            <div className="ms-auto">
              <LanguageSwitcher />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-12 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="w-full max-w-md"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
