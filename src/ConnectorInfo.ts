/**
 * Stores information on a connector
 */
export interface ConnectorInfo {
  file: string;
  pattern: string;
}

/**
 * List of url pattern and file path for all connectors
 */
export const connectors: ConnectorInfo[] = [
  {
    file: "connectors/YoutubeMusic.js",
    pattern: ".*://music.youtube.com/.*",
  },
];
