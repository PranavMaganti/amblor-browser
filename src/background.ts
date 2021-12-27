import browser from "webextension-polyfill";
import { PlayerState } from "./connectors/BaseConnector";
import { ConnectorInfo, connectors } from "./connectors/ConnectorInfo";
import { MessagingLabels } from "./constants/MessagingLabels";
import { identifyTrack } from "./util/amblor";
import { createSupabaseClient, getAccessToken } from "./util/supabase";

browser.tabs.onUpdated.addListener(async (id, info, tab) => {
  // Do nothing if page is not loaded or connector already injected in tab
  if (info.status !== MessagingLabels.page_loading_complete) return;
  if (await isConnectorInjected(id)) return;

  // Assert url not null as permissions have been requested in manifest
  const connectorInfo = getConnectorFromUrl(tab.url!!);
  if (connectorInfo) {
    console.log("Injecting!"); // For debugging
    browser.scripting.executeScript({
      target: { tabId: id },
      files: [connectorInfo.file],
    });
  }
});

browser.storage.onChanged.addListener(async (changes) => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    console.log("Background Storage Listener: No access token");
    return; // User not signed in
  }

  if ("playerState" in changes) {
    console.log("Background Storage Listener: Player state changed");
    const playerState = changes.playerState.newValue as PlayerState;
    const matchedTrack = await identifyTrack(playerState, accessToken);

    if (matchedTrack) {
      browser.storage.local.set({
        matchedTrack: matchedTrack,
      });
    }
  }
});

browser.runtime.onMessage.addListener(async (message, sender) => {
  const accessToken = await getAccessToken();
  const supabase = createSupabaseClient(accessToken);
  console.log(message);
  if (message.type === MessagingLabels.scrobble) {
    const { data, error } = await supabase.rpc("scrobble", {
      _track: message.track,
    });
  }
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
