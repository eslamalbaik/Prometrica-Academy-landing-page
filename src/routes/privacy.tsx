import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, useLegalContent } from "@/components/legal/LegalLayout";
import { pageTitle } from "@/lib/siteMeta";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: pageTitle("Privacy Policy") }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { pick } = useLegalContent();

  return (
    <LegalLayout
      title={pick("سياسة الخصوصية", "Privacy Policy")}
      updatedLabel={pick("آخر تحديث: يونيو 2026", "Last updated: June 2026")}
      intro={pick(
        "تشرح هذه السياسة كيف تجمع منصة بروميتريكا أكاديمي بياناتك وتستخدمها وتحميها عند استخدامك لخدماتنا.",
        "This policy explains how Prometrica Academy collects, uses, and protects your data when you use our services.",
      )}
      sections={[
        {
          heading: pick("البيانات التي نجمعها", "Information We Collect"),
          body: [
            pick(
              "نجمع المعلومات التي تقدّمها عند إنشاء حساب مثل الاسم والبريد الإلكتروني ورقم الهاتف، بالإضافة إلى بيانات الاستخدام مثل الدورات التي تشاهدها وتقدّمك فيها.",
              "We collect the information you provide when creating an account such as name, email and phone, along with usage data like the courses you watch and your progress.",
            ),
          ],
        },
        {
          heading: pick("كيف نستخدم بياناتك", "How We Use Your Data"),
          body: [
            pick(
              "نستخدم بياناتك لتقديم الخدمة التعليمية، وتتبّع تقدّمك، وإصدار الشهادات، وتحسين المنصة، والتواصل معك بخصوص حسابك.",
              "We use your data to deliver the learning service, track your progress, issue certificates, improve the platform, and communicate with you about your account.",
            ),
          ],
        },
        {
          heading: pick("حماية البيانات", "Data Protection"),
          body: [
            pick(
              "نطبّق إجراءات أمنية تقنية وتنظيمية لحماية بياناتك، بما في ذلك تشفير كلمات المرور وتأمين الوصول. لا نبيع بياناتك لأي طرف ثالث.",
              "We apply technical and organizational security measures to protect your data, including password hashing and access control. We never sell your data to third parties.",
            ),
          ],
        },
        {
          heading: pick("ملفات تعريف الارتباط", "Cookies"),
          body: [
            pick(
              "نستخدم ملفات تعريف الارتباط الضرورية لتشغيل المنصة وتذكّر تفضيلاتك مثل اللغة وحالة تسجيل الدخول.",
              "We use essential cookies to operate the platform and remember your preferences such as language and login state.",
            ),
          ],
        },
        {
          heading: pick("حقوقك", "Your Rights"),
          body: [
            pick(
              "يمكنك الوصول إلى بياناتك وتعديلها أو طلب حذف حسابك في أي وقت عبر التواصل مع فريق الدعم.",
              "You may access, update, or request deletion of your account at any time by contacting our support team.",
            ),
          ],
        },
        {
          heading: pick("التواصل", "Contact"),
          body: [
            pick(
              "لأي استفسار بخصوص الخصوصية، تواصل معنا على: support@prometrica.com",
              "For any privacy inquiry, contact us at: support@prometrica.com",
            ),
          ],
        },
      ]}
    />
  );
}
