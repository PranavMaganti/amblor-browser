import { useCallback, useEffect, useState } from "react";
import { Browser, browser, Storage } from "webextension-polyfill-ts";
import { epochSeconds } from "./common";
import { Secrets } from "../constants/Secrets";

interface TokenData {
  expires_in: string;
  refresh_token: string;
  id_token: string;
}

const authStorageFields = ["id_token", "refresh_token", "expiry_time"];

export async function clearAuthStorage() {
  await browser.storage.local.remove(authStorageFields);
}

export async function storeTokenData(tokenData: TokenData) {
  const expiryTime =
    Math.floor(Date.now() / 1000) + Number.parseInt(tokenData.expires_in);

  /* Use provided refresh token as it may have been updated by API */
  await browser.storage.local.set({
    id_token: tokenData.id_token,
    refresh_token: tokenData.refresh_token,
    expiry_time: expiryTime,
  });
}

export function useIdTokenExists(): Boolean {
  const [idTokenExists, setIdTokenExists] = useState(false);

  const storageListener = useCallback((changes, areaName) => {
    if (areaName == "local") {
      const idToken = changes["id_token"];
      if (!idToken.oldValue && idToken.newValue) {
        setIdTokenExists(true);
      } else if (idToken.oldValue && !idToken.newValue) {
        setIdTokenExists(false);
      }
    }
  }, []);

  useEffect(() => {
    async function observeTokenId() {
      if (!!(await getIdTokenFromStorage())) {
        setIdTokenExists(true);
      }

      browser.storage.onChanged.addListener(storageListener);
    }

    observeTokenId();

    return () => browser.storage.onChanged.removeListener(storageListener);
  }, []);

  return idTokenExists;
}

/* Refreshes the token if it has expired */
export async function getIdTokenFromStorage(): Promise<string | undefined> {
  const rawData = await browser.storage.local.get(authStorageFields);

  if (!rawData["refresh_token"]) {
    return undefined;
  }

  if (rawData["expiry_time"] < epochSeconds()) {
    const newTokenData = await getTokenIdWithRefresh(rawData["refresh_token"]);
    storeTokenData(newTokenData);
    return newTokenData.id_token;
  }

  return rawData["id_token"];
}

export async function getTokenIdWithRefresh(
  refreshToken: string
): Promise<TokenData> {
  const data = { grant_type: "refresh_token", refresh_token: refreshToken };
  //TODO: remove refresh token from storage and show an error somewhere
  const res = await fetch(
    "https://securetoken.googleapis.com/v1/token?key=" +
      Secrets.firebase_api_key,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=refresh_token&refresh_token=" + refreshToken,
    }
  );

  if (res.status != 200) {
    console.log(res);
  }

  return res.json();
}
