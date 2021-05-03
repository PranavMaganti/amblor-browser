import { Button } from "@material-ui/core";
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import {
  clearAuthStorage,
  getTokenIdWithRefresh,
  storeTokenData,
  useIdTokenExists,
} from "./util/firebase";
import { scrobble } from "./util/scrobble";

const rootNode = document.getElementById("options");
const onSignIn = async () => {
  const redirectURL = browser.identity.getRedirectURL();
  let authURL = "http://localhost:3000/login";
  authURL += `?response_type=token`;
  authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
  const responseUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authURL,
  });

  const urlParams = new URL(responseUrl).searchParams;
  const refreshToken = urlParams.get("refresh_token");
  if (!refreshToken) {
    // TODO: Display error to user
    return;
  }

  console.log("Refresh Token: ", refreshToken);
  storeTokenData(await getTokenIdWithRefresh(refreshToken));
};

const onSignOut = async () => {
  await clearAuthStorage();
};

function SignInButton(): JSX.Element {
  const idTokenExists = useIdTokenExists();

  if (idTokenExists) {
    return (
      <Button onClick={onSignOut} variant="contained" color="primary">
        Sign Out
      </Button>
    );
  } else {
    return (
      <Button onClick={onSignIn} variant="contained" color="primary">
        Sign In
      </Button>
    );
  }
}

function OptionsPage(): JSX.Element {
  const testTrack = useCallback(async () => {
    await scrobble({
      name: "everytime",
      artist: "Ariana Grande",
      album: "Sweetener",
    });
  }, []);

  return (
    <div>
      <SignInButton />
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
