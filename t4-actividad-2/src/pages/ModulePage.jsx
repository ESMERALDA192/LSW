import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@mui/material';
const modules = {
  education: [['courses', 'Carreras'], ['groups', 'Grupos']],
  ecommerce: [['products', 'Productos'], ['prices', 'Precios'], ['orders', 'Pedidos'], ['payments', 'Pagos'], ['shippings', 'Envíos'], ['inventories', 'Inventarios']],
  security: [['users', 'Usuarios'], ['institutes', 'Institutos'], ['labels', 'Etiquetas'], ['periods', 'Periodos']]
};
export default function ModulePage({ module }) {
  return <><nav className="module-nav" aria-label={`Catálogos de ${module}`}>{modules[module].map(([path, label]) => <Button key={path} component={NavLink} to={path}>{label}</Button>)}</nav><Outlet/></>;
}
