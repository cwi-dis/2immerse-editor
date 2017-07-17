import * as React from "react";

import { ApplicationState } from "../../store";
import { Screen as ScreenModel, ScreenRegion } from "../../reducers/screens";
import ContextMenu, { ContextMenuEntry, ContextMenuDivider } from "../context_menu";

interface ScreenProps {
  screenInfo: ScreenModel;
  width: number;
  removeDevice: () => void;
  splitRegion: (id: string, orientation: "horizontal" | "vertical", position: number) => void;
  undoLastSplit: () => void;
}

interface ScreenState {
  contextMenu: {
    visible: boolean,
    x: number,
    y: number,
  };
}

class Screen extends React.Component<ScreenProps, ScreenState> {
  private canvas: HTMLCanvasElement;

  constructor(props: ScreenProps) {
    super(props);

    this.state = {
      contextMenu: {
        visible: false, x: 0, y: 0
      }
    };
  }

  private drawRegions() {
    const {width, height} = this.canvas;
    const screen = this.props.screenInfo;
    const context = this.canvas.getContext("2d");

    if (context) {
      context.fillStyle = "white";
      context.strokeStyle = "black";
      context.fillRect(0, 0, width, height);

      screen.regions.forEach((region) => {
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

  private getCanvasClickPosition(pageX: number, pageY: number) {
    return [
      pageX - this.canvas.offsetLeft,
      pageY - this.canvas.offsetTop
    ];
  }

  private splitRegion(orientation: "horizontal" | "vertical") {
    const {x: pageX, y: pageY} = this.state.contextMenu;
    const [x, y] = this.getCanvasClickPosition(pageX, pageY);
    const clickedRegion = this.getClickedRegion(x / this.canvas.width, y / this.canvas.height);

    if (clickedRegion) {
      const splitPosition = (orientation === "horizontal") ? y / this.canvas.height : x / this.canvas.width;
      this.props.splitRegion(clickedRegion.id, orientation, splitPosition);
    }
  }

  private handleCanvasClick(ev: MouseEvent) {
    this.setState({
      contextMenu: {
        visible: true,
        x: ev.pageX,
        y: ev.pageY
      }
    });
  }

  public render() {
    const screen = this.props.screenInfo;
    const { contextMenu } = this.state;

    const { width } = this.props;
    const computedHeight = (screen.orientation === "landscape")
      ? 9 / 16 * width
      : 16 / 9 * width;

    return (
      <div>
        <ContextMenu {...contextMenu} onItemClicked={() => {
          this.setState({contextMenu: {visible: false, x: 0, y: 0}});
        }}>
          <ContextMenuEntry name="Split horizontal" callback={this.splitRegion.bind(this, "horizontal")} />
          <ContextMenuEntry name="Split vertical" callback={this.splitRegion.bind(this, "vertical")} />
          <ContextMenuDivider />
          <ContextMenuEntry name="Undo last split" callback={this.props.undoLastSplit.bind(this)} />
          <ContextMenuDivider />
          <ContextMenuEntry name="Cancel" callback={() => {}} />
        </ContextMenu>
        <p>
          Name: {screen.name}<br/>
          Orientation: {screen.orientation}<br/>
          <span style={{cursor: "pointer", color: "#FF0000"}} onClick={this.props.removeDevice}>
            remove
          </span>
        </p>
        <canvas onClick={this.handleCanvasClick.bind(this)}
                ref={(el) => this.canvas = el}
                height={computedHeight}
                width={width}
                style={{display: "block", margin: "0 auto"}}>
        </canvas>
        <br/>
      </div>
    );
  }
}

export default Screen;
