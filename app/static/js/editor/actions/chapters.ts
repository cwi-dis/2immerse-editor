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

import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";
import { ChapterTree } from "../api_types";

export type LOAD_CHAPTER_TREE = PayloadAction<"LOAD_CHAPTER_TREE", { tree: ChapterTree }>;
/**
 * Creates an action for loading and parsing an entire hierarchical chapter
 * structure received from the API.
 *
 * @param tree A tree-like data structure for chapters obtained from the API
 */
function loadChapterTree(tree: ChapterTree): LOAD_CHAPTER_TREE {
  return {
    type: "LOAD_CHAPTER_TREE",
    payload: {
      tree
    }
  };
}

export type ADD_CHAPTER_BEFORE = PayloadAction<"ADD_CHAPTER_BEFORE", {accessPath: Array<number>, id?: string}>;
/**
 * Creates an action for creating a new chapter before the chapter given by the
 * access path.
 *
 * @param accessPath Access path of the chapter before which the new chapter shall be created
 * @param id ID of the new chapter. Optional
 */
function addChapterBefore(accessPath: Array<number>, id?: string): ADD_CHAPTER_BEFORE {
  return {
    type: "ADD_CHAPTER_BEFORE",
    payload: {
      accessPath, id
    }
  };
}

export type ADD_CHAPTER_AFTER = PayloadAction<"ADD_CHAPTER_AFTER", {accessPath: Array<number>, id?: string}>;
/**
 * Creates an action for creating a new chapter after the chapter given by the
 * access path.
 *
 * @param accessPath Access path of the chapter after which the new chapter shall be created
 * @param id ID of the new chapter. Optional
 */
function addChapterAfter(accessPath: Array<number>, id?: string): ADD_CHAPTER_AFTER {
  return {
    type: "ADD_CHAPTER_AFTER",
    payload: {
      accessPath, id
    }
  };
}

export type ADD_CHAPTER_CHILD = PayloadAction<"ADD_CHAPTER_CHILD", {accessPath: Array<number>, id?: string}>;
/**
 * Creates an action for creating a new chapter as a child of the chapter given
 * by the access path.
 *
 * @param accessPath Access path of the chapter under which the new chapter shall be created
 * @param id ID of the new chapter. Optional
 */
function addChapterChild(accessPath: Array<number>, id?: string): ADD_CHAPTER_CHILD {
  return {
    type: "ADD_CHAPTER_CHILD",
    payload: {
      accessPath, id
    }
  };
}

export type RENAME_CHAPTER = PayloadAction<"RENAME_CHAPTER", {accessPath: Array<number>, name: string}>;
/**
 * Creates an action for renaming the chapter given by the access path.
 *
 * @param accessPath Access path of the chapter to be renamed
 * @param name The new name of the chapter
 */
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
/**
 * Creates an action for deleting the chapter given by the access path.
 *
 * @param accessPath Access path of the chapter to be deleted
 */
function removeChapter(accessPath: Array<number>): REMOVE_CHAPTER {
  return {
    type: "REMOVE_CHAPTER",
    payload: {
      accessPath
    }
  };
}

export interface ChapterActions extends ActionCreatorsMapObject {
  loadChapterTree: (tree: ChapterTree) => LOAD_CHAPTER_TREE;
  addChapterAfter: (accessPath: Array<number>, id?: string) => ADD_CHAPTER_AFTER;
  addChapterBefore: (accessPath: Array<number>, id?: string) => ADD_CHAPTER_BEFORE;
  addChapterChild: (accessPath: Array<number>, id?: string) => ADD_CHAPTER_CHILD;
  renameChapter: (accessPath: Array<number>, name: string) => RENAME_CHAPTER;
  removeChapter: (accessPath: Array<number>) => REMOVE_CHAPTER;
}

export const actionCreators: ChapterActions = {
  loadChapterTree,
  addChapterAfter,
  addChapterBefore,
  addChapterChild,
  renameChapter,
  removeChapter
};
