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

/// <reference types="jest" />

import * as React from "react";
import { mount } from "enzyme";
import { stub } from "sinon";

import * as util from "../../js/editor/util";
import CurrentVersion, { CurrentVersionProps, CurrentVersionState } from "../../js/editor/components/current_version";

describe("Component <CurrentVersion/>", () => {
  it("should render a commit hash", async () => {
    const promise = Promise.resolve(JSON.stringify(["some_branch", "some_commit_hash"]));
    const stubbedFn = stub(util, "makeRequest").returns(promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(<CurrentVersion />);
    expect.assertions(5);

    await promise;

    expect(currentVersion.props().commitUrl).toEqual("https://github.com/2-IMMERSE/editor/commit/");
    expect(currentVersion.state().branch).toEqual("some_branch");
    expect(currentVersion.state().revision).toEqual("some_commit_hash");
    expect(currentVersion.state().fetchError).toBeFalsy();

    currentVersion.update();

    expect(
      currentVersion.render().find("a").first().prop("href")
    ).toEqual(
      "https://github.com/2-IMMERSE/editor/commit/some_commit_hash"
    );

    stubbedFn.restore();
  });

  it("should render an empty component if request to /version fails", async () => {
    const promise = Promise.reject("error");
    const stubbedFn = stub(util, "makeRequest").returns(promise);

    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(<CurrentVersion />);
    expect.assertions(4);

    try {
      await promise;
    } catch {
      stubbedFn.restore();

      expect(currentVersion.isEmptyRender()).toBeTruthy();
      expect(currentVersion.state().branch).toEqual("");
      expect(currentVersion.state().revision).toEqual("");
      expect(currentVersion.state().fetchError).toBeTruthy();
    }
  });

  it("should take the commit URL as a prop", async () => {
    const currentVersion = mount<CurrentVersionProps, CurrentVersionState>(
      <CurrentVersion commitUrl="http://my-commit-url.com/" />
    );
    expect.assertions(5);

    currentVersion.setState({
      branch: "some_other_branch",
      revision: "some_other_commit_hash"
    });

    expect(currentVersion.props().commitUrl).toEqual("http://my-commit-url.com/");
    expect(currentVersion.state().branch).toEqual("some_other_branch");
    expect(currentVersion.state().revision).toEqual("some_other_commit_hash");
    expect(currentVersion.state().fetchError).toBeFalsy();

    expect(
      currentVersion.render().find("a").first().prop("href")
    ).toEqual(
      "http://my-commit-url.com/some_other_commit_hash"
    );
  });
});
