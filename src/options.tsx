import { Button } from "@material-ui/core";
import React from "react";
import ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import {
  clearAuthStorage,
  getTokenIdWithRefresh,
  storeTokenData,
  useIdTokeExists,
} from "./utils/firebase";

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

function OptionsPage(): JSX.Element {
  const idTokenExists = useIdTokeExists();

  var button;
  if (idTokenExists) {
    button = (
      <Button onClick={onSignOut} variant="contained" color="primary">
        Sign Out
      </Button>
    );
  } else {
    button = (
      <Button onClick={onSignIn} variant="contained" color="primary">
        Sign In
      </Button>
    );
  }

  return button;
}

ReactDOM.render(
  <div>
    <OptionsPage></OptionsPage>
  </div>,
  rootNode
);
