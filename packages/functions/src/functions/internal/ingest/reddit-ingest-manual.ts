import { RedditService } from "@lib/services/reddit-service";

export const handler = async () => {
  console.log("Hello world");
  const redditService = new RedditService();
  await redditService.listPosts("MechanicalKeyboards", {
    q: 'flair:"Group Buy"',
    limit: "5",
    sort: "new",
    restrict_sr: true,
  });
};
