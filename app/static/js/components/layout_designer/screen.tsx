import * as React from "react";

import { ApplicationState } from "../../store";
import { Screen as ScreenModel } from "../../reducers/screens";

interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  removeDevice: () => void;
}

class Screen extends React.Component<ScreenProps, {}> {
  private canvas: HTMLCanvasElement;

  public componentDidMount() {
    const context = this.canvas.getContext("2d");

    if (context) {
      context.fillStyle = "white";
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public render() {
    const screen = this.props.screenInfo;

    return (
      <div>
        <p>
          Name: {screen.name} Orientation: {screen.orientation}
          <br/>
          <span style={{cursor: "pointer", color: "#FF0000"}} onClick={this.props.removeDevice}>remove</span>
        </p>
        <canvas ref={(el) => this.canvas = el} width={this.props.width - 50}></canvas>
      </div>
    );
  }
}

export default Screen;