import type { Subreddit } from "snoowrap";

export interface SearchSubredditParameters extends Record<string, string | number | boolean> {
  after?: string;
  before?: string;
  q: string;
  count?: string;
  limit: string;
  restrict_sr: boolean;
  show?: "all";
  sort: "hot" | "top" | "new" | "comments";
  sr_detail?: boolean;
  time?: "hour" | "day" | "week" | "month";
  type?: string;
}

export interface RedditSearchSubmissionResponse {
  kind: "Listing";
  data: {
    modhash: string;
    dist: number;
    after: string;
    children: { kind: string; data: RedditSubmission }[];
  };
}

type RedditSubmission = Awaited<ReturnType<typeof Subreddit.prototype.search>>[number];
