import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import { Track } from "./util/amblor";

function Popup(): JSX.Element {
  const [track, setTrack] = useState<Track | null>(null);
  const trackChangeListener = useCallback(async (changes) => {
    if ("matchedTrack" in changes && changes.matchedTrack.newValue) {
      setTrack(changes.matchedTrack.newValue);
    }
  }, []);

  const setInitialTrack = useCallback(async () => {
    const data = await browser.storage.local.get("matchedTrack");
    setTrack(data.matchedTrack);
  }, []);

  useEffect(() => {
    setInitialTrack();
    browser.storage.onChanged.addListener(trackChangeListener);
    return () => browser.storage.onChanged.removeListener(trackChangeListener);
  });

  if (!track) {
    return <div>Waiting for song</div>;
  }

  return (
    <div style={{ minWidth: 300, display: "flex", flexDirection: "row" }}>
      <img src={track.album.cover_url} width={70} height={70}></img>
      <div style={{ width: 20 }} />
      <div>
        <p style={{ fontWeight: "bold" }}>{track.name}</p>
        <p>{track.artists.map((artist) => artist.name).join(", ")}</p>
      </div>
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById("popup"));
