import React, { useState } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  Share2,
  PlusSquare,
  Monitor,
  Smartphone,
  HardDrive,
  Zap,
  ShieldCheck,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'auto' | 'ios' | 'desktop' | 'android'>(
    isIOS ? 'ios' : 'auto'
  );
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const result = await install();
      if (result === 'accepted') {
        setInstalledSuccess(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-emerald-500 shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Installer ZPL Studio (PWA)
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Application Web Progressive autonome & hors-ligne
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Banner */}
          {isInstalled || installedSuccess ? (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs">Application déjà installée !</p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  ZPL Studio fonctionne en mode autonome (standalone). Vous pouvez la lancer depuis votre bureau, dock ou écran d'accueil.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-xs">Installation en 1 clic disponible</p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                    Votre navigateur supporte l'installation directe.
                  </p>
                </div>
                <button
                  id="pwa-modal-install-now-btn"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition shrink-0 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer maintenant
                </button>
              </div>
            </div>
          ) : null}

          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">100% Hors-ligne</span>
                <span className="text-zinc-500 dark:text-zinc-400">Aucun serveur requis pour concevoir et exporter.</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex items-start gap-2">
              <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Stockage Local</span>
                <span className="text-zinc-500 dark:text-zinc-400">Vos étiquettes restent stockées en toute sécurité sur votre appareil.</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex items-start gap-2">
              <Monitor className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Plein Écran</span>
                <span className="text-zinc-500 dark:text-zinc-400">Fenêtre dédiée sans barre d'adresse encombrante.</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">Mises à Jour</span>
                <span className="text-zinc-500 dark:text-zinc-400">Mise à jour automatique en arrière-plan dès disponibilité.</span>
              </div>
            </div>
          </div>

          {/* Installation Instructions by Platform */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>Instructions par plateforme</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    activeTab === 'desktop'
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  Bureau (PC/Mac)
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    activeTab === 'ios'
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  iOS (iPhone/iPad)
                </button>
                <button
                  onClick={() => setActiveTab('android')}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    activeTab === 'android'
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }`}
                >
                  Android
                </button>
              </div>
            </h3>

            {/* Desktop tab */}
            {activeTab === 'desktop' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Sur <strong>Chrome / Edge / Brave</strong>, cliquez sur l'icône d'installation dans la barre d'adresse tout à droite (icône ordinateur avec flèche vers le bas).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Ou ouvrez le menu du navigateur (<strong>⋮</strong>) &gt; <strong>Enregistrer et partager</strong> &gt; <strong>Installer ZPL Studio</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* iOS tab */}
            {activeTab === 'ios' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    1. Dans <strong>Safari</strong> sur votre iPhone/iPad, touchez l'icône <strong>Partager</strong> en bas de l'écran.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <PlusSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    2. Faites défiler vers le bas et touchez <strong>Sur l'écran d'accueil</strong> (Add to Home Screen).
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>
                    3. Touchez <strong>Ajouter</strong> en haut à droite. L'application ZPL Studio apparaîtra avec son icône Zebra !
                  </span>
                </div>
              </div>
            )}

            {/* Android tab */}
            {activeTab === 'android' && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Dans <strong>Chrome</strong> sur Android, touchez le menu à trois points (<strong>⋮</strong>) en haut à droite.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Sélectionnez <strong>Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            <span>Service Worker actif</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
