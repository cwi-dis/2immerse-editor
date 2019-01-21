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

import * as actionTypes from "../../js/editor/actions/chapters";
import { actionCreators } from "../../js/editor/actions/chapters";

describe("Chapter actions", () => {
  it("should create a LOAD_CHAPTER_TREE action", () => {
    const tree = {
      id: "root",
      name: "Root Chapter",
      tracks: [],
      chapters: [
        { id: "child1", name: "Child 1", tracks: [], chapters: []},
        { id: "child2", name: "Child 2", tracks: [], chapters: []}
      ]
    };

    const expected: actionTypes.LOAD_CHAPTER_TREE = {
      type: "LOAD_CHAPTER_TREE",
      payload: {
        tree
      }
    };

    expect(actionCreators.loadChapterTree(tree)).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_BEFORE action", () => {
    const expected: actionTypes.ADD_CHAPTER_BEFORE = {
      type: "ADD_CHAPTER_BEFORE",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterBefore([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_BEFORE action with predefined ID", () => {
    const expected: actionTypes.ADD_CHAPTER_BEFORE = {
      type: "ADD_CHAPTER_BEFORE",
      payload: {
        accessPath: [0, 1, 0],
        id: "chapter1"
      }
    };

    expect(actionCreators.addChapterBefore([0, 1, 0], "chapter1")).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_AFTER action", () => {
    const expected: actionTypes.ADD_CHAPTER_AFTER = {
      type: "ADD_CHAPTER_AFTER",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterAfter([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_AFTER action with predefined ID", () => {
    const expected: actionTypes.ADD_CHAPTER_AFTER = {
      type: "ADD_CHAPTER_AFTER",
      payload: {
        accessPath: [0, 1, 0],
        id: "chapter1"
      }
    };

    expect(actionCreators.addChapterAfter([0, 1, 0], "chapter1")).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_CHILD action", () => {
    const expected: actionTypes.ADD_CHAPTER_CHILD = {
      type: "ADD_CHAPTER_CHILD",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterChild([0, 1, 0])).toEqual(expected);
  });

  it("should create an ADD_CHAPTER_CHILD action with predefined ID", () => {
    const expected: actionTypes.ADD_CHAPTER_CHILD = {
      type: "ADD_CHAPTER_CHILD",
      payload: {
        accessPath: [0, 1, 0],
        id: "chapter1"
      }
    };

    expect(actionCreators.addChapterChild([0, 1, 0], "chapter1")).toEqual(expected);
  });

  it("should create an REMOVE_CHAPTER action", () => {
    const expected: actionTypes.REMOVE_CHAPTER = {
      type: "REMOVE_CHAPTER",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.removeChapter([0, 1, 0])).toEqual(expected);
  });

  it("should create an RENAME_CHAPTER action", () => {
    const expected: actionTypes.RENAME_CHAPTER = {
      type: "RENAME_CHAPTER",
      payload: {
        accessPath: [0, 1, 0],
        name: "new chapter name"
      }
    };

    expect(actionCreators.renameChapter([0, 1, 0], "new chapter name")).toEqual(expected);
  });
});
