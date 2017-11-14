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
      const value = this.seekByField.valueAsNumber;
      this.props.seekBy(value);
    }
  }

  private updateOffset(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.valueAsNumber;
    this.props.updateOffset(value);
  }

  public render() {
    const { position, timeOffset } = this.props;

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

    return (
      <div style={{position: "absolute", top, left}}>
        <div style={boxStyle}>
          <div>Timecode Fudge Factor</div>
          <input className="input"
                  type="number"
                  value={timeOffset}
                  min={0}
                  onChange={this.updateOffset.bind(this)} />

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
        <div style={bottomArrowStyle}></div>
      </div>
    );
  }
}

export default TimecodePopup;
