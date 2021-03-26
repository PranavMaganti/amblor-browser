import { BaseConnector } from "./BaseConnector";
import { timeToSeconds } from "./Util";

class YoutubeMusic extends BaseConnector {
  nameSelector: string = "ytmusic-player-bar title";
  bylineSelector: string = "ytmusic-player-bar byline";
  timeSelector: string = "ytmusic-player-bar time-info";

  albumHrefPattern: string = "/channel/MPREb_*";

  constructor() {
    super("ytmusic-player-bar");
  }

  getTrackName(): string {
    return document.getElementsByClassName(this.nameSelector)[0].textContent!!;
  }

  getArtistName(): string {
    const artistNode = document.getElementsByClassName(this.bylineSelector)[0];
    const artists = [...artistNode.getElementsByTagName("a")].filter(
      (value) => !RegExp(this.albumHrefPattern).test(value.href)
    );

    return artists.map((value) => value.textContent!!).join(",");
  }

  getAlbumName(): string {
    const albumNode = document.getElementsByClassName(this.bylineSelector)[0];
    const album = [...albumNode.getElementsByTagName("a")].filter((value) =>
      RegExp(this.albumHrefPattern).test(value.href)
    );

    /* Filter should leave just the album name */
    if (album.length != 1) return "";

    return album[0].textContent!!;
  }

  getDurationData(): [number, number] {
    const timeNode = document.getElementsByClassName(this.timeSelector)[0];
    const splitTime = timeNode.textContent?.split("/");

    return [
      timeToSeconds(splitTime!![0].trim()),
      timeToSeconds(splitTime!![1].trim()),
    ];
  }
}

new YoutubeMusic();
