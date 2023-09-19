import YouTube from "react-youtube";
import { Hit, SearchResult } from "../models/SearchResult";
import { useEffect, useRef, useState } from "react";
import { useElementSize } from "@mantine/hooks";
import Comment from "./Comment";
export type PlayerProps = {
  data?: SearchResult;
  videoId: string | null;
};

export const Player = function ({ data, videoId }: PlayerProps) {
  const [video, setVideo] = useState<Hit | undefined>();
  const { ref: rootRef, width: rootWidth } = useElementSize();
  const videoRef = useRef<YouTube>(null);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [lastWidth, setLastWidth] = useState(0);
  useEffect(() => {
    if (data) setVideo(data.hits.find((v) => v.videoId == videoId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);
  useEffect(() => {
    if (rootWidth) setLastWidth(rootWidth);
  }, [rootWidth]);
  return (
    <div ref={rootRef}>
      {lastWidth && videoId && (
        <YouTube
          ref={videoRef}
          videoId={videoId}
          opts={{
            width: lastWidth,
            height: lastWidth * 0.5625,
          }}
          onStateChange={(e) => e.data == 5 && e.target.seekTo(timestamps[0])}
          onReady={(e) => e.target.seekTo(timestamps[0])}
        />
      )}
      {video && (
        <Comment
          key={video.videoId}
          videoId={video.videoId}
          text={video?.highlightedText}
          scrollHeight={200}
          scrollClassname="p-0 px-4"
          onTimestampClick={(t) =>
            videoRef.current && videoRef.current.internalPlayer.seekTo(t)
          }
          onTimestampParsed={(ts) => setTimestamps(ts)}
        />
      )}
    </div>
  );
};
