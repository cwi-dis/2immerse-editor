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

export type ContextMenuDivider = React.SFC<{}>;
export const ContextMenuDivider: ContextMenuDivider = (props) => {
  // Line to visibly divide context menu entries from each other
  return (
    <div className="divider" style={{width: "100%", marginTop: 1, height: 2, borderTop: "1px solid #BBBBBB"}} />
  );
};

interface ContextMenuEntryProps {
  name: string;
  callback: () => void;
}

interface ContextMenuEntryState {
  selected: boolean;
}

export class ContextMenuEntry extends React.Component<ContextMenuEntryProps, ContextMenuEntryState> {
  constructor(props: ContextMenuEntryProps) {
    super(props);

    this.state = {
      selected: false
    };
  }

  public render() {
    const { name, callback } = this.props;
    const { selected } = this.state;

    // Render background colour of entry based on 'selected' state
    const style: React.CSSProperties = {
      padding: "2px 40px 2px 20px",
      cursor: "pointer",
      backgroundColor: selected ? "#007ACC" : "transparent",
      color: selected ? "#FFFFFF" : "#000000",
      fontSize: "11pt"
    };

    // Use mouse events to determine if current entry is hovered over and invoke callback when clicked
    return (
      <div
        onMouseOver={() => this.setState({selected: true})}
        onMouseOut={() => this.setState({selected: false})}
        onClick={callback}
        className="entry"
        style={style}
      >
        {name}
      </div>
    );
  }
}

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  children: JSX.Element | Array<JSX.Element>;

  onItemClicked?: () => void;
}

class ContextMenu extends React.Component<ContextMenuProps, {}> {
  // Default function for when onItemClicked is not passed in from the outside
  public static defaultProps = {
    onItemClicked: () => {}
  };

  public render() {
    const {x, y, visible, children} = this.props;

    // Render context menu at absolute position [x, y]
    const style: React.CSSProperties = {
      position: "absolute",
      left: x,
      top: y,
      backgroundColor: "#FFFFFF",
      borderRadius: 4,
      boxShadow: "0px 0px 4px #555555",
      zIndex: 10
    };

    if (visible) {
      // Render div at given position with entries as child elements
      return (
        <div
          onClickCapture={() => this.props.onItemClicked!()}
          style={style}
        >
          <div style={{width: "100%", height: 4}} />
          {children}
          <div style={{width: "100%", height: 4}} />
        </div>
      );
    }

    // Render nothing if 'visible' property is false
    return null;
  }
}

export default ContextMenu;
