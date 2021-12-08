import { useState, useEffect, useMemo } from "react";
import { getPlaylist, getAudioFeaturesForTracks } from "../spotify";
import { useParams } from "react-router-dom";
import axios from "../config/axiosConfig";
import { StyledHeader, StyledDropdown } from "../styles";
import { SectionWrapper, TrackList } from "../components";

const Playlists = () => {
  const [playlist, setPlaylist] = useState(null);
  const [tracksData, setTracksData] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const sortOptions = ["danceability", "tempo", "energy"];

  const { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        const playlist = await getPlaylist(id);
        setPlaylist(playlist.data);
        setTracksData(playlist.data.tracks);
        console.log(playlist.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, [id]);

  // When playlistsData updates, check if there are more playlists to fetch
  // then update the state variable
  useEffect(() => {
    if (!tracksData) {
      return;
    }

    // Playlist endpoint only returns 20 playlists at a time, so we need to
    // make sure we get ALL playlists by fetching the next set of playlists
    const fetchMoreData = async () => {
      if (tracksData.next) {
        const { data } = await axios.get(tracksData.next);
        setTracksData(data);
        console.log("fetchMoreData", data);
      }
    };
    fetchMoreData();

    // Use functional update to update tracks state variable
    // to avoid including tracks as a dependency for this hook
    // and creating an infinite loop
    setTracks((tracks) => [...(tracks ? tracks : []), ...tracksData.items]);

    // Also update the audioFeatures state variable using the track IDs
    const fetchAudioFeatures = async () => {
      const ids = tracksData.items.map(({ track }) => track.id).join(",");

      const { data } = await getAudioFeaturesForTracks(ids);

      setAudioFeatures((audioFeatures) => [
        ...(audioFeatures ? audioFeatures : []),
        ...data["audio_features"],
      ]);
    };
    fetchAudioFeatures();

    // Fetch next set of playlists as needed
  }, [tracksData]);

  const tracksWithAudioFeatures = useMemo(() => {
    if (!tracks || !audioFeatures) {
      return;
    }
    return tracks.map(({ track }) => {
      const trackToAdd = track;
      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find((item) => {
          if (!item || !track) {
            return null;
          }
          return item.id === track.id;
        });

        trackToAdd["audio_features"] = audioFeaturesObj;
      }
      return trackToAdd;
    });
  }, [audioFeatures, tracks]);

  const sortedTracks = useMemo(() => {
    if (!tracksWithAudioFeatures) {
      return null;
    }

    return [...tracksWithAudioFeatures].sort((a, b) => {
      const aFeatures = a["audio_features"];
      const bFeatures = b["audio_features"];

      if (!aFeatures || !bFeatures) {
        return false;
      }

      return bFeatures[sortValue] - aFeatures[sortValue];
    });
  }, [sortValue, tracksWithAudioFeatures]);

  return (
    playlist && (
      <>
        <StyledHeader>
          <div className="header__inner">
            {playlist.images.length && playlist.images[0].url && (
              <img
                className="header__img"
                src={playlist.images[0].url}
                alt="Playlist Artwork"
              />
            )}
            <div>
              <div className="header__overline">Playlist</div>
              <h1 className="header_name">{playlist.name}</h1>
              <p className="header__meta">
                {playlist.followers.total ? (
                  <span>
                    {playlist.followers.total}{" "}
                    {`followr${playlist.followers.total !== 1 ? "s" : ""}`}
                  </span>
                ) : null}
                <span>
                  {playlist.tracks.total}{" "}
                  {`song${playlist.tracks.total !== 1 ? "s" : ""}`}
                </span>
              </p>
            </div>
          </div>
        </StyledHeader>
        <main>
          <SectionWrapper breadcrumb>
            <StyledDropdown active={!!sortValue}>
              <label htmlFor="order-select" className="sr-only">
                Sort Tracks
              </label>
              <select
                name="track-order"
                id="order-select"
                onChange={(e) => setSortValue(e.target.value)}
              >
                <option value="">Sort Tracks</option>
                {sortOptions.map((option, i) => (
                  <option value={option} key={i}>
                    {`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                  </option>
                ))}
              </select>
            </StyledDropdown>

            {sortedTracks && (
              <TrackList tracks={sortedTracks} />
            )}
          </SectionWrapper>
        </main>
      </>
    )
  );
};

export default Playlists;
