import { ActionCreatorsMapObject } from "redux";
import { PayloadAction } from "../util";

export type ASSIGN_DOCUMENT_ID = PayloadAction<"ASSIGN_DOCUMENT_ID", {documentId: string}>;
function assignDocumentId(documentId: string): ASSIGN_DOCUMENT_ID {
  return {
    type: "ASSIGN_DOCUMENT_ID",
    payload: {
      documentId
    }
  };
}

export interface DocumentActions extends ActionCreatorsMapObject {
  assignDocumentId: (documentId: string) => ASSIGN_DOCUMENT_ID;
}

export const actionCreators: DocumentActions = {
  assignDocumentId
};
