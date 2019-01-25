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

import { Nullable } from "../util";

/**
 * Props for DeviceFrame
 */
interface DeviceFrameProps {
  src: string;
  width: number;
  height: number;
}

/**
 * State for DeviceFrame
 */
interface DeviceFrameState {
  image: Nullable<HTMLImageElement>;
}

/**
 * DeviceFrame is a component intended to render a graphical device frame
 * around a preview screen. The device frame to be rendered is passed in via
 * the `src` prop and `width` and `height` represent the size that the frame
 * should be rendered at.
 *
 * @param src An URL pointing to a device frame
 * @param width The width of the rendered device frame
 * @param height The height of the rendered device frame
 */
class DeviceFrame extends React.Component<DeviceFrameProps, DeviceFrameState> {
  constructor(props: DeviceFrameProps) {
    super(props);

    this.state = {
      image: null
    };
  }

  /**
   * Invoked after the component is mounted. Loads the image from the URL found
   * in the `src` prop and updates the state after the image has finished
   * loading.
   */
  public componentDidMount() {
    // Construct new Image object and set src to props.src
    const image = new Image();
    image.src = this.props.src;

    // Update state once image is loaded
    image.onload = () => {
      this.setState({ image });
    };
  }

  /**
   * Renders the component
   */
  public render() {
    const { width, height } = this.props;
    const { image } = this.state;

    // Render image once it's loaded
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
