import { ReactNode } from "react";
import { DocSidebar } from "@/components/docs/DocSidebar";
import { PageContainer } from "@/components/PageContainer";

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full py-6 sm:py-8">
      <PageContainer>
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <DocSidebar />
          <div className="min-h-[60vh]">{children}</div>
        </div>
      </PageContainer>
    </main>
  );
}
