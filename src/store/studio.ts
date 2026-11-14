import type { StudioDocument } from "../lib/studio.ts";
import {
  deleteLibraryProject,
  listStudioDocuments,
  readStudioDocument,
  saveStudioDocument,
} from "./library.ts";

export async function listDocuments(): Promise<StudioDocument[]> {
  return listStudioDocuments();
}

export async function readDocument(id: string): Promise<StudioDocument | undefined> {
  return readStudioDocument(id);
}

export async function saveDocument(document: StudioDocument): Promise<void> {
  return saveStudioDocument(document);
}

export async function deleteDocument(id: string): Promise<void> {
  return deleteLibraryProject(id, "leaderboard").then(async () => {
    // Brackets share the same document API; delete only that type if it was not a leaderboard.
    await deleteLibraryProject(id, "bracket");
  });
}
