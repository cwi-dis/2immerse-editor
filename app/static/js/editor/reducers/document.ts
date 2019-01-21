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

import { ActionHandler } from "../action_handler";
import * as actions from "../actions/document";

export interface DocumentState {
  documentId: string;
  baseUrl: string;
}

export const initialState: DocumentState = {
  documentId: "",
  baseUrl: ""
};

const actionHandler = new ActionHandler<DocumentState>(initialState);

actionHandler.addHandler("ASSIGN_DOCUMENT_ID", (state, action: actions.ASSIGN_DOCUMENT_ID) => {
  const { documentId, baseUrl } = action.payload;

  // Update documentId and baseUrl in document state
  return {
    ...state,
    documentId, baseUrl
  };
});

export default actionHandler.getReducer();
