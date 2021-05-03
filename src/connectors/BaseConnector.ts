import { Browser, browser, Runtime } from "webextension-polyfill-ts";
import { MessagingLabels } from "../constants/MessagingLabels";
import { Track } from "../util/scrobble";

export abstract class BaseConnector {
  abstract getTrackName(): string;
  abstract getArtistName(): string;
  abstract getAlbumName(): string;
  abstract getDurationData(): [number, number];
  abstract getIsPlaying(): boolean;

  playerSelector: string;
  playerState: PlayerState = {} as PlayerState;
  playerObserver: MutationObserver = new MutationObserver(() => {
    let newState: PlayerState | undefined = undefined;
    try {
      newState = this.getCurrentState();
    } catch (e) {
      return;
    }

    const tracksSame = this.areTracksTheSame(this.playerState, newState);
    const playbackChange = this.playerState.isPlaying != newState?.isPlaying;
    const newScrobble = !tracksSame || newState.currentDuration == 0;

    if (newScrobble) {
      /* TODO: Need to check when the user skips forward or backward in the track
        Maybe do this by tracking play pauses so that the absolute amount of
        time the user listens to a track can be recorded. */
      console.log("Track:", this.playerState);
      newState.currentDuration = 0;

      if (
        this.playerState.currentDuration >
        this.playerState.totalDuration * 0.9
      ) {
        const scrobble: Track = {
          name: this.playerState.name,
          artist: this.playerState.artist,
          album: this.playerState.album,
        };
        console.log("Scrobbling:", scrobble);
        browser.runtime.sendMessage(scrobble);
      }
    } else if (playbackChange) {
      console.log("Amblor: playback state changed to " + newState.isPlaying);
    }

    this.playerState = newState ?? this.playerState;
  });

  constructor(playerSelector: string) {
    this.playerSelector = playerSelector;
    this.setupMessageListener();
    this.setupPlayerObserver();
  }

  setupPlayerObserver(): void {
    console.log("Amblor: Setting up player observer");
    const target = document.querySelector(this.playerSelector);
    const observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    };
    this.playerObserver.observe(target!!, observerConfig);
  }

  getCurrentState(): PlayerState {
    const durationData = this.getDurationData();
    return {
      name: this.getTrackName(),
      artist: this.getArtistName(),
      album: this.getAlbumName(),
      currentDuration: durationData[0],
      totalDuration: durationData[1],
      isPlaying: this.getIsPlaying(),
    };
  }

  areTracksTheSame(oldState: PlayerState, newState: PlayerState): boolean {
    return (
      !oldState ||
      (oldState.name == newState.name &&
        oldState.artist == newState.artist &&
        oldState.album == newState.album)
    );
  }

  setupMessageListener(): void {
    browser.runtime.onMessage.addListener(
      async (data, _) => data == MessagingLabels.injection_check
    );
  }
}

export interface PlayerState {
  name: string;
  artist: string;
  album?: string;

  // Duration is seconds
  totalDuration: number;
  currentDuration: number;

  isPlaying: boolean;
}
