import {
  useEffect,
} from 'react';

import {
  Html5QrcodeScanner,
} from 'html5-qrcode';

type Props = {
  open: boolean;

  onClose: () => void;

  onScan: (
    barcode: string,
  ) => void;
};

export default function BarcodeScannerModal({
  open,
  onClose,
  onScan,
}: Props) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const scanner =
      new Html5QrcodeScanner(
        'barcode-scanner',
        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 120,
          },
        },
        false,
      );

    scanner.render(
      (
        decodedText,
      ) => {
        onScan(
          decodedText,
        );

        scanner.clear();

        onClose();
      },

      (
        error,
      ) => {
        console.log(
          error,
        );
      },
    );

    return () => {
      scanner
        .clear()
        .catch(
          () => {},
        );
    };
  }, [
    open,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Scan Barcode
          </h2>

          <button
            onClick={
              onClose
            }
            className="text-red-500 text-xl"
          >
            ×
          </button>
        </div>

        <div
          id="barcode-scanner"
          className="rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
}