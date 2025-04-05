// Client-side fetch functions

import { fetchWithAuth } from "@/lib/fetchWithAuth";

export async function fetchAllRows(tableName: string) {
  const res = await fetchWithAuth(`/api/getAllRows?tableName=${tableName}`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export async function fetchPurchedSkins(docId: string) {
  const res = await fetchWithAuth(`/api/getPurchasedSkins?docId=${docId}`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function fetchDocumentData(tableName: string, docId: string) {
  const res = await fetchWithAuth(`/api/getDocumentData?tableName=${tableName}&docId=${docId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch document data');
  }
  return res.json();
}

export async function updateDocumentRequest(tableName: string, docId: string, updatedData: Record<string, any>) {
  const res = await fetchWithAuth(`/api/updateDocument`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tableName, docId, updatedData })
  });
  if (!res.ok) {
    throw new Error('Failed to update document');
  }
  return res.json();
}

export async function incrementFieldRequest(userId: string, field: string, amount: number) {
  const res = await fetchWithAuth(`/api/incrementField`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, field, amount })
  });
  if (!res.ok) {
    throw new Error('Failed to increment field');
  }
  return res.json();
}
