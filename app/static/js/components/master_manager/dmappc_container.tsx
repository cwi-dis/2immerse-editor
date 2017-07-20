import * as React from "react";

class DMAppcContainer extends React.Component<{}, {}> {
  public render() {
    return (
      <div style={{height: "50%", borderTop: "1px solid #161616", overflow: "scroll", padding: 5, display: "flex", flexWrap: "wrap", alignContent: "flex-start"}}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i: number) => {
          return (
            <div key={i} draggable style={{backgroundColor: "#555555", margin: 5, width: 133, height: 120, padding: 5}}>
              <b>DMAppC {i}</b>
              <p>This is a short description</p>
            </div>
          );
        })}
      </div>
    );
  }
}

export default DMAppcContainer;