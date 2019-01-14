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
    // Construct new Image object and set src to props.url
    const image = new Image();
    image.src = this.props.url;

    // Update state once image is loaded
    image.onload = () => {
      this.setState({ image });
    };
  }

  public render() {
    const { position: [x, y], height } = this.props;
    const { image } = this.state;

    // Render and scale image once it's loaded
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
