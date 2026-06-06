const fs = require('fs');

let content = fs.readFileSync('./src/routes/index.tsx', 'utf8');

// Add import
content = content.replace('import { PlayCircle } from "lucide-react";', 'import { PlayCircle } from "lucide-react";\nimport { useTranslation } from "react-i18next";');

// Find Index component and add hook
content = content.replace('function Index() {', 'function Index() {\n  const { t } = useTranslation();\n');

// Top announcement strip
content = content.replace('<span>Online pharmacy education worldwide</span>', '<span>{t(\'landing.announcement.t1\')}</span>');
content = content.replace('<span>Pharmacist community</span>', '<span>{t(\'landing.announcement.t2\')}</span>');
content = content.replace('<span>Free starter materials available</span>', '<span>{t(\'landing.announcement.t3\')}</span>');

// HERO
content = content.replace('Learning platform for healthcare professionals', '{t(\'landing.hero.badge\')}');
content = content.replace('The platform that turns pharmacists into{" "}', '{t(\'landing.hero.h1_1\')}{" "}');
content = content.replace('<span className="text-gradient">licensed experts.</span>', '<span className="text-gradient">{t(\'landing.hero.h1_2\')}</span>');
content = content.replace('Prometrica Academy delivers strategic learning paths, realistic exams, and complete\n              professional development — built so pharmacists pass Prometric exams and excel in\n              competitive job markets.', '{t(\'landing.hero.desc\')}');
content = content.replace('Register & Get Gifts', '{t(\'landing.hero.btn1\')}');
content = content.replace('Explore Programs', '{t(\'landing.hero.btn2\')}');

// Hero stats loop
content = content.replace('{["Globally aligned", "98% pass rate", "Live mentorship"].map((t) => (', '{[t(\'landing.hero.feat1\'), t(\'landing.hero.feat2\'), t(\'landing.hero.feat3\')].map((feat, index) => (');
content = content.replace('key={t}', 'key={index}');
content = content.replace('{t}', '{feat}');

// Why Prometrica
content = content.replace('>Why Prometrica<', '>{t(\'landing.why.badge\')}<');
content = content.replace('Built for pharmacists who want to <span className="text-gradient">win the exam.</span>', '{t(\'landing.why.title1\')}<span className="text-gradient">{t(\'landing.why.title2\')}</span>');

// Why array loop
content = content.replace('{why.map((w, i) => (', '{[\n              { icon: Globe2, ...t(\'landing.why.c1\', { returnObjects: true }) as any },\n              { icon: Users, ...t(\'landing.why.c2\', { returnObjects: true }) as any },\n              { icon: BookOpen, ...t(\'landing.why.c3\', { returnObjects: true }) as any },\n              { icon: Gift, ...t(\'landing.why.c4\', { returnObjects: true }) as any }\n            ].map((w, i) => (');


// ABOUT band
content = content.replace('Educational webinars and courses for{" "}', '{t(\'landing.about.title1\')}');
content = content.replace('<span className="text-gradient">pharmacists and doctors.</span>', '<span className="text-gradient">{t(\'landing.about.title2\')}</span>');
content = content.replace('Stay at the edge of healthcare with our specialist webinars. Build deep understanding,\n            present your expertise, and grow your professional reach.', '{t(\'landing.about.desc\')}');
content = content.replace('Learn more <ArrowRight', '{t(\'landing.about.btn\')} <ArrowRight');

// PROGRAMS
content = content.replace('>Core Solutions<', '>{t(\'landing.programs.badge\')}<');
content = content.replace('>Our academic programs<', '>{t(\'landing.programs.title\')}<');
content = content.replace('Six interlocking programs that take you from foundation to licensure to a flourishing career.', '{t(\'landing.programs.desc\')}');

// Programs array loop
content = content.replace('{programs.map((p, i) => (', '{[\n              { icon: GraduationCap, ...t(\'landing.programs.c1\', { returnObjects: true }) as any },\n              { icon: Stethoscope, ...t(\'landing.programs.c2\', { returnObjects: true }) as any },\n              { icon: ClipboardCheck, ...t(\'landing.programs.c3\', { returnObjects: true }) as any },\n              { icon: MessageSquare, ...t(\'landing.programs.c4\', { returnObjects: true }) as any },\n              { icon: FlaskConical, ...t(\'landing.programs.c5\', { returnObjects: true }) as any },\n              { icon: Compass, ...t(\'landing.programs.c6\', { returnObjects: true }) as any }\n            ].map((p, i) => (');

