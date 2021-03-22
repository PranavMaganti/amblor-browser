export abstract class Connector {
  abstract playerSelector: string;

  abstract getCurrentState(): PlayerState;

  playerState: PlayerState = {} as PlayerState;
  playerObserver!: MutationObserver;

  setupObserver() {
    const target = document.querySelector(this.playerSelector);
    this.playerObserver = new MutationObserver(() => {
      this.onPlayerStateChange();
    });
    const observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    };
    this.playerObserver.observe(target!!, observerConfig);
  }

  onPlayerStateChange(): void {
    this.playerState = this.getCurrentState();
    console.log(this.playerState);
  }
}

export interface PlayerState {
  name: string;
  artist: string;
  album?: string;

  // Duration is seconds
  totalDuration: number;
  currentDuration: number;
}

export interface ConnectorInfo {
  file: string;
  pattern: string;
}

export const connectors: ConnectorInfo[] = [
  {
    file: "connectors/YoutubeMusic.js",
    pattern: ".*://music.youtube.com/.*",
  },
];
