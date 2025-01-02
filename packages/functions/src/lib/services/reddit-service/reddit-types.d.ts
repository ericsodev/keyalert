import type { Comment, Subreddit } from "snoowrap";

interface LimitParameters {
  sort: "hot" | "top" | "new" | "comments";
  limit: number;
}

export interface SearchSubredditParameters extends LimitParameters {
  after?: string;
  before?: string;
  q: string;
  count?: string;
  restrict_sr: boolean;
  show?: "all";
  sr_detail?: boolean;
  time?: "hour" | "day" | "week" | "month";
  type?: string;
}

export interface RedditSearchSubmissionResponse {
  kind: "Listing";
  data: {
    modhash: string;
    dist: number;
    after: string | null;
    children: { kind: string; data: RedditSubmissionListing }[];
  };
}

type RedditSubmissionListing = Awaited<ReturnType<typeof Subreddit.prototype.search>>[number];

export interface GetCommentsParameters extends LimitParameters {
  comment?: string;
  context?: number;
  depth?: number;
  sr_detail?: boolean;
  showedits?: boolean;
  showmedia?: boolean;
  showmore?: boolean;
  showtitle?: boolean;
}

export type RedditCommentsResponse = [
  RedditSearchSubmissionResponse,
  {
    kind: "Listing";
    data: {
      modhash: string;
      dist: number;
      after: string | null;
      children: { kind: "t1"; data: Comment }[];
    };
  },
];
