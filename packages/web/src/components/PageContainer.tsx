import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/** Full-width page shell with responsive horizontal padding. */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`w-full px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 ${className}`}>
      {children}
    </div>
  );
}
