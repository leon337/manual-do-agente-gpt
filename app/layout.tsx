import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manual do Agente GPT — API de conhecimento",
  description: "Base pública, somente leitura, com procedimentos operacionais em JSON e Markdown para agentes de IA.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
