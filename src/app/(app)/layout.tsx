import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { I18nProvider } from "@/lib/i18n/context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <I18nProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar />
        <main className="xl:ml-[280px] pt-24 pb-20 xl:pb-8 px-4 md:px-6 lg:px-10 min-h-screen">
          <div className="max-w-[1440px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </I18nProvider>
  );
}
