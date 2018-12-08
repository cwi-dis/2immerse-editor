import * as React from "react";
import { AssetState } from "../../reducers/assets";

interface DMAppcContainerProps {
  assets: AssetState;
}

class DMAppcContainer extends React.Component<DMAppcContainerProps, {}> {
  public setDragData(assetId: string, e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData("text/plain", assetId);
  }

  public render() {
    const { assets } = this.props;

    return (
      <div style={{height: "50%", overflowY: "scroll", backgroundColor: "#353535", borderTop: "1px solid #161616", padding: 2}}>
        {assets.map((asset, i: number) => {
          return (
            <div
              key={i}
              draggable={true}
              onDragStart={this.setDragData.bind(this, asset.id)}
              style={{backgroundColor: "#262626", margin: 3, width: 140, height: 140, padding: 5, float: "left"}}
            >
              <b style={{fontSize: 15}}>{asset.name}</b>
              <p style={{marginTop: 10, fontSize: 12}}>{asset.description}</p>
            </div>
          );
        })}
        <br style={{clear: "both"}} />
      </div>
    );
  }
}

export default DMAppcContainer;
