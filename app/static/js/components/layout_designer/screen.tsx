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

  private getCanvasClickPosition(clickEvent: any) {
    return [
      clickEvent.pageX - this.canvas.offsetLeft,
      clickEvent.pageY - this.canvas.offsetTop
    ];
  }

  private handleCanvasClick(orientation: "horizontal" | "vertical", e: any) {
    const [x, y] = this.getCanvasClickPosition(e);
    const context = this.canvas.getContext("2d");

    if (context) {
      context.beginPath();

      context.lineWidth = 1;
      context.fillStyle = "black";

      if (orientation === "horizontal") {
        context.moveTo(x, 0);
        context.lineTo(x, this.canvas.height);
      } else {
        context.moveTo(0, y);
        context.lineTo(this.canvas.width, y);
      }

      context.stroke();
    }
  }

  public render() {
    const screen = this.props.screenInfo;

    const { width } = this.props;
    const computedHeight = (screen.orientation === "landscape")
      ? 9 / 16 * width
      : 16 / 9 * width;

    return (
      <div>
        <p>
          Name: {screen.name} Orientation: {screen.orientation}
          <br/>
          <span style={{cursor: "pointer", color: "#FF0000"}} onClick={this.props.removeDevice}>remove</span>
        </p>
        <canvas onClick={this.handleCanvasClick.bind(this, "horizontal")}
                onDoubleClick={this.handleCanvasClick.bind(this, "vertical")}
                ref={(el) => this.canvas = el}
                height={computedHeight}
                width={width}
                style={{display: "block", margin: "0 auto"}}>
        </canvas>
      </div>
    );
  }
}

export default Screen;