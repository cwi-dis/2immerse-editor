import * as React from "react";
import * as QRCode from "qrcode";
import { Nullable, shortenUrl } from "../../editor/util";

interface PreviewLauncherProps {
  documentId: string;
  optionClicked: () => void;
}

interface PreviewLauncherState {
  shortUrl: string;
}

class PreviewLauncher extends React.Component<PreviewLauncherProps, PreviewLauncherState> {
  private qrCanvas: Nullable<HTMLCanvasElement>;

  public constructor(props: PreviewLauncherProps) {
    super(props);

    this.state = {
      shortUrl: ""
    };
  }

  private getPreviewUrl(): string {
    return `${location.protocol}//${location.host}/api/v1/document/${this.props.documentId}/preview`;
  }

  public componentDidMount() {
    const previewUrl = this.getPreviewUrl();

    QRCode.toCanvas(this.qrCanvas, previewUrl, (err) => {
      if (err) {
        console.error(err);
      }
    });

    shortenUrl(previewUrl).then((shortUrl) => {
      console.log("shortened preview url: ", shortUrl);

      this.setState({
        shortUrl
      });
    }).catch((err) => {
      console.error("could not get preview url:", err);
    });
  }

  public render() {
    const previewUrl = this.getPreviewUrl();
    const { shortUrl } = this.state;

    return (
      <div className="box">
        Scan the QR Code below to open the preview on a mobile device:
        <br/><br/>
        <canvas style={{border: "1px #E2E2E2 solid", display: "block", margin: "0 auto 0 auto"}}
                ref={(el) => this.qrCanvas = el}>
        </canvas>
        <br/>
        Click the button below to open the preview in your browser:
        <br/><br/>
        <a style={{display: "block", margin: "0 auto 0 auto"}}
           className="button is-info" href={previewUrl}
           target="_blank"
           onClick={this.props.optionClicked.bind(this)}>
          Open preview in new tab
        </a>
        <br/>
        Preview URL for external devices:
        <br/><br/>
        <div style={{textAlign: "center", fontSize: 20}}>
          {(shortUrl !== "") ? <a href={shortUrl}>{shortUrl}</a> : <i>Loading...</i>}
        </div>
      </div>
    );
  }
}

export default PreviewLauncher;
