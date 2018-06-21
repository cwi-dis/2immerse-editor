import * as React from "react";

import { List } from "immutable";
import { Screen as ScreenModel } from "../../reducers/screens";
import SplittableScreen from "./splittable_screen";

interface ScreenContainerProps {
  screens: List<ScreenModel>;
  title: string;
  screenWidth: number;
  numColumns: number;
  colRef: (el: HTMLDivElement) => void;
  removeDevice: (id: string) => void;
  splitRegion: (screenId: string, regionId: string, orientation: "horizontal" | "vertical", position: number) => void;
  undoLastSplit: (screenId: string) => void;
}

const ScreenContainer: React.SFC<ScreenContainerProps> = (props) => {
  return (
    <div className={["column", "is-" + props.numColumns].join(" ")} ref={props.colRef}>
      <h3 style={{textAlign: "center"}}>{props.title} ({props.screens.count()})</h3>
      <div>{props.screens.map((screen, i) => {
        return (
          <SplittableScreen
            key={i}
            screenInfo={screen}
            width={props.screenWidth}
            removeDevice={props.removeDevice.bind(null, screen.id)}
            splitRegion={props.splitRegion.bind(null, screen.id)}
            undoLastSplit={props.undoLastSplit.bind(null, screen.id)}
          />
        );
      })}</div>
    </div>
  );
};

export default ScreenContainer;
