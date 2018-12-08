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
    return (
      <div style={{height: "50%", overflowY: "scroll", backgroundColor: "#353535", borderTop: "1px solid #161616", padding: 2}}>
        {Array(11).fill(null).map((_, i: number) => {
          return (
            <div
              key={i}
              draggable={true}
              onDragStart={this.setDragData.bind(this, `component${i}`)}
              style={{backgroundColor: "#262626", margin: 3, width: 140, height: 140, padding: 5, float: "left"}}
            >
              <b style={{fontSize: 15}}>DMAppC {i}</b>
              <p style={{marginTop: 10, fontSize: 12}}>This is a short description</p>
            </div>
          );
        })}
        <br style={{clear: "both"}} />
      </div>
    );
  }
}

export default DMAppcContainer;
