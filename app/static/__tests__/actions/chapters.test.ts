/// <reference types="jest" />

import * as actionTypes from "../../js/editor/actions/chapters";
import { actionCreators } from "../../js/editor/actions/chapters";

describe("Chapter actions", () => {
  it("should create an ADD_CHAPTER_BEFORE action", () => {
    const expected: actionTypes.ADD_CHAPTER_BEFORE = {
      type: "ADD_CHAPTER_BEFORE",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterBefore([0, 1, 0])).toEqual(expected);
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

  it("should create an ADD_CHAPTER_CHILD action", () => {
    const expected: actionTypes.ADD_CHAPTER_CHILD = {
      type: "ADD_CHAPTER_CHILD",
      payload: {
        accessPath: [0, 1, 0]
      }
    };

    expect(actionCreators.addChapterChild([0, 1, 0])).toEqual(expected);
  });

  it("should create an ASSIGN_MASTER action", () => {
    const expected: actionTypes.ASSIGN_MASTER = {
      type: "ASSIGN_MASTER",
      payload: {
        accessPath: [0, 1, 0],
        masterId: "masterID1"
      }
    };

    expect(actionCreators.assignMaster([0, 1, 0], "masterID1")).toEqual(expected);
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
