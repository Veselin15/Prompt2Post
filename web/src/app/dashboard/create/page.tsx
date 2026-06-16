import dynamic from "next/dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureDbUser } from "@/lib/ensure-user";
import { PLAN_LIMITS } from "@/types";
import type { Plan } from "@/types";
import type { FormPrefill } from "@/components/generator/GeneratorForm";

const CreatePageClient = dynamic(() => import("./CreatePageClient"), {
  loading: () => (
    <div className="p-6 flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-2 border-brand-500/40 border-t-brand-400 rounded-full animate-spin" />
    </div>
  ),
});

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Server component — reads the authoritative plan from PostgreSQL and passes
 * it straight to the client component. This avoids the Clerk publicMetadata
 * sync lag that would otherwise show the wrong plan in the UI.
 *
 * The form's starting state layers the user's saved Brand Kit underneath any
 * URL params (e.g. an Idea Studio "Create this post" link) — URL wins.
 */
export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureDbUser(userId);
  if (!dbUser) redirect("/sign-in");

  const planKey = (
    ["free", "pro", "creator"].includes(dbUser.plan) ? dbUser.plan : "free"
  ) as Plan;

  const params = await searchParams;
  const kit = dbUser.brand_kit ?? {};
  const slidesParam = Number(first(params.slides));

  const prefill: FormPrefill = {
    // Brand Kit layer
    tone: kit.tone || undefined,
    style: kit.style || undefined,
    format: kit.format || undefined,
    template: kit.template || undefined,
    accent: kit.accent || undefined,
    handle: kit.handle || undefined,
    textAmount: kit.textAmount || undefined,
    fontTheme: kit.fontTheme || undefined,
    headlineCase: kit.headlineCase || undefined,
    textAlign: kit.textAlign || undefined,
    language: kit.language || undefined,
    // URL layer (Idea Studio links, "Use as template") — wins over the kit
    topic: first(params.topic),
    ...(first(params.tone) ? { tone: first(params.tone) } : {}),
    ...(first(params.style) ? { style: first(params.style) } : {}),
    ...(first(params.format) ? { format: first(params.format) } : {}),
    ...(first(params.template) ? { template: first(params.template) } : {}),
    ...(first(params.accent) ? { accent: first(params.accent) } : {}),
    ...(first(params.handle) ? { handle: first(params.handle) } : {}),
    ...(first(params.textAmount) ? { textAmount: first(params.textAmount) } : {}),
    ...(first(params.fontTheme) ? { fontTheme: first(params.fontTheme) } : {}),
    ...(first(params.headlineCase) ? { headlineCase: first(params.headlineCase) } : {}),
    ...(first(params.textAlign) ? { textAlign: first(params.textAlign) } : {}),
    ...(Number.isFinite(slidesParam) && slidesParam > 0 ? { numSlides: slidesParam } : {}),
  };

  return (
    <CreatePageClient
      planKey={planKey}
      limits={PLAN_LIMITS[planKey]}
      postsThisMonth={dbUser.posts_this_month}
      prefill={prefill}
    />
  );
}
