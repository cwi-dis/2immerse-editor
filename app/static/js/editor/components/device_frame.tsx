import * as React from "react";
import { Image as KonvaImage } from "react-konva";

import { Nullable, Coords } from "../util";

interface DeviceFrameProps {
  src: string;
  width: number;
  height: number;
}

interface DeviceFrameState {
  image: Nullable<HTMLImageElement>;
}

class DeviceFrame extends React.Component<DeviceFrameProps, DeviceFrameState> {
  constructor(props: DeviceFrameProps) {
    super(props);

    this.state = {
      image: null
    };
  }

  public componentDidMount() {
    // Construct new Image object and set src to props.src
    const image = new Image();
    image.src = this.props.src;

    // Update state once image is loaded
    image.onload = () => {
      this.setState({ image });
    };
  }

  public render() {
    const { width, height } = this.props;
    const { image } = this.state;

    // Render and scale image once it's loaded
    if (image !== null) {
      return (
        <KonvaImage
          x={0}
          y={0}
          width={width}
          height={height}
          image={image}
        />
      );
    }

    return null;
  }
}

export default DeviceFrame;
