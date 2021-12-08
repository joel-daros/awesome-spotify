import { useState, useEffect } from "react";
import { getTopTracks } from "../spotify";
import {
  TrackList,
  SectionWrapper,
  TimeRangeButtons,
  Loader,
} from "../components/index";

const TopTracks = () => {
  const [topTracks, setTopTracks] = useState(null);
  const [activeRange, setActiveRange] = useState("short_term");

  async function fetchData(time_range) {
    try {
      const userTopTracks = await getTopTracks(time_range);
      setTopTracks(userTopTracks.data);
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
      {topTracks ? (
        <SectionWrapper title="Top Tracks" breadcrumb>
          <TimeRangeButtons
            activeRange={activeRange}
            setActiveRange={setActiveRange}
          />
          <TrackList tracks={topTracks.items.slice(0, 20)} />
        </SectionWrapper>
      ) : (
        <Loader />
      )}
    </main>
  );
};

export default TopTracks;
