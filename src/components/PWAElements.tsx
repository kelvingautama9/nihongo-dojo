import React, { useState } from 'react';
import { Download, WifiOff, Check } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#5C554E] py-1.5">
        <Check className="w-3.5 h-3.5 text-[#1E3A2F] shrink-0" />
        <span className="whitespace-nowrap">Aplikasi Terinstal (Siap Offline)</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-[#2C2825] bg-[#EAE3D5] hover:bg-[#DFD6C5] border border-[#D5CBB8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{isIOS ? 'Instal di iOS (Offline)' : 'Instal Aplikasi (Offline)'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-[#FBF9F5] border border-[#E2DCD0] p-6 shadow-lg">
            <h3 className="text-base font-semibold text-[#2C2825]">
              Simpan Nihongo Dojo untuk Belajar Offline
            </h3>
            <p className="mt-2 text-sm text-[#5C554E] leading-relaxed">
              Aplikasi ini telah dilengkapi penyimpanan Service Worker otomatis. Seluruh bank soal, tabel Kana, dan audio tetap berfungsi tanpa koneksi internet.
            </p>
            <div className="mt-4 p-3.5 rounded-lg bg-[#F4EFE6] border border-[#E2DCD0] text-xs text-[#2C2825] space-y-1.5">
              {isIOS ? (
                <>
                  <p>1. Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.</p>
                  <p>2. Pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</p>
                </>
              ) : (
                <>
                  <p>1. Buka menu browser (ikon tiga titik di kanan atas atau ikon instal di bilah alamat).</p>
                  <p>2. Pilih <strong>Instal Aplikasi (Install App)</strong> atau <strong>Tambahkan ke Layar Utama</strong>.</p>
                </>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#FBF9F5] bg-[#1E3A2F] hover:bg-[#152A22] rounded-lg transition-colors cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineStatusBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#2C2825] text-[#FBF9F5] px-3.5 py-2 text-xs font-medium shadow-md border border-[#5C554E]">
      <WifiOff className="w-3.5 h-3.5 text-[#E8C574] shrink-0" />
      <span>Mode Offline Aktif · Seluruh modul dan bank soal berjalan dari memori lokal</span>
    </div>
  );
};
