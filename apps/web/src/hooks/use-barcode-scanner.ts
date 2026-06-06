import { useEffect, useRef } from 'react';

type Props = {
  onScan: (barcode: string) => void;
  latency?: number;
};

export function useBarcodeScanner({ onScan, latency = 50 }: Props) {
  const barcodeRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (unless it's specifically for searching, but global scan is better)
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const now = performance.now();
      
      // Reset if too much time passed between keystrokes (likely human typing, not a scanner)
      if (now - lastKeyTimeRef.current > latency) {
        barcodeRef.current = '';
      }

      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const barcode = barcodeRef.current;
        if (barcode.length > 2) {
          onScan(barcode);
        }
        barcodeRef.current = '';
        e.preventDefault();
        return;
      }

      // Append character if it's a valid printable character
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, latency]);
}
