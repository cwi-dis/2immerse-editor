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

export type ASSIGN_DOCUMENT_ID = PayloadAction<"ASSIGN_DOCUMENT_ID", {documentId: string, baseUrl: string}>;
/**
 * Creates an action for setting a new document, effectively starting a new
 * editing session. The action also takes a base URL which is prepended to all
 * relative URLs in the document such as preview image.
 *
 * @param documentId Document ID to set
 * @param baseUrl Base URL associated to the document
 */
function assignDocumentId(documentId: string, baseUrl: string): ASSIGN_DOCUMENT_ID {
  return {
    type: "ASSIGN_DOCUMENT_ID",
    payload: {
      documentId, baseUrl
    }
  };
}

export interface DocumentActions extends ActionCreatorsMapObject {
  assignDocumentId: (documentId: string, baseUrl: string) => ASSIGN_DOCUMENT_ID;
}

export const actionCreators: DocumentActions = {
  assignDocumentId
};
