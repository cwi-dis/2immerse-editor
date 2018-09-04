import * as React from "react";

export type ContextMenuDivider = React.SFC<{}>;
export const ContextMenuDivider: ContextMenuDivider = (props) => {
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

    const style: React.CSSProperties = {
      padding: "2px 40px 2px 20px",
      cursor: "pointer",
      backgroundColor: selected ? "#007ACC" : "transparent",
      color: selected ? "#FFFFFF" : "#000000",
      fontSize: "11pt"
    };

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
  public static defaultProps = {
    onItemClicked: () => {}
  };

  public render() {
    const {x, y, visible, children} = this.props;

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

    return null;
  }
}

export default ContextMenu;
