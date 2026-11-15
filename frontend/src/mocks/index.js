// Mock API entry point used by apiFetch() (src/lib/api-client.ts) while VITE_USE_MOCKS != 'false'.
// Returns a real `Response` for routes the prototype backend had, or null to let the request go
// to the real API. See docs/frontend-migration.md.
import { actorsFor, handleApi, handleTechnician } from './legacy-server';

/** Small delay so loading states render the way they did against the prototype backend. */
const LATENCY_MS = 120;

const respond = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'x-mock-api': 'legacy' },
  });

export async function mockFetch(path, init = {}, currentUser) {
  const actors = actorsFor(currentUser);
  if (!actors) return null; // not signed in: let the real API answer (401)

  const url = new URL(path, 'http://mock.local');
  const method = String(init.method || 'GET').toUpperCase();

  let body = {};
  if (typeof init.body === 'string' && init.body) {
    try {
      body = JSON.parse(init.body);
    } catch {
      return respond(400, { message: 'JSON không hợp lệ' });
    }
  }

  const request = {
    method,
    pathname: url.pathname,
    searchParams: url.searchParams,
    body,
    user: actors.user,
    technician: actors.technician,
  };
  const result = handleTechnician(request) ?? handleApi(request);
  if (!result) return null;

  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return respond(result.status, result.body);
}
