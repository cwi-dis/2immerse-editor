import * as React from "react";

class DMAppcContainer extends React.Component<{}, {}> {
  public render() {
    return (
      <div style={{height: "50%", overflowY: "scroll", backgroundColor: "#353535", borderTop: "1px solid #161616", padding: 2}}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i: number) => {
          return (
            <div key={i} draggable style={{backgroundColor: "#262626", margin: 3, width: 140, height: 140, padding: 5, float: "left"}}>
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
