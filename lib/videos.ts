/**
 * Guide/tool page videos — our own screen-recorded tool demos only
 * (beat-sir plan §2.4). Keys are page paths. STARTS EMPTY: no videoId
 * is invented here. A video appears on a page only when a real demo has
 * been recorded, uploaded to our own YouTube channel, and its ID added
 * here with its title and description. Third-party / competitor videos
 * are never added (written permission + lawyer sign-off required first).
 *
 * Planned first three (§2.4): MeterTest demo (Katy pre-filled),
 * Water Bill Spike Splitter demo, Freeze-Burst Risk Tonight demo.
 */

export interface GuideVideo {
  videoId: string;
  title: string;
  description: string;
  /** ISO upload date (YYYY-MM-DD) — include when the video is added. */
  uploadDate?: string;
}

export const GUIDE_VIDEOS: Record<string, GuideVideo> = {};
