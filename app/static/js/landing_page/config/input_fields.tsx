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
import { Nullable } from "../../editor/util";

/**
 * Props for URLInputField
 */
interface URLInputFieldProps {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

/**
 * Renders an input field for a URL with the given label and an optional initial
 * value. Accepts a callback `onChange` which is invoked when the user updates
 * the field.
 *
 * @param label Label for the input field
 * @param onChange Callback invoked when the user changes the field
 * @param value Initial value for the input field. Optional
 */
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

/**
 * Props for TextInputField
 */
interface TextInputFieldProps {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

/**
 * Renders an input field for plain text with the given label and an optional
 * initial value. Accepts a callback `onChange` which is invoked when the user
 * updates the field.
 *
 * @param label Label for the input field
 * @param onChange Callback invoked when the user changes the field
 * @param value Initial value for the input field. Optional
 */
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

/**
 * Props for CheckboxInputField
 */
interface CheckboxInputFieldProps {
  label: string;
  value: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  description?: string;
}

/**
 * Renders an input field for a checkbox with the given label, an initial toggle
 * state for the checkbox and an optional description. Accepts a callback
 * `onChange` which is invoked when the user updates the field.
 *
 * @param label Label for the input field
 * @param onChange Callback invoked when the user changes the field
 * @param value Initial value for the checkbox, `true` or `false`
 * @param description Description of the checkbox option. Optional
 */
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

/**
 * Props for SelectInputField
 */
interface SelectInputFieldProps {
  label: string;
  options: Array<string>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
}

/**
 * Renders an input field for a dropdown with the given label, an optional
 * initial value for the selected item and list of options. Accepts a callback
 * `onChange` which is invoked when the user updates the field.
 *
 * @param label Label for the input field
 * @param onChange Callback invoked when the user changes the field
 * @param options List of options to be rendered in the dropdown
 * @param value Value to be selected by default. Optional
 */
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

/**
 * Props for FileInputField
 */
interface FileInputFieldProps {
  label: string;
  clear: boolean;
  onChange: (data: string) => void;
}

/**
 * Renders an input field for files with the given label and an option to clear
 * the input field on update. Accepts a callback `onChange` which is invoked
 * when the user updates the field.
 *
 * @param label Label for the input field
 * @param onChange Callback invoked when the user changes the field
 * @param clear Whether the input field should be clear on update
 */
export class FileInputField extends React.Component<FileInputFieldProps, {}> {
  private inputField: Nullable<HTMLInputElement>;

  /**
   * Gets files from the given event and tries to read them. Once the file is
   * read successfully, triggers the `onChange` callback.
   *
   * @param e The event triggered by the user
   */
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

  /**
   * Invoked whenever the component's props receive an update. Clears the input
   * field, provided the `clear` prop is set to true.
   *
   * @param newProps New props that were assigned to the component
   */
  public UNSAFE_componentWillReceiveProps(newProps: FileInputFieldProps) {
    // Clear input field if 'clear' prop is set
    if (newProps.clear && this.inputField) {
      this.inputField.value = "";
    }
  }

  /**
   * Renders the component
   */
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
