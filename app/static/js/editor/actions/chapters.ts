import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";

export type ADD_CHAPTER_BEFORE = PayloadAction<"ADD_CHAPTER_BEFORE", {accessPath: Array<number>}>;
function addChapterBefore(accessPath: Array<number>): ADD_CHAPTER_BEFORE {
  return {
    type: "ADD_CHAPTER_BEFORE",
    payload: {
      accessPath
    }
  };
}

export type ADD_CHAPTER_AFTER = PayloadAction<"ADD_CHAPTER_AFTER", {accessPath: Array<number>}>;
function addChapterAfter(accessPath: Array<number>): ADD_CHAPTER_AFTER {
  return {
    type: "ADD_CHAPTER_AFTER",
    payload: {
      accessPath
    }
  };
}

export type ADD_CHAPTER_CHILD = PayloadAction<"ADD_CHAPTER_CHILD", {accessPath: Array<number>}>;
function addChapterChild(accessPath: Array<number>): ADD_CHAPTER_CHILD {
  return {
    type: "ADD_CHAPTER_CHILD",
    payload: {
      accessPath
    }
  };
}

export type RENAME_CHAPTER = PayloadAction<"RENAME_CHAPTER", {accessPath: Array<number>, name: string}>;
function renameChapter(accessPath: Array<number>, name: string): RENAME_CHAPTER {
  return {
    type: "RENAME_CHAPTER",
    payload: {
      accessPath,
      name
    }
  };
}

export type REMOVE_CHAPTER = PayloadAction<"REMOVE_CHAPTER", {accessPath: Array<number>}>;
function removeChapter(accessPath: Array<number>): REMOVE_CHAPTER {
  return {
    type: "REMOVE_CHAPTER",
    payload: {
      accessPath
    }
  };
}

export type ASSIGN_MASTER = PayloadAction<"ASSIGN_MASTER", {accessPath: Array<number>, masterId: string}>;
function assignMaster(accessPath: Array<number>, masterId: string): ASSIGN_MASTER {
  return {
    type: "ASSIGN_MASTER",
    payload: {
      accessPath,
      masterId
    }
  };
}

export interface ChapterActions extends ActionCreatorsMapObject {
  addChapterAfter: (accessPath: Array<number>) => ADD_CHAPTER_AFTER;
  addChapterBefore: (accessPath: Array<number>) => ADD_CHAPTER_BEFORE;
  addChapterChild: (accessPath: Array<number>) => ADD_CHAPTER_CHILD;
  renameChapter: (accessPath: Array<number>, name: string) => RENAME_CHAPTER;
  removeChapter: (accessPath: Array<number>) => REMOVE_CHAPTER;
  assignMaster: (accessPath: Array<number>, masterId: string) => ASSIGN_MASTER;
}

export const actionCreators: ChapterActions = {
  addChapterBefore,
  addChapterAfter,
  addChapterChild,
  renameChapter,
  removeChapter,
  assignMaster
};
