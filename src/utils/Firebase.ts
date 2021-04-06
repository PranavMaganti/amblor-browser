import { secrets } from "./Secrets";

interface TokenData {
  expires_in: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
  project_id: string;
}

export async function getIdToken(refreshToken: string): Promise<TokenData> {
  const data = { grant_type: "refresh_token", refresh_token: refreshToken };
  //TODO: remove refresh token from storage and show an error somewhere
  const res = await fetch(
    "https://securetoken.googleapis.com/v1/token?key=" +
      secrets.firebase_api_key,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=refresh_token&refresh_token=" + refreshToken,
    }
  );

  if (res.status != 200) {
    console.log(res);
  }

  return res.json();
}
