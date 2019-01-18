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
