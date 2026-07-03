import { notFound } from "next/navigation";
import { DocSectionContent } from "@/components/docs/DocSectionContent";
import { isDocSectionSlug, DOC_SECTIONS } from "@/lib/how-it-works-content";

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

  return <DocSectionContent section={section} />;
}
