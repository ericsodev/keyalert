import { RedditService } from "@lib/services/reddit-service";

export const handler = async () => {
  console.log("Hello world");
  const redditService = new RedditService();
  const posts = await redditService.searchSubmissions("MechanicalKeyboards", {
    q: 'flair:"Group Buy"',
    limit: 5,
    sort: "new",
    restrict_sr: true,
  });

  const post = posts.data.children[0]?.data;

  if (post) {
    console.log(post.title);

    const commentResponse = await redditService.getSubmissionComments(
      "MechanicalKeyboards",
      post.id,
      { limit: 5, sort: "top" },
    );

    console.log("Other title", commentResponse[0].data.children[0]?.data.title);

    for (const comment of commentResponse[1].data.children) {
      console.log(comment.data.body);
    }
  }
};
