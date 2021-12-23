import axios from "axios";
import { epochSeconds } from "./common";

export interface Track {
  name: string;
  artist: string;
  album?: string;
}

export async function scrobble(track: Track) {
  axios({
    method: "post",
    url: "https://amblor.herokuapp.com/api/v1/scrobble",
    data: {
      track_name: track.name,
      artist_name: track.artist,
      time: epochSeconds(),
    },
  });
}
