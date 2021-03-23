import { browser } from "webextension-polyfill-ts";
import { constants } from "../Constants";

export abstract class BaseConnector {
  abstract playerSelector: string;

  abstract getCurrentState(): PlayerState;

  playerState: PlayerState = {} as PlayerState;
  playerObserver: MutationObserver = new MutationObserver(() => {
    this.playerState = this.getCurrentState();
    console.log(this.playerState);
  });

  constructor() {
    this.setupMessageListener();
  }

  setupObserver() {
    const target = document.querySelector(this.playerSelector);
    const observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    };
    this.playerObserver.observe(target!!, observerConfig);
  }

  setupMessageListener(): void {
    browser.runtime.onMessage.addListener(
      async (data, _) => data == constants.injection_check
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
}
