import { Button } from "@material-ui/core";
import React from "react";
import ReactDOM from "react-dom";
import { browser } from "webextension-polyfill-ts";
import { getIdToken } from "./utils/Firebase";

var rootNode = document.getElementById("options");
var onSignIn = async () => {
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
  const tokenData = await getIdToken(refreshToken);
  const expiryTime =
    Math.floor(Date.now() / 1000) + Number.parseInt(tokenData.expires_in);

  /* Use provided refresh token as it may have been updated by API */
  browser.storage.local.set({
    id_token: tokenData.id_token,
    refresh_token: tokenData.refresh_token,
    expiry_time: expiryTime,
  });

  console.log(tokenData.id_token);
};

ReactDOM.render(
  <div>
    <Button onClick={onSignIn} variant="contained" color="primary">
      Sign In
    </Button>
  </div>,
  rootNode
);
