import { Button } from "@material-ui/core";
import { User } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import { scrobble } from "./util/amblor";
import { getAuthUrl, supabase } from "./util/supabase";

const rootNode = document.getElementById("options");
const onSignIn = async (provider: string) => {
  const redirectUrl = browser.identity.getRedirectURL();
  const authUrl = getAuthUrl(provider, redirectUrl);
  const responseUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authUrl,
  });

  const urlParams = new URLSearchParams(responseUrl);
  const refreshToken = urlParams.get("refresh_token");
  if (!refreshToken) return;

  await supabase.auth.signIn({
    refreshToken: refreshToken,
  });
};

const onSignOut = async () => {
  await supabase.auth.signOut();
};

function SignInButton(props: { user: User | null }): JSX.Element {
  const { user } = props;

  if (user) {
    return (
      <Button onClick={onSignOut} variant="contained" color="primary">
        Sign Out
      </Button>
    );
  } else {
    return (
      <Button
        onClick={() => onSignIn("google")}
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
  const [user, setUser] = useState(supabase.auth.user());

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
  });

  return (
    <div>
      {user && <p>Logged in as: {user.email} </p>}
      <SignInButton user={user} />
      <Button onClick={testTrack} variant="contained" color="primary">
        Send Test Track
      </Button>
    </div>
  );
}

ReactDOM.render(
  <div>
    <OptionsPage></OptionsPage>
  </div>,
  rootNode
);
