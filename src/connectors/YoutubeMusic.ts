import {Connector, PlayerState} from './BaseConnector';
import {timeToSeconds} from './Util';

class YoutubeMusic extends Connector {
    nameSelector: string = 'ytmusic-player-bar title'
    artistAlbumSelector: string = 'ytmusic-player-bar byline'
    playerSelector: string = 'ytmusic-player-bar';
    timeSelector: string = 'ytmusic-player-bar time-info'

    constructor() {
      super();
      super.setupObserver();
    }

    getCurrentState(): PlayerState {
      const nameNode = document.getElementsByClassName(this.nameSelector)[0];
      const artistAlbumNode =
            document.getElementsByClassName(this.artistAlbumSelector)[0];
      const timeNode = document.getElementsByClassName(this.timeSelector)[0];

      const splitTime = timeNode.textContent.split('/');
      const songInfo = artistAlbumNode.getElementsByTagName('a');

      let artist = '';
      let album = '';

      if (songInfo.length == 1) {
        artist = songInfo[0].textContent;
      } else {
        for (let i = 0; i < songInfo.length - 1; i++) {
          if (i != 0) artist += ',';
          artist += songInfo[i].textContent;
        }

        album += songInfo[songInfo.length - 1].textContent;
      }

      return {
        name: nameNode.textContent,
        artist: artist,
        album: album,
        currentDuration: timeToSeconds(splitTime[0].trim()),
        totalDuration: timeToSeconds(splitTime[1].trim()),
      };
    }
}


new YoutubeMusic();
