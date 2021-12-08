import { useState, useEffect } from "react";
import { getTopArtists } from "../spotify";
import {
  ArtistGrid,
  SectionWrapper,
  TimeRangeButtons,
  Loader,
} from "../components/index";

const TopArtists = () => {
  const [topArtists, setTopArtists] = useState(null);
  const [activeRange, setActiveRange] = useState("short_term");

  async function fetchData(time_range) {
    try {
      const userTopArtists = await getTopArtists(time_range);
      setTopArtists(userTopArtists.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData(activeRange);
  }, [activeRange]);

  return (
    <main>
      {/* um parametro normal de valor e uma função passada como parametro */}
      {topArtists ? (
        <SectionWrapper title="Top Artists" breadcrumb>
          <TimeRangeButtons
            activeRange={activeRange}
            setActiveRange={setActiveRange}
          />
          <ArtistGrid artists={topArtists.items.slice(0, 20)} />
        </SectionWrapper>
      ) : (
        <Loader />
      )}
    </main>
  );
};

export default TopArtists;
