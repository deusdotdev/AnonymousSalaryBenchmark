import { ReactNode } from "react";
import { DocSidebar } from "@/components/docs/DocSidebar";
import { PageContainer } from "@/components/PageContainer";

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full py-6 sm:py-8">
      <PageContainer>
        <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <DocSidebar />
          <div className="min-h-[60vh]">{children}</div>
        </div>
      </PageContainer>
    </main>
  );
}
