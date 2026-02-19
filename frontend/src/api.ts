const API_URL = "http://localhost:3000/api";

export interface Card {
  id: number;
  name: string;
  last4: string;
  status: "ACTIVE" | "FROZEN" | "TERMINATED";
  limitAmount: number;
  spentAmount: number;
  createdAt: string;
}

export interface Transaction {
  id: number;
  cardId: number;
  merchantName: string;
  amount: number;
  date: string;
  status: "PENDING" | "COMPLETED" | "DECLINED";
  receiptUrl?: string;
}

export async function fetchCards(): Promise<Card[]> {
  const response = await fetch(`${API_URL}/cards`);
  if (!response.ok) throw new Error("Failed to fetch cards");
  return response.json();
}

export async function createCard(
  name: string,
  limitAmount: number,
): Promise<Card> {
  const response = await fetch(`${API_URL}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, limitAmount }),
  });
  if (!response.ok) throw new Error("Failed to create card");
  return response.json();
}

export async function updateCardStatus(
  id: number,
  status: "ACTIVE" | "FROZEN" | "TERMINATED",
): Promise<Card> {
  const response = await fetch(`${API_URL}/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update card status");
  return response.json();
}

export async function fetchTransactions(
  cardId?: number,
): Promise<Transaction[]> {
  const url = cardId
    ? `${API_URL}/transactions?cardId=${cardId}`
    : `${API_URL}/transactions`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
}

export async function seedDatabase() {
  await fetch(`${API_URL}/seed`, { method: "POST" });
}

// ===== File Download API =====

export interface FileInfo {
  filename: string;
  size: number;
  hash: string;
  createdAt?: string;
}

export async function generateFile(
  sizeMB: number = 100,
  filename?: string,
): Promise<FileInfo & { message: string }> {
  const response = await fetch(`${API_URL}/files/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sizeMB, filename }),
  });
  if (!response.ok) throw new Error("Failed to generate file");
  return response.json();
}

export async function getFileInfo(filename: string): Promise<FileInfo> {
  const response = await fetch(`${API_URL}/files/${filename}/info`);
  if (!response.ok) throw new Error("Failed to get file info");
  return response.json();
}

export async function listFiles(): Promise<FileInfo[]> {
  const response = await fetch(`${API_URL}/files`);
  if (!response.ok) throw new Error("Failed to list files");
  return response.json();
}

export async function downloadFileChunk(
  filename: string,
  start: number,
  end: number,
): Promise<{ data: ArrayBuffer; contentRange: string | null }> {
  const response = await fetch(`${API_URL}/files/${filename}`, {
    headers: { Range: `bytes=${start}-${end}` },
  });
  if (response.status !== 206 && response.status !== 200) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  const data = await response.arrayBuffer();
  const contentRange = response.headers.get("Content-Range");
  return { data, contentRange };
}
