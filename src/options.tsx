import { Button } from "@material-ui/core";
import { SupabaseClient, User } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import { createSupabaseClient, getAuthUrl } from "./util/supabase";

const onSignIn = async (supabase: SupabaseClient, provider: string) => {
  const redirectUrl = browser.identity.getRedirectURL();
  const authUrl = getAuthUrl(provider, redirectUrl);
  const responseUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authUrl,
  });

  const urlParams = new URLSearchParams(responseUrl);
  const refreshToken = urlParams.get("refresh_token");
  if (!refreshToken) return;

  await supabase.auth.signIn({ refreshToken: refreshToken });
};

const onSignOut = async (supabase: SupabaseClient) => {
  await supabase.auth.signOut();
};

function SignInButton(props: {
  user: User | null;
  supabase: SupabaseClient;
}): JSX.Element {
  const { user, supabase } = props;

  if (user) {
    return (
      <Button
        onClick={() => onSignOut(supabase)}
        variant="contained"
        color="primary"
      >
        Sign Out
      </Button>
    );
  } else {
    return (
      <Button
        onClick={() => onSignIn(supabase, "google")}
        variant="contained"
        color="primary"
      >
        Sign In
      </Button>
    );
  }
}

function OptionsPage(): JSX.Element {
  const testTrack = useCallback(async () => {}, []);
  const [user, setUser] = useState<User | null>(null);
  const supabase = useMemo(() => createSupabaseClient(), []);
  const test = useCallback(async () => {
    const { data, error } = await supabase.rpc("scrobble", {
      _track: {
        album: {
          cover_url:
            "https://i.scdn.co/image/ab67616d0000b273e9d11eb596a7a7e426d81635",
          id: "4iCcsBlzVQVZoJzxBvhuyS",
          name: "working",
        },
        artists: [
          {
            genres: ["alt z", "dance pop", "pop", "post-teen pop"],
            id: "45dkTj5sMRSjrmBSBeiHym",
            image_url:
              "https://i.scdn.co/image/ab6761610000e5ebaffed0ec7e7fefc51ca6f02f",
            name: "Tate McRae",
          },
          {
            genres: ["pop", "pop r&b"],
            id: "6LuN9FCkKOj5PcnpouEgny",
            image_url:
              "https://i.scdn.co/image/ab6761610000e5eb012b37d6dec8872b18524f78",
            name: "Khalid",
          },
        ],
        id: "31sSFHIe4NaxltVFOEIcTa",
        name: "working",
        preview_url:
          "https://p.scdn.co/mp3-preview/0710e4d56d230a985ef2eeb1679f2b1464418afe?cid=839e953a298e4f779e567b1fa208f40b",
      },
    });
    console.log(data, error);
  }, [supabase]);

  useEffect(() => {
    setUser(supabase.auth.user());
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  });

  return (
    <div>
      {user && <p>Logged in as: {user.email} </p>}
      <SignInButton user={user} supabase={supabase} />
      <Button
        onClick={async () => {
          await test();
        }}
        variant="contained"
        color="primary"
      >
        Send Test Track
      </Button>
    </div>
  );
}

ReactDOM.render(<OptionsPage />, document.getElementById("options"));
