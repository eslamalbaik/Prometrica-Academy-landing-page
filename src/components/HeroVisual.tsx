import { motion } from "framer-motion";
import { Pill, Activity, Award, Stethoscope } from "lucide-react";
import hero from "@/assets/hero-pharmacists.png";

export function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-[560px]">
      {/* Background ring */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-accent via-accent/80 to-[oklch(0.7_0.13_200)]" />
      <div className="absolute inset-0 rounded-full opacity-70" />

      {/* Orbiting dashed rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -inset-4 rounded-full border border-accent/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />

      {/* Photo */}
      <motion.img
        src={hero}
        alt="Healthcare professionals"
        width={1024}
        height={1024}
        className="relative z-10 h-full w-full rounded-full object-cover shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      />

      {/* Floating stat badges */}
      <motion.div
        className="absolute left-0 top-20 z-20 flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <span className="animate-float-y inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <Award className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs text-muted-foreground">Pass Rate</div>
          <div className="text-sm font-bold">98%</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-4 top-[50%] z-20 flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <span className="animate-float-y inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[oklch(0.78_0.16_55/0.15)] text-[oklch(0.65_0.16_55)]" style={{ animationDelay: "1s" }}>
          <Pill className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs text-muted-foreground">Pharmacists</div>
          <div className="text-sm font-bold">5,000+</div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-6 z-20 flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-[var(--shadow-card)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <span className="animate-float-y inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent" style={{ animationDelay: "2s" }}>
          <Activity className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs text-muted-foreground">Live cohorts</div>
          <div className="text-sm font-bold">Weekly</div>
        </div>
      </motion.div>

      {/* Floating icons */}
      <Stethoscope className="absolute -right-2 bottom-24 h-7 w-7 text-primary/30 animate-float-rot" />
    </div>
  );
}
