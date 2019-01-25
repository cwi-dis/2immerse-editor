/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Image as KonvaImage } from "react-konva";

import { Nullable, Coords } from "../../util";

/**
 * Props for PreviewImage
 */
interface PreviewImageProps {
  url: string;
  position: Coords;
  height: number;
}

/**
 * State for PreviewImage
 */
interface PreviewImageState {
  image: Nullable<HTMLImageElement>;
}

/**
 * PreviewImage is a component intended to render a preview image on a timeline
 * track. The preview image to be rendered is passed in via the `url` prop and
 * its height via the `height` prop. It can also be freely placed, using the
 * `position` prop. Before rendering it is then scaled proportionally.
 *
 * @param url An URL pointing to the preview image
 * @param position The position of the image on its canvas. Given as `[x, y]`
 * @param height The desired height of the image
 */
class PreviewImage extends React.Component<PreviewImageProps, PreviewImageState> {
  constructor(props: PreviewImageProps) {
    super(props);

    this.state = {
      image: null
    };
  }

  /**
   * Invoked after the component is mounted. Loads the image from the URL found
   * in the `url` prop and updates the state after the image has finished
   * loading.
   */
  public componentDidMount() {
    // Construct new Image object and set src to props.url
    const image = new Image();
    image.src = this.props.url;

    // Update state once image is loaded
    image.onload = () => {
      this.setState({ image });
    };
  }

  /**
   * Renders the component
   */
  public render() {
    const { position: [x, y], height } = this.props;
    const { image } = this.state;

    // Render and scale image once it's loaded
    if (image !== null) {
      // Calculate image width using given height
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
