import { notFound } from "next/navigation";
import { DocSectionContent } from "@/components/docs/DocSectionContent";
import { LaunchMenu } from "@/components/LaunchMenu";
import { DOC_SECTIONS, isDocSectionSlug } from "@/lib/how-it-works-content";

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

export function generateStaticParams() {
  return DOC_SECTIONS.map((section) => ({ section: section.slug }));
}

export default async function HowItWorksSectionPage({ params }: SectionPageProps) {
  const { section } = await params;

  if (!isDocSectionSlug(section)) {
    notFound();
  }

  return (
    <>
      <DocSectionContent section={section} />

      {section === "faq" && (
        <section className="doc-prose mt-12 max-w-3xl border-t border-green/15 pt-8">
          <h2 className="text-lg font-semibold text-ink">Ready to try it?</h2>
          <p className="mt-2 text-[15px] leading-7 text-muted">
            Connect your wallet on Sepolia and submit your first encrypted salary in under a minute.
          </p>
          <div className="mt-5">
            <LaunchMenu variant="primary" label="Get started" />
          </div>
        </section>
      )}
    </>
  );
}
