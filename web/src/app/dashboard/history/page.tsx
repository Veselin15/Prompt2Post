import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPostsByUser } from "@/lib/db";
import { Download, Calendar, Layers, PlusCircle } from "lucide-react";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const posts = await getPostsByUser(userId, 50);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <Layers className="w-7 h-7 text-white/20" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-white/80">No posts yet</p>
          <p className="text-white/40 text-sm mt-1">Create your first AI post to see it here.</p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create a post
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">History</h1>
          <p className="text-white/50 text-sm mt-1">{posts.length} posts generated</p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New post
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => {
          const thumb = post.slides[0]?.image_url;
          return (
            <div key={post.id} className="glass rounded-2xl overflow-hidden hover:bg-white/8 transition-colors group">
              <div className="aspect-square bg-white/5 relative overflow-hidden">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={post.topic}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-white/10" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  {post.num_slides} slides
                </div>
              </div>
              <div className="p-4">
                <p className="font-medium text-sm truncate">{post.topic}</p>
                <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
                  <span className="flex items-center gap-1 capitalize">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                    {post.tone ?? "auto"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                {post.zip_url && (
                  <a
                    href={post.zip_url}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 mt-3 text-xs text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download ZIP
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
