import { ReactNode } from "react";
import { DocSidebar } from "@/components/docs/DocSidebar";
import { PageContainer } from "@/components/PageContainer";

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-full py-8 sm:py-10">
      <PageContainer>
        <div className="grid items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10 xl:gap-14">
          <DocSidebar />
          <div className="min-h-[60vh] pb-8">{children}</div>
        </div>
      </PageContainer>
    </main>
  );
}
