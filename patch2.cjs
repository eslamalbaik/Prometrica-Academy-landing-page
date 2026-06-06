const fs = require('fs');

let content = fs.readFileSync('./src/routes/index.tsx', 'utf8');

// I need to find `export const Route = createFileRoute("/")({` and replace it up to `const programs = [`
let lines = content.split('\n');
let newLines = [];
let i = 0;
while (i < lines.length) {
    if (lines[i].includes('export const Route = createFileRoute("/")({')) {
        newLines.push(`export const Route = createFileRoute("/")({
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
];`);
        // skip lines until `const programs = [`
        while (i < lines.length && !lines[i].includes('const programs = [')) {
            i++;
        }
        newLines.push(lines[i]); // push `const programs = [`
    } else {
        newLines.push(lines[i]);
    }
    i++;
}

fs.writeFileSync('./src/routes/index.tsx', newLines.join('\n'));
console.log('Fixed index.tsx headers!');
