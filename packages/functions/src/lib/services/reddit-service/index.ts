import { getSecret } from "@utils/aws/secret.js";
import { z } from "zod";
import axios from "axios";
import { RedditSearchSubmissionResponse, SearchSubredditParameters } from "./reddit-types";

const REDDIT_OAUTH_URL = "https://www.reddit.com/api/v1/access_token?grant_type=client_credentials";
const REDDIT_BASE_URL = "https://oauth.reddit.com";

const redditCredentialSchema = z.object({
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
});

export class RedditService {
  private token?: string;

  private async getToken(): Promise<string> {
    const credentialString = await getSecret("/reddit/api-credentials");
    const credentials = await redditCredentialSchema.parseAsync(JSON.parse(credentialString));

    const authHeader = btoa(`${credentials.CLIENT_ID}:${credentials.CLIENT_SECRET}`);

    const result = await fetch(REDDIT_OAUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    const data: Record<string, unknown> = await result.json();
    if (!data["access_token"]) {
      console.log(result);
      throw new Error(`Unable to retrieve access token ${result.statusText}`);
    }

    this.token = data.access_token as string;
    return data.access_token as string;
  }

  public async listPosts(
    subreddit: string,
    params: SearchSubredditParameters,
  ): Promise<RedditSearchSubmissionResponse> {
    const token = this.token ?? (await this.getToken());

    const queryParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === "string") {
        queryParams.append(key, val);
      } else if (typeof val === "boolean") {
        queryParams.append(key, new Boolean(val).toString());
      } else if (typeof val === "number") {
        queryParams.append(key, new Number(val).toString());
      }
    }

    const url = `${REDDIT_BASE_URL}/r/${subreddit}/search?${queryParams.toString()}`;

    const { data } = await axios.get<RedditSearchSubmissionResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Keyboard searcher",
      },
    });

    return data;
  }
}
