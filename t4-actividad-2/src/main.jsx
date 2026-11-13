import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { esES } from '@mui/material/locale';
import store from './security/redux/store/store.js';
import { AuthProvider } from './security/auth/AuthContext.jsx';
import AppAllModules from './AppAllModules.jsx';
import './share/css/allPages.css';
const theme = createTheme({
  palette: { primary: { main: '#2d5946', contrastText: '#fff' }, background: { default: '#f6f7f4', paper: '#fff' }, text: { primary: '#202c29', secondary: '#75807a' } },
  typography: { fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', button: { textTransform: 'none', fontWeight: 600 }, h6: { fontWeight: 650 } },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 8 }, contained: { padding: '9px 18px' } } },
    MuiTableCell: { styleOverrides: { head: { background: '#f8f9f6', color: '#75807a', fontSize: 12, fontWeight: 600 }, root: { borderBottom: '1px solid #edf0ea', padding: '17px 20px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px' } } }
  }
}, esES);
createRoot(document.getElementById('root')).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline/><Provider store={store}><AuthProvider><AppAllModules/></AuthProvider></Provider></ThemeProvider></React.StrictMode>);
