import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {marked} from "marked";
import Header from "@/components/Header";
import {pool} from "@/lib/db";
export const dynamic="force-dynamic";
async function find(slug:string){const r=await pool.query("SELECT m.*,c.name AS category_name FROM manuals m LEFT JOIN categories c ON c.id=m.category_id WHERE m.slug=$1 AND m.status='published' LIMIT 1",[slug]);return r.rows[0]||null}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const p=await params;const m=await find(p.slug);return m?{title:m.title,description:m.summary}:{title:"Manual não encontrado"}}
export default async function ManualPage({params}:{params:Promise<{slug:string}>}){const p=await params;let m:any=null;try{m=await find(p.slug)}catch{return <><Header/><main className="manual"><h1>Manual indisponível</h1><p>Não foi possível consultar o banco agora.</p><a href="/">Voltar ao índice</a></main></>}if(!m)notFound();const html=await marked.parse(m.content_md||"");return <><Header/><main className="manual"><p className="muted"><a href="/">Início</a> / Manuais / {m.code}</p><span className="code">{m.code} · v{m.version}</span><h1>{m.title}</h1><p className="muted">{m.summary}</p><div className="tags">{(m.tags||[]).map((t:string)=><span className="tag" key={t}>{t}</span>)}</div><article className="prose" dangerouslySetInnerHTML={{__html:html}}/><p className="muted">Atualizado em {new Date(m.updated_at).toLocaleDateString("pt-BR")} · <a href={"/api/manuals/"+encodeURIComponent(m.slug)}>Ver JSON deste manual</a></p></main></>}
