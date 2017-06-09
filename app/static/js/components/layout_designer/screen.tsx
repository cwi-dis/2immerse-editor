import * as React from "react";

import { ApplicationState } from "../../store";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";

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

  private getClickedRegion(x: number, y: number): ScreenRegion | undefined {
    const regions = this.props.screenInfo.regions;

    const clickedRegion = regions.findEntry((region) => {
      const topLeft = region.position;
      const bottomRight = [topLeft[0] + region.size[0], topLeft[1] + region.size[1]];

      return x >= topLeft[0] && x < bottomRight[0] && y >= topLeft[1] && y < bottomRight[1];
    });

    if (clickedRegion) {
      return clickedRegion[1];
    }
  }

  private getCanvasClickPosition(clickEvent: MouseEvent) {
    return [
      clickEvent.pageX - this.canvas.offsetLeft,
      clickEvent.pageY - this.canvas.offsetTop
    ];
  }

  private drawCanvasLine(coord: number, orientation: "horizontal" | "vertical") {
    const context = this.canvas.getContext("2d");

    if (context) {
      context.beginPath();

      context.lineWidth = 1;
      context.fillStyle = "black";

      if (orientation === "vertical") {
        context.moveTo(coord, 0);
        context.lineTo(coord, this.canvas.height);
      } else {
        context.moveTo(0, coord);
        context.lineTo(this.canvas.width, coord);
      }

      context.stroke();
    }
  }

  private handleCanvasClick(orientation: "horizontal" | "vertical", e: MouseEvent) {
    e.preventDefault();
    const [x, y] = this.getCanvasClickPosition(e);

    if (orientation === "vertical") {
      this.drawCanvasLine(x, orientation);
    } else {
      this.drawCanvasLine(y, orientation);
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
        <canvas onClick={this.handleCanvasClick.bind(this, "vertical")}
                onContextMenu={this.handleCanvasClick.bind(this, "horizontal")}
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