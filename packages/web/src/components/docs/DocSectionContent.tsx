import { DocArticle, DocBlockRenderer } from "@/components/docs/DocBlocks";
import { DocGuideCta } from "@/components/docs/DocGuideCta";
import { DOC_PAGES, type DocSectionSlug } from "@/lib/how-it-works-content";

interface DocSectionContentProps {
  section: DocSectionSlug;
}

export function DocSectionContent({ section }: DocSectionContentProps) {
  const page = DOC_PAGES[section];

  return (
    <>
      <DocArticle title={page.label} intro={page.intro}>
        <DocBlockRenderer blocks={page.blocks} />
      </DocArticle>

      {section === "faq" && <DocGuideCta />}
    </>
  );
}
