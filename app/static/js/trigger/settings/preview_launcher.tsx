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
import * as QRCode from "qrcode";
import { Nullable, shortenUrl } from "../../editor/util";

/**
 * Props for PreviewLauncher
 */
interface PreviewLauncherProps {
  documentId: string;
}

/**
 * State for PreviewLauncher
 */
interface PreviewLauncherState {
  shortUrl: string;
}

/**
 * This component is responsible for rendering the elements necessary for the
 * various ways the preview launcher can be started. For one, directly through
 * the URL, through a QR code or through a shortened URL. The component needs
 * access to the current document ID to generate the preview URL.
 *
 * @param documentId The document ID for the current session
 */
class PreviewLauncher extends React.Component<PreviewLauncherProps, PreviewLauncherState> {
  private qrCanvas: Nullable<HTMLCanvasElement>;

  public constructor(props: PreviewLauncherProps) {
    super(props);

    this.state = {
      shortUrl: ""
    };
  }

  /**
   * Compiles the preview URL for the current host and document ID.
   *
   * @returns The preview URL for the current host
   */
  private getPreviewUrl(): string {
    // Compile preview URL
    return `${location.protocol}//${location.host}${(window as any).EDITOR_ROOT}/api/v1/document/${this.props.documentId}/preview`;
  }

  /**
   * Invoked after the component first mounts. Generates the preview URL,
   * creates a QR code and a short URL for it and updates the state accordingly.
   */
  public async componentDidMount() {
    const previewUrl = this.getPreviewUrl();

    // Render QR code for preview URL
    QRCode.toCanvas(this.qrCanvas, previewUrl, (err) => {
      if (err) {
        console.error(err);
      }
    });

    try {
      // Get short URL for preview
      const shortUrl = await shortenUrl(previewUrl);
      console.log("shortened preview url: ", shortUrl);

      this.setState({
        shortUrl
      });
    } catch (err) {
      console.error("could not get preview url:", err);
    }
  }

  /**
   * Renders the component
   */
  public render() {
    const previewUrl = this.getPreviewUrl();
    const { shortUrl } = this.state;

    // Render QR code, shorturl and normal URL for opening the preview
    return (
      <div style={{ marginTop: 10, paddingBottom: 10, borderBottom: "1px solid #DBDBDB" }}>
        <a
          style={{display: "block", margin: "0 auto 0 auto"}}
          className="button is-info"
          href={previewUrl}
          target="_blank"
        >
          Open preview in new tab
        </a>
        <p style={{margin: "10px auto"}}>
          Scan the QR Code below to open the preview on a mobile device:
        </p>
        <canvas
          style={{border: "1px #E2E2E2 solid", display: "block", margin: "0 auto 0 auto"}}
          ref={(el) => this.qrCanvas = el}
        />
        <p style={{margin: "10px auto"}}>
          Preview URL for external devices:
        </p>
        <div style={{textAlign: "center", fontSize: 18}}>
          {(shortUrl !== "") ? <a href={shortUrl}>{shortUrl}</a> : <i>Loading...</i>}
        </div>
      </div>
    );
  }
}

export default PreviewLauncher;
