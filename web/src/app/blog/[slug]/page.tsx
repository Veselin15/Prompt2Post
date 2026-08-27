import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import MarketingShell, { MarketingCta } from "@/components/landing/MarketingShell";
import { ARTICLES, getArticle, type ArticleSection } from "@/lib/marketing/articles";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `/blog/${article.slug}`,
      type: "article",
      publishedTime: article.datePublished,
    },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Section({ section }: { section: ArticleSection }) {
  const ListTag = section.ordered ? "ol" : "ul";
  return (
    <section className="mb-8">
      {section.heading && (
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white/90">{section.heading}</h2>
      )}
      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 40)} className="text-white/65 leading-relaxed mb-3">
          {p}
        </p>
      ))}
      {section.list && (
        <ListTag
          className={`space-y-2 text-white/65 leading-relaxed pl-5 ${
            section.ordered ? "list-decimal" : "list-disc"
          } marker:text-brand-400`}
        >
          {section.list.map((item) => (
            <li key={item.slice(0, 40)}>{item}</li>
          ))}
        </ListTag>
      )}
    </section>
  );
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const structuredData = [
    articleJsonLd({
      title: article.title,
      description: article.description,
      path: `/blog/${article.slug}`,
      datePublished: article.datePublished,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
  ];

  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article className="max-w-3xl mx-auto px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-white/45 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All guides
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-3 text-xs text-white/40 mb-4">
            <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readMinutes} min read
            </span>
          </div>
          <h1 className="text-section font-display mb-4">
            {article.title}
          </h1>
          {article.intro.map((p) => (
            <p key={p.slice(0, 40)} className="text-white/60 text-lg leading-relaxed">
              {p}
            </p>
          ))}
        </header>

        {article.sections.map((section, i) => (
          <Section key={section.heading ?? i} section={section} />
        ))}

        <aside className="panel-strong rounded-2xl p-6 mt-10">
          <h2 className="font-bold mb-2 text-brand-300">The takeaway</h2>
          <p className="text-white/70 leading-relaxed">{article.takeaway}</p>
        </aside>
      </article>

      <MarketingCta />

      {related.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
            Keep reading
          </h2>
          <div className="space-y-3">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="panel hover-lift rounded-2xl p-5 flex items-center justify-between gap-4 group"
              >
                <span className="font-semibold text-white/85 group-hover:text-brand-300 transition-colors">
                  {a.title}
                </span>
                <ArrowRight className="w-4 h-4 text-white/35 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </MarketingShell>
  );
}
