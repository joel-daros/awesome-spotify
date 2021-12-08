import {
  getCurrentUserPlaylists,
  getTopArtists,
  getTopTracks,
  getUserProfile,
} from "../spotify";
import { useState, useEffect } from "react";
import { StyledHeader } from "../styles";
import {
  ArtistGrid,
  SectionWrapper,
  TrackList,
  PlaylistGrid,
  Loader,
} from "../components";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [playlists, setPlaylists] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const [topTracks, setTopTracks] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile.data);

        const userPlaylists = await getCurrentUserPlaylists();
        setPlaylists(userPlaylists.data);

        const userTopArtists = await getTopArtists();
        setTopArtists(userTopArtists.data);

        const userTopTracks = await getTopTracks();
        setTopTracks(userTopTracks.data);
        console.log(userTopTracks.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {profile && (
        <StyledHeader type="user">
          <div className="header__inner">
            {profile.images.length && profile.images[0].url && (
              <img
                className="header__img"
                src={profile.images[0].url}
                alt="Avatar"
              />
            )}
            <div>
              <div className="header__overline">Profile</div>
              <h1>{profile.display_name}</h1>
              <p className="header__meta">
                {playlists && (
                  <span>
                    {playlists.total} Playlist{playlists.total !== 1 ? "s" : ""}
                  </span>
                )}
                <span>
                  {profile.followers.total} Follower
                  {profile.followers.total !== 1 ? "s" : ""}
                </span>
              </p>
            </div>
          </div>
        </StyledHeader>
      )}

      {topArtists && topTracks && playlists ? (
        <main>
          <SectionWrapper
            title="Top Artists this month"
            seeAllLink="/top-artists"
          >
            <ArtistGrid artists={topArtists.items.slice(0, 10)} />
          </SectionWrapper>
          <SectionWrapper
            title="Top Tracks this month"
            seeAllLink="/top-tracks"
          >
            <TrackList tracks={topTracks.items.slice(0, 10)} />
          </SectionWrapper>
          <SectionWrapper title="Playlists" seeAllLink="/playlists">
            <PlaylistGrid playlists={playlists.items.slice(0, 5)} />
          </SectionWrapper>
        </main>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Profile;
