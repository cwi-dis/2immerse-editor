import * as React from "react";
import { Image as KonvaImage } from "react-konva";

import { Nullable } from "../../util";

interface PreviewImageProps {
  url: string;
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
    const { image } = this.state;

    if (image !== null) {
      return (
        <KonvaImage image={image} />
      );
    }
  }
}

export default PreviewImage;
