import { useCallback, useState } from "react";

/** Copies text to the clipboard and exposes a `copied` flag that resets after 1.5s. */
export function useCopyToClipboard(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  return [copied, copy];
}
