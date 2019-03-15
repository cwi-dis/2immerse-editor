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
import { bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";

import { ApplicationState } from "../../store";
import { ScreenState } from "../../reducers/screens";
import { actionCreators as screenActionCreators, ScreenActions } from "../../actions/screens";
import ScreenContainer from "./screen_container";
import { validateLayout } from "../../util";

/**
 * Region in a template as it is found in a layout document.
 */
interface TemplateRegion {
  region: {
    id: string,
    position: { x: number, y: number },
    size: { width: number, height: number }
  };
}

/**
 * Layouts as they are defined in a standard layout document
 */
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

/**
 * Props defining action creators used in the component.
 */
interface LayoutDesignerActionProps {
  screenActions: ScreenActions;
}

/**
 * Props defining parts of the application state used in the component.
 */
interface LayoutDesignerConnectedProps {
  screens: ScreenState;
}

type LayoutDesignerProps = LayoutDesignerActionProps & LayoutDesignerConnectedProps;

/**
 * State for LayoutDesigner
 */
interface LayoutDesignerState {
  personalScreenWidth: number;
  communalScreenWidth: number;
}

/**
 * TimelineEditor is a Redux-connected component responsible for rendering and
 * manipulating preview screens. The user can add personal or communal preview
 * devices and design layouts by splitting screen regions horizontally or
 * vertically. For more complex layouts, the components has the option to upload
 * existing layouts and parse them. It receives all its props via the Redux
 * state tree.
 */
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

  /**
   * Parses a data structure containing screen regions obtained from a valid
   * layout document and creates preview devices for it containing the
   * specified regions. The function also requires the name and type of preview
   * device to be passed in.
   *
   * @param regions A data structure containing template regions retrieved from a layout document
   * @param name The name for the preview device
   * @param type The type of preview device. One of `personal` or `communal`
   */
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

  /**
   * Parses a list of layout templates and creates the necessary preview screens
   * and regions in the Redux state tree.
   *
   * @param templates A list of layout templates
   */
  private parseLayoutTemplates(templates: Array<LayoutTemplate>): void {
    // Parse regions for all templates
    templates.forEach((template) => {
      const { communal, personal } = template.layout;

      this.parseTemplateRegions(communal, template.deviceType, "communal");
      this.parseTemplateRegions(personal, template.deviceType, "personal");
    });
  }

  /**
   * Retrieves a layout file from the event that is passed, reads it, validates
   * the loaded file against a schema and attempts to parse the file and
   * allocate preview screens and regions for it. If any step along the way
   * fails, an error message is shown.
   *
   * @param e Event fired in response to a file upload
   */
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

  /**
   * Invoked after the component has mounted. Sets the preview screen width
   * based on the actual width of the divs containing the screens in the DOM.
   */
  public componentDidMount() {
    this.setState({
      personalScreenWidth: this.personalColumn.clientWidth,
      communalScreenWidth: this.communalColumn.clientWidth
    });
  }

  /**
   * Renders the component.
   */
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

/**
 * Maps application state to component props.
 *
 * @param state Application state
 */
function mapStateToProps(state: ApplicationState): LayoutDesignerConnectedProps {
  return {
    screens: state.screens,
  };
}

/**
 * Wraps action creators with the dispatch function and maps them to props.
 *
 * @param dispatch Dispatch function for the configured store
 */
function mapDispatchToProps(dispatch: Dispatch<any>): LayoutDesignerActionProps {
  return {
    screenActions: bindActionCreators(screenActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LayoutDesigner);
