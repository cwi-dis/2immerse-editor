import * as React from "react";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";

import { ApplicationState } from "../../store";
import { ScreenState } from "../../reducers/screens";
import { actionCreators as screenActionCreators, ScreenActions } from "../../actions/screens";
import ScreenContainer from "./screen_container";
import { validateLayout } from "../../util";

interface TemplateRegion {
  region: {
    id: string,
    position: { x: number, y: number },
    size: { width: number, height: number }
  };
}

interface LayoutTemplate {
  deviceType: string;
  layout: {
    communal: {
      portrait: Array<TemplateRegion>,
      landscape: Array<TemplateRegion>
    },
    personal: {
      portrait: Array<TemplateRegion>,
      landscape: Array<TemplateRegion>
    }
  };
}

type LayoutDesignerProps = {
  screens: ScreenState
  screenActions: ScreenActions
};

interface LayoutDesignerState {
  personalScreenWidth: number;
  communalScreenWidth: number;
}

class LayoutDesigner extends React.Component<LayoutDesignerProps, LayoutDesignerState> {
  private communalColumn: HTMLDivElement;
  private personalColumn: HTMLDivElement;

  constructor(props: LayoutDesignerProps) {
    super(props);

    this.state = {
      personalScreenWidth: 0,
      communalScreenWidth: 0
    };
  }

  private parseTemplateRegions(regions: {portrait: Array<TemplateRegion>, landscape: Array<TemplateRegion>}, name: string, type: "communal" | "personal") {
    const { portrait, landscape } = regions;

    // Add new device in portrait orientation if there are portrait-oriented regions
    if (portrait.length > 0) {
      // Add device
      this.props.screenActions.addDevice(type, name, "portrait");
      const newScreen = this.props.screens.previewScreens.last()!;

      // Iterate over regions and place them on the new screen
      portrait.forEach(({ region }) => {
        this.props.screenActions.placeRegionOnScreen(
          newScreen.id,
          [region.position.x, region.position.y],
          [region.size.width, region.size.height]
        );
      });
    }

    // Add new device in landscape orientation if there are landscape-oriented regions
    if (landscape.length > 0) {
      // Add device
      this.props.screenActions.addDevice(type, name, "landscape");
      const newScreen = this.props.screens.previewScreens.last()!;

      // Iterate over regions and place them on the new screen
      landscape.forEach(({ region }) => {
        this.props.screenActions.placeRegionOnScreen(
          newScreen.id,
          [region.position.x, region.position.y],
          [region.size.width, region.size.height]
        );
      });
    }
  }

  private parseLayoutTemplates(templates: Array<LayoutTemplate>): void {
    // Parse regions for all templates
    templates.forEach((template) => {
      const { communal, personal } = template.layout;

      this.parseTemplateRegions(communal, template.deviceType, "communal");
      this.parseTemplateRegions(personal, template.deviceType, "personal");
    });
  }

  private loadTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length >= 1) {
      const file = e.target.files[0];
      const reader = new FileReader();

      // Parse file contents once file is fully loaded
      reader.onload = async () => {
        const layout = JSON.parse(reader.result!.toString());

        try {
          // Make sure layout is valid
          await validateLayout(layout);

          // Can only parse layout version 4 and model 'template'
          if (layout.version === undefined || layout.version !== 4) {
            alert("Can only process version 4 layout documents");
          } else if (layout.layoutModel === undefined || layout.layoutModel !== "template") {
            alert("Can only process files with layout model 'template'");
          } else {
            this.parseLayoutTemplates(layout.templates);
          }
        } catch (errors) {
          alert("Layout validation failed");
          console.error(errors);
        }
      };

      reader.readAsText(file);
      e.target.value = "";
    }
  }

  public componentDidMount() {
    this.setState({
      personalScreenWidth: this.personalColumn.clientWidth,
      communalScreenWidth: this.communalColumn.clientWidth
    });
  }

  public render() {
    const { screenActions } = this.props;
    const { previewScreens: screens } = this.props.screens;

    // Filter screens based on personal and communal devices
    const personalScreens = screens.filter((screen) => screen.type === "personal");
    const communalScreens = screens.filter((screen) => screen.type === "communal");

    return (
      <div className="content">
        <h3>Layout Designer</h3>

        <div className="block">
          <a style={{marginRight: 10}} className="button is-info" onClick={() => screenActions.addDevice("communal")}>Add communal device</a>
          <a style={{marginRight: 10}} className="button is-info" onClick={() => screenActions.addDevice("personal")}>Add personal device</a>
          <div className="field" style={{display: "inline-block"}}>
            <div className="file is-info">
              <label className="file-label">
                <input className="file-input" type="file" accept=".json" onChange={this.loadTemplate.bind(this)} />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload" />
                  </span>
                  <span className="file-label">
                    Load template
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        <br />

        <div className="columns">
          <ScreenContainer
            title="Communal Device"
            screens={communalScreens}
            numColumns={8}
            screenWidth={this.state.communalScreenWidth * 3 / 4}
            colRef={(el) => this.communalColumn = el}
            removeDevice={screenActions.removeDevice}
            splitRegion={screenActions.splitRegion}
            undoLastSplit={screenActions.undoLastSplit}
          />
          <ScreenContainer
            title="Personal Devices"
            screens={personalScreens}
            numColumns={4}
            screenWidth={this.state.personalScreenWidth * 3 / 8}
            colRef={(el) => this.personalColumn = el}
            removeDevice={screenActions.removeDevice}
            splitRegion={screenActions.splitRegion}
            undoLastSplit={screenActions.undoLastSplit}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ApplicationState): Partial<LayoutDesignerProps> {
  return {
    screens: state.screens,
  };
}

function mapDispatchToProps(dispatch: Dispatch<any>): Partial<LayoutDesignerProps> {
  return {
    screenActions: bindActionCreators(screenActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutDesigner);
