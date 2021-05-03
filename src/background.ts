import { browser } from "webextension-polyfill-ts";
import { ConnectorInfo, connectors } from "./connectors/ConnectorInfo";
import { MessagingLabels } from "./constants/MessagingLabels";
import { scrobble, Track } from "./util/amblor";

browser.tabs.onUpdated.addListener(async (id, info, tab) => {
  // Do nothing if page is not loaded or connector already injected in tab
  if (info.status !== MessagingLabels.page_loading_complete) return;
  if (await isConnectorInjected(id)) return;

  // Assert url not null as permissions have been requested in manifest
  const connectorInfo = getConnectorFromUrl(tab.url!!);
  if (connectorInfo) {
    console.log("Injecting!"); // For debugging
    browser.tabs.executeScript(id, { file: connectorInfo.file });
  }
});

browser.runtime.onMessage.addListener((track: Track) => {
  console.log(track)
  scrobble(track);
});

/**
 * Matches a given url to its associated connector
 *
 * @param url the url of the tab
 * @returns an object containing the connector file if url matches and undefined
 * otherwise
 */
function getConnectorFromUrl(url: string): ConnectorInfo | undefined {
  for (const connector of connectors) {
    if (url.match(connector.pattern)) {
      return connector;
    }
  }
  return undefined;
}

/**
 * Checks if a given tab already has a connector injected
 *
 * @param tabId int id of the tab to send injection check message to
 * @returns a promise of true if tab has already been injected and false otherwise
 */
async function isConnectorInjected(tabId: number): Promise<boolean> {
  try {
    return await browser.tabs.sendMessage(
      tabId,
      MessagingLabels.injection_check
    );
  } catch (e) {
    return false;
  }
}
