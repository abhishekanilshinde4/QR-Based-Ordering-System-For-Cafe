import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableScanned: (tableNum: number) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onTableScanned
}) => {
  const [scannedMessage, setScannedMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      setScannedMessage(null);
      setErrorMessage(null);
      return;
    }

    if (activeTab === 'camera') {
      const timeout = setTimeout(() => {
        try {
          const scanner = new Html5QrcodeScanner(
            'qr-reader-container',
            {
              fps: 10,
              qrbox: { width: 220, height: 220 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true
            },
            /* verbose= */ false
          );

          scanner.render(
            (decodedText) => {
              handleDecodedText(decodedText);
            },
            (error) => {
              // Ignore standard frame scan failure
            }
          );

          scannerRef.current = scanner;
        } catch (e: any) {
          console.warn('Camera init notice:', e);
          setErrorMessage('Could not access camera. Please check camera permissions or upload a QR image.');
        }
      }, 200);

      return () => {
        clearTimeout(timeout);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
          scannerRef.current = null;
        }
      };
    }
  }, [isOpen, activeTab]);

  const handleDecodedText = (decodedText: string) => {
    console.log('[QR Scanned text]:', decodedText);

    // Extract table number from URL like /menu?table=3 or query string table=3 or plain integer
    let tableNum: number | null = null;

    try {
      if (decodedText.includes('table=')) {
        const urlObj = new URL(decodedText, window.location.origin);
        const param = urlObj.searchParams.get('table');
        if (param) tableNum = parseInt(param, 10);
      } else if (!isNaN(parseInt(decodedText, 10))) {
        tableNum = parseInt(decodedText, 10);
      }
    } catch {
      // Regexp match table=(\d+)
      const match = decodedText.match(/table=(\d+)/i);
      if (match && match[1]) {
        tableNum = parseInt(match[1], 10);
      }
    }

    if (tableNum && !isNaN(tableNum) && tableNum > 0) {
      setScannedMessage(`Table ${tableNum} Detected!`);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
      setTimeout(() => {
        onTableScanned(tableNum!);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(`Scanned: "${decodedText}". Valid table QR code not recognized.`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const html5QrCode = new Html5Qrcode('qr-file-reader-temp');

    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleDecodedText(decodedText);
    } catch (err: any) {
      console.warn('File scan notice:', err);
      setErrorMessage('No valid QR code found in this image. Try another image.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-amber-200/60 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                Scan Table QR Code
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Point camera at table card or upload QR code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[260px] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 relative overflow-hidden">
          
          {scannedMessage ? (
            <div className="flex flex-col items-center space-y-2 text-emerald-600 dark:text-emerald-400 py-8 animate-bounce">
              <CheckCircle2 className="w-14 h-14" />
              <p className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-100">
                {scannedMessage}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading digital menu...</p>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="w-full">
              <div id="qr-reader-container" className="w-full overflow-hidden rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-3 p-6 w-full">
              <div className="p-4 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Select a Table QR Code Image
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Supports PNG, JPG, or screenshot of QR
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 shadow-sm transition-colors"
              >
                Choose QR Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div id="qr-file-reader-temp" className="hidden" />
            </div>
          )}

          {errorMessage && (
            <div className="w-full mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Quick Table Buttons Fallback */}
        <div className="pt-2">
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium text-center mb-2">
            Or quick select table number:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => {
                  onTableScanned(n);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-100/60 dark:bg-zinc-800 hover:bg-amber-600 hover:text-white text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all"
              >
                Table {n}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
