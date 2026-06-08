import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, useLegalContent } from "@/components/legal/LegalLayout";
import { pageTitle } from "@/lib/siteMeta";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: pageTitle("Terms & Conditions") }] }),
  component: TermsPage,
});

function TermsPage() {
  const { pick } = useLegalContent();

  return (
    <LegalLayout
      title={pick("الشروط والأحكام", "Terms & Conditions")}
      updatedLabel={pick("آخر تحديث: يونيو 2026", "Last updated: June 2026")}
      intro={pick(
        "باستخدامك لمنصة بروميتريكا أكاديمي فإنك توافق على الشروط والأحكام التالية. يرجى قراءتها بعناية.",
        "By using Prometrica Academy you agree to the following terms and conditions. Please read them carefully.",
      )}
      sections={[
        {
          heading: pick("قبول الشروط", "Acceptance of Terms"),
          body: [
            pick(
              "إنشاؤك لحساب أو استخدامك للمنصة يعني موافقتك الكاملة على هذه الشروط وعلى سياسة الخصوصية الخاصة بنا.",
              "Creating an account or using the platform means you fully accept these terms and our Privacy Policy.",
            ),
          ],
        },
        {
          heading: pick("الحسابات والاشتراكات", "Accounts & Subscriptions"),
          body: [
            pick(
              "أنت مسؤول عن الحفاظ على سرية بيانات دخولك. تمنحك الاشتراكات وصولاً للمحتوى وفقاً للباقة المختارة ومدة صلاحيتها المعلنة.",
              "You are responsible for keeping your login credentials confidential. Subscriptions grant access to content according to the chosen plan and its stated validity period.",
            ),
          ],
        },
        {
          heading: pick("المحتوى والملكية الفكرية", "Content & Intellectual Property"),
          body: [
            pick(
              "جميع الدورات والمواد والملفات الرقمية محمية بحقوق الملكية الفكرية. لا يجوز إعادة بيعها أو توزيعها أو نسخها دون إذن خطّي.",
              "All courses, materials and digital files are protected by intellectual property rights. They may not be resold, distributed, or copied without written permission.",
            ),
          ],
        },
        {
          heading: pick("المدفوعات والاسترداد", "Payments & Refunds"),
          body: [
            pick(
              "تتم المدفوعات عبر بوابات دفع آمنة. تخضع طلبات الاسترداد لسياسة الاسترداد المعلنة وقت الشراء.",
              "Payments are processed through secure gateways. Refund requests are subject to the refund policy stated at the time of purchase.",
            ),
          ],
        },
        {
          heading: pick("الاستخدام المقبول", "Acceptable Use"),
          body: [
            pick(
              "يُمنع استخدام المنصة لأي غرض غير قانوني أو مشاركة الحساب أو محاولة تنزيل المحتوى المحمي بطرق غير مصرّح بها.",
              "You may not use the platform for any unlawful purpose, share your account, or attempt to download protected content by unauthorized means.",
            ),
          ],
        },
        {
          heading: pick("إنهاء الخدمة", "Termination"),
          body: [
            pick(
              "نحتفظ بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط دون إشعار مسبق.",
              "We reserve the right to suspend or terminate any account that violates these terms without prior notice.",
            ),
          ],
        },
        {
          heading: pick("التواصل", "Contact"),
          body: [
            pick(
              "لأي استفسار بخصوص الشروط، تواصل معنا على: support@prometrica.com",
              "For any inquiry regarding these terms, contact us at: support@prometrica.com",
            ),
          ],
        },
      ]}
    />
  );
}
