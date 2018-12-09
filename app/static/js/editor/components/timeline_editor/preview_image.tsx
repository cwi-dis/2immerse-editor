import * as React from "react";
import { Image as KonvaImage } from "react-konva";

import { Nullable, Coords } from "../../util";

interface PreviewImageProps {
  url: string;
  position: Coords;
  height: number;
}

interface PreviewImageState {
  image: Nullable<HTMLImageElement>;
}

class PreviewImage extends React.Component<PreviewImageProps, PreviewImageState> {
  constructor(props: PreviewImageProps) {
    super(props);

    this.state = {
      image: null
    };
  }

  public componentDidMount() {
    const image = new Image();
    image.src = this.props.url;

    image.onload = () => {
      this.setState({ image });
    };
  }

  public render() {
    const { position: [x, y], height } = this.props;
    const { image } = this.state;

    if (image !== null) {
      const width = (image.width / image.height) * height;

      return (
        <KonvaImage
          x={x}
          y={y}
          width={width}
          height={height}
          image={image}
        />
      );
    }

    return null;
  }
}

export default PreviewImage;
