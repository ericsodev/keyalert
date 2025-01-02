import { RedditService } from "@lib/services/reddit-service";

export const handler = async () => {
  console.log("Hello world");
  const redditService = new RedditService();

  let count = 0;
  const postList = [];

  let posts = await redditService.searchSubmissions("MechanicalKeyboards", {
    q: 'flair:"Group Buy"',
    limit: 5,
    sort: "new",
    restrict_sr: true,
  });

  postList.push(...posts.data.children);

  let after = posts.data.after;

  while (after && count < 5) {
    posts = await redditService.searchSubmissions("MechanicalKeyboards", {
      q: 'flair:"Group Buy"',
      limit: 15,
      sort: "new",
      restrict_sr: true,
      after,
    });

    postList.push(...posts.data.children);
    after = posts.data.after;
    count++;
  }

  console.log(postList.map((post) => post.data.title));
};
