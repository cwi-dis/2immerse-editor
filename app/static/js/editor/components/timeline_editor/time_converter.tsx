import * as React from "react";
import { padStart } from "../../util";

interface TimeConverterProps {
  seconds: number;
  style?: React.CSSProperties;
}

const TimeConverter: React.SFC<TimeConverterProps> = (props) => {
  let { seconds, style } = props;
  // Function for padding a number with leading zeroes
  const padZero = (n: number) => padStart(n, 2, "0");

  // Get hours from timestamp
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  // Get minutes from timestamp
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return (
    <span style={style}>
      {padZero(hours)}:{padZero(minutes)}:{padZero(seconds)}
    </span>
  );
};

export default TimeConverter;
