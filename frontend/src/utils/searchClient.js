import axios from "axios";

const searchCache = new Map();
const inFlightRequests = new Map();

const CACHE_TTL_MS = 10 * 60 * 1000;

const ENDPOINTS = [
  "http://127.0.0.1:8000/search",
];

export async function executeSearch(queryText, options = {}) {
  const normalizedQuery = (queryText || "").trim().toLowerCase();

  const topK = options.top_k || 30;
  const notesTopK = options.notes_top_k ?? 8;
  const imageBase64 = options.image_base64 || "";

  const applyRerank = options.apply_rerank ?? false;

  const cacheKey = `${normalizedQuery}_${imageBase64}_${topK}_${notesTopK}_${applyRerank}`;

  // Return cached result
  const cached = searchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // If the exact same search is already running, reuse it
  const existingRequest = inFlightRequests.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const payload = {
    query_text: queryText,
    top_k: topK,
    notes_top_k: notesTopK,
    apply_rerank: options.apply_rerank ?? false,
  };

  if (imageBase64) {
    payload.image_base64 = imageBase64;
  }

  const request = axios
    .post("http://127.0.0.1:8000/search", payload, {
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      if (!response.data || !response.data.products) {
        throw new Error("Invalid search response from backend");
      }

      searchCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });

      return response.data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);

  return request;
}

export function prefetchSearch(queryText) {
  if (!queryText || typeof queryText !== "string") {
    return;
  }

  executeSearch(queryText, {
    prefetch: true,
  }).catch(() => {
    // Prefetch failures are intentionally ignored
  });
}