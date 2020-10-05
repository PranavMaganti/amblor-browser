import {browser} from 'webextension-polyfill-ts';
import {ConnectorInfo, connectors} from './connectors/BaseConnector';

browser.tabs.onUpdated.addListener(async (id, info, tab) => {
  if (info.status !== 'complete') {
    return;
  }

  const connectorInfo: ConnectorInfo = await getConnectorFromUrl(tab.url);
  const attached = await isConnectorInjected(id);

  if (connectorInfo && !attached) {
    console.log('Injecting!');
    browser.tabs.executeScript(id, {
      file: connectorInfo.file,
    });
  }
});

async function getConnectorFromUrl(url: string)
  : Promise<ConnectorInfo | undefined> {
  for (const connector of connectors) {
    if (url.match(connector.pattern)) {
      return connector;
    }
  }

  return null;
}

async function isConnectorInjected(tabId: number): Promise<boolean> {
  try {
    await browser.tabs.sendMessage(tabId, 'INJECTION_CHECK');
    return true;
  } catch (e) {
    return false;
  }
}
