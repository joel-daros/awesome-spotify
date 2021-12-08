import { getCurrentUserPlaylists } from "../spotify";
import axios from "../config/axiosConfig";
import { useState, useEffect } from "react";
import { SectionWrapper, PlaylistGrid, Loader } from "../components";

const Playlists = () => {
  const [playlistsData, setPlaylistsData] = useState(null);
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userPlaylists = await getCurrentUserPlaylists(5);
        setPlaylistsData(userPlaylists.data);
        console.log("userPlaylists: ", userPlaylists);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  // When playlistsData updates, check if there are more playlists to fetch
  // then update the state variable
  useEffect(() => {
    if (!playlistsData) {
      return;
    }

    // Playlist endpoint only returns 20 playlists at a time, so we need to
    // make sure we get ALL playlists by fetching the next set of playlists
    const fetchMoreData = async () => {
      if (playlistsData.next) {
        const { data } = await axios.get(playlistsData.next);
        setPlaylistsData(data);
        console.log("fetchMoreData", data);
      }
    };

    // Use functional update to update playlists state variable
    // to avoid including playlists as a dependency for this hook
    // and creating an infinite loop
    setPlaylists((playlists) => [
      ...(playlists ? playlists : []),
      ...playlistsData.items,
    ]);

    // Fetch next set of playlists as needed
    fetchMoreData();
  }, [playlistsData]);

  return (
    <main>
      {playlists ? (
        <SectionWrapper title="Playlists" breadcrumb>
          <PlaylistGrid playlists={playlists} />
        </SectionWrapper>
      ) : (
        <Loader />
      )}
    </main>
  );
};

export default Playlists;
