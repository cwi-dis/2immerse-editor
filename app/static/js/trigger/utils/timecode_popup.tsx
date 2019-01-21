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
import { Nullable } from "../../editor/util";

interface TimecodePopupProps {
  position?: { top: number, left: number };
  timeOffset: number;

  updateOffset: (t: number) => void;
  seekBy: (t: number) => void;
}

class TimecodePopup extends React.Component<TimecodePopupProps, {}> {
  private seekByField: Nullable<HTMLInputElement>;

  private seekBy() {
    if (this.seekByField) {
      // Get value from event as number and invoke callback
      const value = this.seekByField.valueAsNumber;
      this.props.seekBy(value);
    }
  }

  private updateOffset(e: React.ChangeEvent<HTMLInputElement>) {
    // Get value from event as number and invoke callback
    const value = e.target.valueAsNumber;
    this.props.updateOffset(value);
  }

  public render() {
    const { position, timeOffset } = this.props;

    // Don't render anything if position is undefined
    if (position === undefined) {
      return null;
    }

    const { top, left } = position;
    const boxStyle: React.CSSProperties = {
      width: 250,
      backgroundColor: "#FFFFFF",
      padding: 15,
      borderRadius: 3,
      boxShadow: "0 0 5px #555555"
    };

    const bottomArrowStyle: React.CSSProperties = {
      marginLeft: 15,
      width: 0, height: 0,
      borderLeft: "10px solid transparent", borderRight: "10px solid transparent",
      borderTop: "10px solid #FFFFFF"
    };

    // Render timecode popup at given absolute position with options to seek by
    // n seconds and adjust the timecode fudge factor
    return (
      <div style={{position: "absolute", top, left}}>
        <div style={boxStyle}>
          <div>Timecode Fudge Factor</div>
          <input
            className="input"
            type="number"
            value={timeOffset}
            min={0}
            onChange={this.updateOffset.bind(this)}
          />

          <div style={{marginTop: 10}}>Seek by</div>
          <div className="field has-addons">
            <div className="control">
              <input className="input" type="number" defaultValue="0" ref={(e) => this.seekByField = e} />
            </div>
            <div className="control">
              <button className="button is-info" onClick={this.seekBy.bind(this)}>
                Go
              </button>
            </div>
          </div>
        </div>
        <div style={bottomArrowStyle} />
      </div>
    );
  }
}

export default TimecodePopup;
