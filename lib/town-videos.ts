/**
 * Per-town videos — STARTS EMPTY. Town pages render NO video slot until
 * a town has a real video here (beat-sir plan §2.4: no per-town videos,
 * no stock footage as real jobs, no staged "technician" videos). A video
 * lands here only when real footage exists for that town — e.g. a clip
 * filmed at a real partner job in that town. The value is the YouTube
 * video ID of our own upload.
 */

export const TOWN_VIDEOS: Record<string, string> = {};
