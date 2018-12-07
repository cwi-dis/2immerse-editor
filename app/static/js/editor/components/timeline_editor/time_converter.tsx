import * as React from "react";
import { padStart } from "../../util";

interface TimeConverterProps {
  seconds: number;
}

const TimeConverter: React.SFC<TimeConverterProps> = (props) => {
  let { seconds } = props;
  const padZero = (n: number) => padStart(n, 2, "0");

  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  return (
    <p>{padZero(hours)}:{padZero(minutes)}:{padZero(seconds)}</p>
  );
};

export default TimeConverter;
