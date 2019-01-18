import * as React from "react";
import { AssetState } from "../../reducers/assets";

interface DMAppcContainerProps {
  baseUrl: string;
  assets: AssetState;
}

const DMAppcContainer: React.SFC<DMAppcContainerProps> = (props) => {
  const { assets, baseUrl } = props;

  // Set dataTransfer property in drag event object to current asset ID
  const setDragData = (assetId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", assetId);
  };

  // Render all assets as a list with name, description and preview image
  return (
    <div style={{height: "50%", overflowY: "scroll", backgroundColor: "#353535", borderTop: "1px solid #161616", padding: 2}}>
      {assets.map((asset, i: number) => {
        const previewUrl = baseUrl + asset.previewUrl;

        // Set draggable to true and assign asset ID on drag start
        return (
          <div
            key={i}
            draggable={true}
            onDragStart={setDragData.bind(null, asset.id)}
            style={{backgroundColor: "#262626", margin: 3, height: 100, padding: 10, display: "flex"}}
          >
            <div style={{height: 80, width: 80}}>
              <img src={previewUrl} style={{ width: 80, maxHeight: 80 }} />
            </div>
            <div style={{marginLeft: 15}}>
              <b style={{fontSize: 15}}>{asset.name}</b>
              <p style={{marginTop: 10, fontSize: 12}}>{asset.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DMAppcContainer;
