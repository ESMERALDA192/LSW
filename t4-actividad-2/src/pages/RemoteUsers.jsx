import { Alert, Avatar, Button, Chip, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import { useUsuarios } from '../hooks/useUsuarios.js';
import PageHeading from '../components/PageHeading.jsx';
export default function RemoteUsers() {
  const data = useUsuarios();
  return <><PageHeading eyebrow="LABORATORIO / NOTAS 4.9–4.11" title="Usuarios de la API" description="Consulta HTTP GET con Axios, paginación y el hook useUsuarios."><Chip label="ReqRes · API externa" variant="outlined" /></PageHeading>
    <Alert severity="info" sx={{ mb: 3 }}>Esta vista consulta ReqRes en tiempo real. Para guardar cambios, utiliza el catálogo Usuarios.</Alert>
    <section className="data-panel">{data.loading && <LinearProgress/>}{data.error && <Alert severity="error" action={<Button onClick={data.reload}>Reintentar</Button>}>{data.error}</Alert>}<TableContainer><Table><TableHead><TableRow><TableCell>Usuario</TableCell><TableCell>Correo electrónico</TableCell><TableCell>ID</TableCell></TableRow></TableHead><TableBody>{!data.error && data.usuarios.map(u => <TableRow key={u.id}><TableCell><div className="name-cell"><Avatar src={u.avatar} alt={u.first_name}/><strong>{u.first_name} {u.last_name}</strong></div></TableCell><TableCell>{u.email}</TableCell><TableCell>{u.id}</TableCell></TableRow>)}{!data.loading && !data.error && !data.usuarios.length && <TableRow><TableCell colSpan={3}>No hay usuarios en esta página.</TableCell></TableRow>}</TableBody></Table></TableContainer><div className="pager"><Button disabled={data.loading || data.page <= 1} onClick={data.previous}>Anterior</Button><span>Página {data.page} de {data.totalPages}</span><Button disabled={data.loading || data.page >= data.totalPages || !!data.error} onClick={data.next}>Siguiente</Button></div></section>
  </>;
}
