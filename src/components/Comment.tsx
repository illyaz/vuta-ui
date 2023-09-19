import { Anchor, ScrollArea, Text } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";

type CommentProps = {
  videoId: string;
  text: string;
  scrollHeight?: number;
  scrollClassname?: string;
  onTimestampClick?: (t: number) => void;
  onTimestampParsed?: (ts: number[]) => void;
};

const regex =
  /(?<time>(((\d{1,2}):)?(\d{1,2}):(\d{2})))|<em>(?<text>.+)<\/em>/g;

const Comment: React.FC<CommentProps> = React.memo(
  ({
    videoId,
    text,
    scrollHeight,
    scrollClassname,
    onTimestampClick,
    onTimestampParsed,
  }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const matchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (divRef.current && matchRef.current) {
        divRef?.current?.scrollTo({
          top:
            matchRef.current.offsetTop -
            (matchRef.current.parentElement?.offsetTop ?? 0),
        });
      }
    }, [divRef, matchRef]);

    const matches = Array.from(text.matchAll(regex));
    const [runs] = useState(() => {
      const runs = [];
      const ts = [];
      let lastIndex = 0;
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (match.index === undefined) continue;

        const nText = text.substring(lastIndex, match.index);
        runs.push(
          <Text key={runs.length} span>
            {nText}
          </Text>
        );
        lastIndex = match.index + match[0].length;
        if (match.groups?.time) {
          let t = 0;
          if (match[4]) t += parseInt(match[4]) * 3600;
          if (match[5]) t += parseInt(match[5]) * 60;
          if (match[6]) t += parseInt(match[6]);

          runs.push(
            <Anchor
              key={runs.length}
              onClick={(e) => {
                if (onTimestampClick) {
                  e.preventDefault();
                  onTimestampClick(t);
                }
              }}
              href={`https://youtube.com/watch?v=${videoId}&t=${t}`}
              target="_blank"
            >
              {match.groups.time}
            </Anchor>
          );
          ts.push(t);
        } else if (match.groups?.text) {
          if (!matchRef.current)
            runs.push(
              <Text
                ref={matchRef}
                key={runs.length}
                color="green"
                weight="bold"
                span
              >
                {match.groups.text}
              </Text>
            );
          else
            runs.push(
              <Text key={runs.length} color="green" weight="bold" span>
                {match.groups.text}
              </Text>
            );
        }
      }

      runs.push(
        <Text key={runs.length} span>
          {text.substring(lastIndex)}
        </Text>
      );

      if (onTimestampParsed) onTimestampParsed(ts);
      return runs;
    });

    return (
      <ScrollArea
        h={scrollHeight ?? 150}
        viewportRef={divRef}
        className={`p-4 whitespace-pre-wrap ${scrollClassname}`}
      >
        <Text className="leading-6">{...runs}</Text>
      </ScrollArea>
    );
  }
);

export default Comment;
