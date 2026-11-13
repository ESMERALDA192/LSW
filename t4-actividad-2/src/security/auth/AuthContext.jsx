import { createContext, useContext, useEffect, useReducer } from 'react';
import { api, apiMode } from '../../api/repository.js';
const AuthContext = createContext(null);
export function authReducer(state, action) {
  switch (action.type) {
    case 'checking': return { ...state, status: 'checking', error: '' };
    case 'login': return { status: 'authenticated', user: action.user, error: '' };
    case 'error': return { status: 'guest', user: null, error: action.message };
    case 'logout': return { status: 'guest', user: null, error: '' };
    default: return state;
  }
}
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, { status: 'guest', user: null, error: '' });
  useEffect(() => { const expire = () => dispatch({ type: 'error', message: 'La sesión terminó. Inicia sesión de nuevo.' }); window.addEventListener('t4-session-expired', expire); return () => window.removeEventListener('t4-session-expired', expire); }, []);
  const login = async ({ email, password }) => {
    dispatch({ type: 'checking' });
    try {
      let user;
      if (apiMode) { const { data } = await api.post('/login', { email, password }); sessionStorage.setItem('t4-api-token', data.token); user = data.user; }
      else {
        if (email.trim().toLowerCase() !== 'demo@reactlab.test' || password !== 'React123!') throw new Error('Correo o contraseña incorrectos. Usa las credenciales de demostración.');
        user = { name: 'Estudiante', email: 'demo@reactlab.test' };
      }
      dispatch({ type: 'login', user }); return true;
    } catch (e) { dispatch({ type: 'error', message: e.message }); return false; }
  };
  const logout = async () => { try { if (apiMode) await api.post('/logout'); } finally { sessionStorage.removeItem('t4-api-token'); dispatch({ type: 'logout' }); } };
  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
