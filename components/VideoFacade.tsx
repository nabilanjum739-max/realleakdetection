"use client";

import { useState } from "react";

/**
 * Click-to-load YouTube facade (~3 KB: thumbnail + play button).
 * The YouTube iframe (~540 KB of player resources) loads ONLY when the
 * visitor clicks play — a default embed on 100 town pages would slow
 * every page (beat-sir plan §2.1). No video ID is ever invented: this
 * component renders only where a real videoId exists in lib/videos.ts
 * (guides/tools) or lib/town-videos.ts (town pages).
 */
export default function VideoFacade({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (loaded) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-sm">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-black text-left shadow-sm"
      aria-label={`Play video: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-75"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-blue-950 shadow-xl transition group-hover:scale-105 group-hover:bg-amber-400">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-sm font-bold text-white">
        {title}
      </span>
    </button>
  );
}
