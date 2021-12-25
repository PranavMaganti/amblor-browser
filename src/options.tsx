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
      <Button onClick={testTrack} variant="contained" color="primary">
        Send Test Track
      </Button>
    </div>
  );
}

ReactDOM.render(<OptionsPage />, document.getElementById("options"));
