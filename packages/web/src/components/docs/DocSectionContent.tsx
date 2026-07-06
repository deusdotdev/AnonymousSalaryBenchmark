import { DocArticle, DocBlockRenderer } from "@/components/docs/DocBlocks";
import { DocGuideCta } from "@/components/docs/DocGuideCta";
import { DocPageNav } from "@/components/docs/DocPageNav";
import { DOC_PAGES, DOC_SECTIONS, type DocSectionSlug } from "@/lib/how-it-works-content";

interface DocSectionContentProps {
  section: DocSectionSlug;
}

export function DocSectionContent({ section }: DocSectionContentProps) {
  const page = DOC_PAGES[section];
  const sectionIndex = DOC_SECTIONS.findIndex((item) => item.slug === section);
  const showCta = section === "overview" || section === "faq";

  return (
    <div className="max-w-3xl">
      <DocArticle title={page.label} intro={page.intro} sectionIndex={sectionIndex}>
        <DocBlockRenderer blocks={page.blocks} />
      </DocArticle>

      <DocPageNav section={section} />

      {showCta && <DocGuideCta />}
    </div>
  );
}
