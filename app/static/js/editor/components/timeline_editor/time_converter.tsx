/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { padStart } from "../../util";

/**
 * Props for TimeConverter
 */
interface TimeConverterProps {
  seconds: number;
  style?: React.CSSProperties;
}

/**
 * TimeConverter takes a numeric value for seconds and uses it to render a
 * timecode consisting of hours, minutes and seconds. All values are padded to
 * the left with zeroes. So for instance, passing the value 345 for the prop
 * `seconds` will result in a timecode `00:05:45` to be generated.
 *
 * @param seconds The time in seconds we want to generate a timecode for
 * @param style CSS style for the wrapping element
 */
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
