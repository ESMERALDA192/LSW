import { createHashRouter, Navigate, RouterProvider, useLocation, Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { useAuth } from './security/auth/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import Institutes from './security/institutes/pages/Institutes.jsx';
import HooksLab from './pages/HooksLab.jsx';
import RemoteUsers from './pages/RemoteUsers.jsx';
import ModulePage from './pages/ModulePage.jsx';
function Protected({ children }) { const auth = useAuth(); const location = useLocation(); return auth.status === 'authenticated' ? children : <Navigate to="/login" state={{ from: location.pathname }} replace/>; }
const router = createHashRouter([{ element: <Layout/>, errorElement: <div style={{ padding: 40 }}><h1>No se pudo abrir la aplicación</h1><p>Recarga la página para intentarlo de nuevo.</p><a href="/">Volver al inicio</a></div>, children: [
  { index: true, element: <Dashboard/> }, { path: 'login', element: <Login/> }, { path: 'lab/hooks', element: <HooksLab/> }, { path: 'lab/api', element: <RemoteUsers/> },
  { path: 'security', element: <Protected><ModulePage module="security"/></Protected>, children: [{ index: true, element: <Navigate to="users" replace/> }, { path: 'institutes', element: <Institutes/> }, ...['users', 'labels', 'periods'].map(entity => ({ path: entity, element: <CatalogPage entity={entity}/> }))] },
  ...['education', 'ecommerce'].map(module => ({ path: module, element: <Protected><ModulePage module={module}/></Protected>, children: [{ index: true, element: <Navigate to={module === 'education' ? 'courses' : 'products'} replace/> }, ...(module === 'education' ? ['courses', 'groups'] : ['products', 'prices', 'orders', 'payments', 'shippings', 'inventories']).map(entity => ({ path: entity, element: <CatalogPage entity={entity}/> }))] })),
  { path: '*', element: <section className="empty-state"><h1>Esta página no existe</h1><Button component={Link} to="/">Volver al inicio</Button></section> }
]}]);
export default function AppAllModules() { return <RouterProvider router={router}/>; }
