import { BaseConnector, PlayerState } from "./BaseConnector";
import { timeToSeconds } from "./Util";

class YoutubeMusic extends BaseConnector {
  nameSelector: string = "ytmusic-player-bar title";
  artistAlbumSelector: string = "ytmusic-player-bar byline";
  playerSelector: string = "ytmusic-player-bar";
  timeSelector: string = "ytmusic-player-bar time-info";

  constructor() {
    super();
    super.setupObserver();
  }

  getCurrentState(): PlayerState {
    const nameNode = document.getElementsByClassName(this.nameSelector)[0];
    const artistAlbumNode = document.getElementsByClassName(
      this.artistAlbumSelector
    )[0];
    const timeNode = document.getElementsByClassName(this.timeSelector)[0];

    const splitTime = timeNode.textContent?.split("/");
    const songInfo = [...artistAlbumNode.getElementsByTagName("a")].map(
      (value) => value.textContent!!
    );

    let album = "";

    // TODO: Currently assumes that there will be at least 1 item
    let artist = songInfo.slice(0, Math.max(songInfo.length - 1, 1)).join(",")
    if (songInfo.length != 1) {
      album = songInfo[songInfo.length - 1];
    }

    return {
      name: nameNode.textContent!!,
      artist: artist,
      album: album,
      currentDuration: timeToSeconds(splitTime!![0].trim()),
      totalDuration: timeToSeconds(splitTime!![1].trim()),
    };
  }
}

new YoutubeMusic();
