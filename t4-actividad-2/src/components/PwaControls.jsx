import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Alert, Button, Snackbar } from '@mui/material';
import { DownloadOutlined } from '@mui/icons-material';
export default function PwaControls() {
  const [prompt, setPrompt] = useState(null); const [help, setHelp] = useState(false);
  const { needRefresh: [refresh, setRefresh], offlineReady: [ready, setReady], updateServiceWorker } = useRegisterSW();
  useEffect(() => { const handler = e => { e.preventDefault(); setPrompt(e); }; const done = () => setPrompt(null); window.addEventListener('beforeinstallprompt', handler); window.addEventListener('appinstalled', done); return () => { window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', done); }; }, []);
  const install = async () => { if (!prompt) { setHelp(true); return; } await prompt.prompt(); await prompt.userChoice; setPrompt(null); };
  return <><Button className="install-button" startIcon={<DownloadOutlined/>} onClick={install}>Instalar app</Button><Snackbar open={help} autoHideDuration={7000} onClose={() => setHelp(false)}><Alert severity="info" onClose={() => setHelp(false)}>Si está disponible, usa “Instalar aplicación” en el menú de tu navegador. En iOS: Compartir → Agregar a inicio.</Alert></Snackbar><Snackbar open={ready} autoHideDuration={4000} onClose={() => setReady(false)} message="Aplicación lista para usarse sin conexión en modo local."/><Snackbar open={refresh}><Alert severity="info" onClose={() => setRefresh(false)} action={<Button onClick={() => updateServiceWorker(true)}>Actualizar</Button>}>Hay una nueva versión. Guarda tus cambios antes de actualizar.</Alert></Snackbar></>;
}
