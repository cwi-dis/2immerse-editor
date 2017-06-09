import * as React from "react";

import { ApplicationState } from "../../store";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";

interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  removeDevice: () => void;
  splitRegion: (id: string, orientation: "horizontal" | "vertical", position: number) => void;
}

class Screen extends React.Component<ScreenProps, {}> {
  private canvas: HTMLCanvasElement;

  private drawRegions() {
    const {width, height} = this.canvas;
    const screen = this.props.screenInfo;
    const context = this.canvas.getContext("2d");

    if (context) {
      context.fillStyle = "white";
      context.strokeStyle = "black";
      context.fillRect(0, 0, width, height);

      screen.regions.forEach((region) => {
        console.log("Drawing region: " + region);

        const [x, y] = region.position;
        const [w, h] = region.size;

        context.strokeRect(x * width, y * height, w * width, h * height);
      });
    }
  }

  public componentDidUpdate() {
    this.drawRegions();
  }

  public componentDidMount() {
    this.drawRegions();
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

  private handleCanvasClick(orientation: "horizontal" | "vertical", e: MouseEvent) {
    e.preventDefault();
    const [x, y] = this.getCanvasClickPosition(e);
    const clickedRegion = this.getClickedRegion(x / this.canvas.width, y / this.canvas.height);

    if (clickedRegion) {
      const splitPosition = (orientation === "horizontal") ? y / this.canvas.height : x / this.canvas.width;
      this.props.splitRegion(clickedRegion.id, orientation, splitPosition);
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