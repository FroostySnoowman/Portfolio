import { useEffect, useState } from "react";

const cache = new Map<string, Promise<unknown>>();

export function useJson<T>(url: string): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let alive = true;
    let request = cache.get(url);
    if (!request) {
      request = fetch(url).then((res) => {
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        return res.json();
      });
      cache.set(url, request);
    }
    request.then((value) => alive && setData(value as T)).catch(() => cache.delete(url));
    return () => {
      alive = false;
    };
  }, [url]);
  return data;
}
