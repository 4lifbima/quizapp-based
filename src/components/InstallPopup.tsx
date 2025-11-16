import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();           // cegah default popup
      setDeferredPrompt(e);         // simpan event
      setShow(true);                // munculkan popup custom
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();        // munculkan popup bawaan browser
    const result = await deferredPrompt.userChoice;

    console.log("User choice:", result.outcome);

    setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      padding: "14px 16px",
      borderRadius: "10px",
      background: "white",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 999,
    }}>
      <p style={{ marginBottom: "8px" }}>Install aplikasi?</p>
      <button 
        onClick={installApp} 
        style={{
          padding: "6px 12px",
          marginRight: "10px",
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}>
        Install
      </button>

      <button 
        onClick={() => setShow(false)} 
        style={{
          padding: "6px 12px",
          background: "#ccc",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}>
        Tutup
      </button>
    </div>
  );
}