// COURSES
content = content.replace('>Live Courses<', '>{t(\'landing.courses.badge\')}<');
content = content.replace('>Courses<', '>{t(\'landing.courses.title\')}<');
content = content.replace('View all →', '{t(\'landing.courses.viewAll\')}');
content = content.replace('Load more', '{t(\'landing.courses.loadMore\')}');
content = content.replace('View Course <ArrowRight', '{t(\'landing.courses.viewCourse\')} <ArrowRight');
content = content.replace('lessons</span>', '{t(\'landing.courses.lessons\')}</span>');

// STATS
content = content.replace('Years of Experience', '{t(\'landing.stats.s1\')}');
content = content.replace('Certified Pharmacists', '{t(\'landing.stats.s2\')}');
content = content.replace('Exam Pass Rate', '{t(\'landing.stats.s3\')}');
content = content.replace('Academic Support', '{t(\'landing.stats.s4\')}');

// WHY CHOOSE
content = content.replace('>Confidence<', '>{t(\'landing.trust.badge\')}<');
content = content.replace('Why do elite pharmacists <span className="text-gradient">trust us?</span>', '{t(\'landing.trust.title1\')}<span className="text-gradient">{t(\'landing.trust.title2\')}</span>');

// whyCards array loop
content = content.replace('{whyCards.map((w, i) => (', '{[\n              { icon: Users, ...t(\'landing.trust.c1\', { returnObjects: true }) as any },\n              { icon: Sparkles, ...t(\'landing.trust.c2\', { returnObjects: true }) as any },\n              { icon: Globe2, ...t(\'landing.trust.c3\', { returnObjects: true }) as any },\n              { icon: ShieldCheck, ...t(\'landing.trust.c4\', { returnObjects: true }) as any },\n              { icon: Headphones, ...t(\'landing.trust.c5\', { returnObjects: true }) as any },\n              { icon: Briefcase, ...t(\'landing.trust.c6\', { returnObjects: true }) as any }\n            ].map((w, i) => (');

// PROCESS
content = content.replace('>The Journey<', '>{t(\'landing.process.badge\')}<');
content = content.replace('Your steps toward <span className="text-gradient">professional certification.</span>', '{t(\'landing.process.title1\')}<span className="text-gradient">{t(\'landing.process.title2\')}</span>');
content = content.replace('Step {s.n}', '{t(\'landing.process.step\')} {s.n}');

// steps array loop
content = content.replace('{steps.map((s, i) => (', '{[\n                { n: "01", ...t(\'landing.process.s1\', { returnObjects: true }) as any },\n                { n: "02", ...t(\'landing.process.s2\', { returnObjects: true }) as any },\n                { n: "03", ...t(\'landing.process.s3\', { returnObjects: true }) as any },\n                { n: "04", ...t(\'landing.process.s4\', { returnObjects: true }) as any },\n                { n: "05", ...t(\'landing.process.s5\', { returnObjects: true }) as any }\n              ].map((s, i) => (');


// TESTIMONIALS
content = content.replace('>Voices<', '>{t(\'landing.testimonials.badge\')}<');
content = content.replace('>Trusted by pharmacists worldwide.<', '>{t(\'landing.testimonials.title\')}<');

// testimonials array loop
content = content.replace('{testimonials.map((t, i) => (', '{[\n              t(\'landing.testimonials.t1\', { returnObjects: true }) as any,\n              t(\'landing.testimonials.t2\', { returnObjects: true }) as any,\n              t(\'landing.testimonials.t3\', { returnObjects: true }) as any\n            ].map((t_item, i) => (');
// Fix testimonials t_item replace correctly
content = content.replace('.map((t_item, i) => (\n              <motion.figure', '.map((t_item, i) => (\n              <motion.figure');
content = content.split('"{t.q}"').join('"{t_item.q}"');
content = content.split('{t.a}').join('{t_item.a}');
content = content.split('{t.r}').join('{t_item.r}');

// CTA
content = content.replace('Build your pharmacy career <span className="text-gradient">with confidence.</span>', '{t(\'landing.cta.title1\')}<span className="text-gradient">{t(\'landing.cta.title2\')}</span>');
content = content.replace('Begin your journey with Prometrica Academy to secure your professional license,\n              sharpen your clinical knowledge, and excel in healthcare.', '{t(\'landing.cta.desc\')}');
content = content.replace('Start Your Journey <ArrowRight', '{t(\'landing.cta.btn1\')} <ArrowRight');
content = content.replace('>Contact Advisor<', '>{t(\'landing.cta.btn2\')}<');

fs.writeFileSync('./src/routes/index.tsx', content);
console.log('index.tsx patched!');
