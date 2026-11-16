import { GUIDE_VIDEOS } from "@/lib/videos";
import { videoObjectSchema } from "@/lib/schema";
import VideoFacade from "@/components/VideoFacade";

/**
 * Conditional video block for a guide/tool page. Renders NOTHING unless
 * GUIDE_VIDEOS has an entry for this page key — no videoId is ever
 * invented, and no third-party video is ever embedded. When an entry
 * exists, renders the click-to-load facade plus its VideoObject schema.
 */
export default function GuideVideo({ pageKey }: { pageKey: string }) {
  const video = GUIDE_VIDEOS[pageKey];
  if (!video) return null;
  return (
    <section className="mx-auto max-w-4xl px-4 pt-10" aria-label="Video">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoObjectSchema(video)).replace(/</g, "\\u003c"),
        }}
      />
      <VideoFacade videoId={video.videoId} title={video.title} />
      <p className="mt-3 text-sm text-slate-500">
        Our own screen recording — {video.description}
      </p>
    </section>
  );
}
