import { PlayerState } from "../connectors/BaseConnector";

export type Album = {
  id: string;
  name: string;
  cover_url: string;
};

export type Artist = {
  id: string;
  name: string;
  image_url?: string;
  genres: string[];
};

export type Track = {
  id: string;
  name: string;
  album: Album;
  artists: Artist[];
  preview_url: string | null;
};

export async function identifyTrack(
  playerState: PlayerState,
  accessToken: string
): Promise<Track | null> {
  const searchParams = new URLSearchParams({
    name: playerState.name,
    artist: playerState.artist,
  });
  
  const res = await fetch(
    `https://amblor.vercel.app/api/song/identify?${searchParams}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (res.status !== 200) {
    return null;
  }

  return res.json();
}
