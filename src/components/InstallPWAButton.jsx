import { useState, useEffect } from 'react';

/*
  Bouton flottant "Installer l'application"
  - Android / Chrome / Edge : capte l'event beforeinstallprompt et déclenche l'install native
  - iOS Safari : affiche des instructions claires "Ajouter à l'écran d'accueil"
  - Se cache automatiquement si l'app est déjà installée (mode standalone)
*/
export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton]         = useState(false);
  const [showIosGuide, setShowIosGuide]     = useState(false);
  const [isIos, setIsIos]                   = useState(false);

  useEffect(() => {
    // Déjà installée (mode standalone) → ne rien afficher
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) return;

    // Détection iOS (iPhone/iPad Safari n'a pas beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIos(iosDevice);

    if (iosDevice) {
      // Sur iOS on affiche direct le bouton (ouvrira le guide au clic)
      setShowButton(true);
      return;
    }

    // Android / Desktop Chrome : écouter l'event natif
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Si l'utilisateur installe, cacher le bouton
    const installedHandler = () => {
      setShowButton(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowButton(false);
    }
    setDeferredPrompt(null);
  };

  if (!showButton) return null;

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #008fb5, #00a651)',
          color: 'white',
          border: 'none',
          borderRadius: 50,
          padding: '14px 22px',
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 8px 24px rgba(0,143,181,0.45)',
          animation: 'pulseInstall 2.4s ease-in-out infinite',
        }}
      >
        <span style={{ fontSize: 18 }}>📲</span>
        Installer l'app
      </button>

      <style>{`
        @keyframes pulseInstall {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(0,143,181,0.45); }
          50%      { transform: scale(1.05); box-shadow: 0 10px 30px rgba(0,143,181,0.6); }
        }
      `}</style>

      {/* Guide iOS */}
      {showIosGuide && (
        <div
          onClick={() => setShowIosGuide(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              width: '100%', maxWidth: 480,
              borderRadius: '20px 20px 0 0',
              padding: '24px 24px 32px',
              fontFamily: "'Inter', sans-serif",
              animation: 'slideUpIos 0.3s ease-out',
            }}
          >
            <style>{`
              @keyframes slideUpIos {
                from { transform: translateY(100%); }
                to   { transform: translateY(0); }
              }
            `}</style>

            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0', margin: '0 auto 20px' }} />

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0d1b2a', marginBottom: 16, textAlign: 'center' }}>
              📲 Installer PAIDE sur iPhone
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#008fb5',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, flexShrink: 0,
                }}>1</div>
                <p style={{ fontSize: 14, color: '#334155' }}>
                  Appuyez sur l'icône <strong>Partager</strong> <span style={{ fontSize: 18 }}>⬆️</span> en bas de Safari
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#008fb5',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, flexShrink: 0,
                }}>2</div>
                <p style={{ fontSize: 14, color: '#334155' }}>
                  Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong>
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', background: '#00a651',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, flexShrink: 0,
                }}>3</div>
                <p style={{ fontSize: 14, color: '#334155' }}>
                  Appuyez sur <strong>"Ajouter"</strong> — l'app apparaît sur votre écran d'accueil ✅
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              style={{
                marginTop: 24, width: '100%', padding: 14,
                background: '#f1f5f9', color: '#64748b', border: 'none',
                borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
