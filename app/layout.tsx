import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:{default:"Manual do Agente GPT",template:"%s | Manual do Agente GPT"},description:"Manuais públicos, procedimentos verificáveis e instruções reutilizáveis para agentes de IA e pessoas.",robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}