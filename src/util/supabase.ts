import { createClient } from "@supabase/supabase-js";
import browser from "webextension-polyfill";

const BrowserLocalStoarge = {
  async getItem(key: string): Promise<any> {
    return (await browser.storage.local.get(key))[key];
  },

  async setItem(key: string, value: any): Promise<void> {
    await browser.storage.local.set({ [key]: value });
  },

  async removeItem(key: string): Promise<void> {
    await browser.storage.local.remove(key);
  },
};

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODQzMzg0MywiZXhwIjoxOTQ0MDA5ODQzfQ.iNIHM2rexIuFA31iuCqR9GcbIkRACudL5VWGBJQrMKk";
const supabaseUrl = "https://rbtjlwyltzlpkrjzhqgs.supabase.co";
const browserStorageKey = "supabase.auth.token";

export const createSupabaseClient = (access_token?: string) => {
  const client = createClient(supabaseUrl, supabaseKey, {
    fetch: fetch,
    persistSession: true,
    autoRefreshToken: true,
    localStorage: BrowserLocalStoarge,
  });

  if (access_token) {
    client.auth.setAuth(access_token);
  }

  return client;
};

export async function getAccessToken(): Promise<string | null> {
  const supabaseDataRecord = await browser.storage.local.get(browserStorageKey);
  const supabaseAuthData = JSON.parse(supabaseDataRecord[browserStorageKey]);

  if (supabaseAuthData.expiresAt < Date.now() / 1000) {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          refresh_token: supabaseAuthData.currentSession.refresh_token,
        }),
      }
    );

    if (res.status !== 200) {
      return null;
    }

    const body = await res.json();
    await browser.storage.local.set({
      [browserStorageKey]: JSON.stringify({
        currentSession: body,
        expiresAt: Date.now() / 1000 + body.expires_in,
      }),
    });
    return body.access_token;
  }

  return supabaseAuthData.currentSession.access_token;
}

export function getAuthUrl(provider: string, redirectUrl: string) {
  return `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUrl}`;
}
