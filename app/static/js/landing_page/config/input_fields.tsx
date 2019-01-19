import * as React from "react";
import { Nullable } from "../../editor/util";

interface URLInputFieldProps {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export const URLInputField: React.SFC<URLInputFieldProps> = (props) => {
  // Render field for inputting a URL
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <input className="input" type="url" value={props.value} onChange={props.onChange.bind(this)} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface TextInputFieldProps {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export const TextInputField: React.SFC<TextInputFieldProps> = (props) => {
  // Render field for inputting plain text
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <input className="input" type="text" value={props.value} onChange={props.onChange.bind(this)} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface CheckboxInputFieldProps {
  label: string;
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}

export const CheckboxInputField: React.SFC<CheckboxInputFieldProps> = (props) => {
  // Render field for a checkbox
  return (
    <div className="field is-horizontal">
      <div className="field-label">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field">
          <div className="control">
            <label className="checkbox">
              <input type="checkbox" checked={props.value} onChange={props.onChange} />
              &emsp;&emsp;{props.description}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SelectInputFieldProps {
  label: string;
  options: Array<string>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
}

export const SelectInputField: React.SFC<SelectInputFieldProps> = (props) => {
  // Render field for a dropdown
  return (
    <div className="field is-horizontal">
      <div className="field-label is-normal">
        <label className="label">{props.label}</label>
      </div>
      <div className="field-body">
        <div className="field is-narrow">
          <div className="control">
            <div className="select is-fullwidth">
              <select value={props.value} onChange={props.onChange}>
                {props.options.map((option, i) => {
                  return (<option key={i}>{option}</option>);
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FileInputFieldProps {
  label: string;
  clear: boolean;
  onChange: (data: string) => void;
}

export class FileInputField extends React.Component<FileInputFieldProps, {}> {
  private inputField: Nullable<HTMLInputElement>;

  private readSelectedFile(e: React.ChangeEvent<HTMLInputElement>) {
    // Check if the event contains any files
    if (e.target.files) {
      // Get first file and init readt
      const file = e.target.files.item(0)!;
      const reader = new FileReader();

      // Invoke callback once file is fully read
      reader.onloadend = () => {
        this.props.onChange((reader.result || "").toString());
      };

      // Start reading file
      reader.readAsBinaryString(file);
    }
  }

  public componentWillReceiveProps(newProps: FileInputFieldProps) {
    // Clear input field if 'clear' prop is set
    if (newProps.clear && this.inputField) {
      this.inputField.value = "";
    }
  }

  public render() {
    // Render file input field
    return (
      <div className="field is-horizontal">
        <div className="field-label is-normal">
          <label className="label">{this.props.label}</label>
        </div>
        <div className="field-body">
          <div className="field">
            <div className="control">
              <input className="input" type="file" ref={(e) => this.inputField = e} onChange={this.readSelectedFile.bind(this)} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
