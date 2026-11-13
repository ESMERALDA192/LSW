import { useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, MenuItem, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip } from '@mui/material';
import { Add, DeleteOutline, EditOutlined, Search, VisibilityOutlined, CheckCircleOutline } from '@mui/icons-material';
import { catalogs, emptyRecord, validateRecord } from '../domain/catalogs.js';
import { useForm } from '../hooks/useForm.js';
function RecordForm({ entity, record, rows, save, close }) {
  const schema = catalogs[entity];
  const { formulario, onChange } = useForm(record);
  const [errors, setErrors] = useState({}); const [failure, setFailure] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async e => {
    e.preventDefault(); const next = validateRecord(entity, formulario, rows); setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true); setFailure('');
    try { await save(formulario); close(true); } catch (err) { setFailure(err.message || 'No se pudo guardar.'); } finally { setBusy(false); }
  };
  return <Dialog open onClose={() => !busy && close()} fullWidth maxWidth="sm"><form onSubmit={submit} noValidate>
    <DialogTitle>{record.id ? 'Editar' : 'Nuevo'} {schema.singular}</DialogTitle>
    <DialogContent><p className="dialog-hint">Completa los datos. Todos los campos son obligatorios.</p>{failure && <Alert severity="error" sx={{ mb: 2 }}>{failure}</Alert>}
      <div className="form-grid">{schema.fields.map((f, i) => <TextField key={f.key} label={f.label} autoFocus={i === 0} value={formulario[f.key] ?? ''} onChange={e => onChange(e.target.value, f.key)} type={f.type === 'select' ? 'text' : f.type} select={f.type === 'select'} required fullWidth error={!!errors[f.key]} helperText={errors[f.key]} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: f.min, step: f.type === 'number' ? 'any' : undefined, maxLength: 240 } }}>{f.options?.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</TextField>)}</div>
    </DialogContent><DialogActions><Button disabled={busy} onClick={() => close()}>Cancelar</Button><Button variant="contained" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button></DialogActions>
  </form></Dialog>;
}
export default function CrudTable({ entity, data, parentId, onSelect, selectedId, label }) {
  const schema = catalogs[entity];
  const [query, setQuery] = useState(''); const [page, setPage] = useState(0); const [pageSize, setPageSize] = useState(5);
  const [editing, setEditing] = useState(null); const [deleting, setDeleting] = useState(null); const [viewing, setViewing] = useState(null);
  const [busy, setBusy] = useState(false); const [failure, setFailure] = useState(''); const [notice, setNotice] = useState('');
  const rows = data.rows.filter(r => parentId === undefined || r.parentId === parentId);
  const filtered = rows.filter(r => schema.fields.some(f => String(r[f.key] ?? '').toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  const safePage = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const remove = async () => { setBusy(true); setFailure(''); try { await data.remove(deleting.id); if (selectedId === deleting.id) onSelect?.(null); setDeleting(null); setNotice('Registro eliminado.'); } catch (e) { setFailure(e.message); } finally { setBusy(false); } };
  return <section className="data-panel" aria-label={schema.title}>
    <div className="table-toolbar"><div className="table-title"><h2>{label || schema.title}</h2><Chip size="small" label={`${rows.length} registros`} /></div><div className="table-controls"><TextField size="small" placeholder="Buscar…" aria-label={`Buscar ${schema.title.toLowerCase()}`} value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} slotProps={{ input: { startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }, htmlInput: { 'aria-label': `Buscar ${schema.title.toLowerCase()}` } }}/><Button variant="contained" startIcon={<Add />} onClick={() => setEditing({ ...emptyRecord(entity), ...(parentId !== undefined ? { parentId } : {}) })}>Nuevo {schema.singular}</Button></div></div>
    {data.loading && <LinearProgress aria-label="Cargando registros" />}
    {data.error && <Alert severity="error" action={<Button onClick={data.reload}>Reintentar</Button>}>{data.error}</Alert>}
    <TableContainer><Table><TableHead><TableRow>{schema.fields.map(f => <TableCell key={f.key}>{f.label}</TableCell>)}<TableCell align="right">Acciones</TableCell></TableRow></TableHead><TableBody>
      {filtered.slice(safePage * pageSize, (safePage + 1) * pageSize).map(row => <TableRow key={row.id} selected={row.id === selectedId} hover>{schema.fields.map((f, i) => <TableCell key={f.key}>{i === 0 ? <div className="name-cell">{entity === 'users' && <Avatar sx={{ width: 34, height: 34, bgcolor: '#e8ede4', color: '#446c41', fontSize: 12 }}>{row.name.split(' ').map(x => x[0]).slice(0, 2).join('')}</Avatar>}<span className="row-name">{row[f.key]}</span></div> : f.key === 'status' || f.key === 'role' ? <Chip size="small" label={row[f.key]} className={row[f.key] === 'Inactivo' ? '' : 'soft-chip'} /> : String(row[f.key] ?? '')}</TableCell>)}
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{onSelect && <Tooltip title="Seleccionar"><IconButton aria-label={`Seleccionar ${row.name}`} onClick={() => onSelect(row)} color={row.id === selectedId ? 'primary' : 'default'}><CheckCircleOutline fontSize="small" /></IconButton></Tooltip>}<Tooltip title="Consultar"><IconButton aria-label={`Consultar ${row.name}`} onClick={() => setViewing(row)}><VisibilityOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Editar"><IconButton aria-label={`Editar ${row.name}`} onClick={() => setEditing(row)}><EditOutlined fontSize="small" /></IconButton></Tooltip><Tooltip title="Eliminar"><IconButton aria-label={`Eliminar ${row.name}`} onClick={() => { setFailure(''); setDeleting(row); }}><DeleteOutline fontSize="small" /></IconButton></Tooltip></TableCell>
      </TableRow>)}
      {!filtered.length && !data.loading && <TableRow><TableCell colSpan={schema.fields.length + 1}><div className="empty-state"><Search /><h3>{query ? 'Sin resultados' : 'Todavía no hay registros'}</h3><p>{query ? 'Prueba con otro nombre o dato.' : `Crea el primer ${schema.singular} para comenzar.`}</p></div></TableCell></TableRow>}
    </TableBody></Table></TableContainer>
    <TablePagination component="div" count={filtered.length} page={safePage} rowsPerPage={pageSize} rowsPerPageOptions={[5, 10, 25]} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(Number(e.target.value)); setPage(0); }} labelRowsPerPage="Filas:" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} getItemAriaLabel={type => type === 'next' ? 'Página siguiente' : 'Página anterior'} />
    {editing && <RecordForm entity={entity} record={editing} rows={data.rows} save={data.save} close={saved => { setEditing(null); if (saved) setNotice('Registro guardado correctamente.'); }} />}
    <Dialog open={!!deleting} onClose={() => !busy && setDeleting(null)}><DialogTitle>Eliminar {schema.singular}</DialogTitle><DialogContent><p>¿Eliminar «{deleting?.name}»? Esta acción no se puede deshacer.</p>{['institutes', 'businesses'].includes(entity) && <Alert severity="warning">También se eliminarán sus registros asociados.</Alert>}{failure && <Alert severity="error">{failure}</Alert>}</DialogContent><DialogActions><Button disabled={busy} onClick={() => setDeleting(null)}>Cancelar</Button><Button disabled={busy} variant="contained" color="error" onClick={remove}>{busy ? 'Eliminando…' : 'Eliminar'}</Button></DialogActions></Dialog>
    <Dialog open={!!viewing} onClose={() => setViewing(null)} fullWidth maxWidth="sm"><DialogTitle>Detalle de {schema.singular}</DialogTitle><DialogContent><dl className="detail-list">{schema.fields.map(f => <div key={f.key}><dt>{f.label}</dt><dd>{String(viewing?.[f.key] ?? '')}</dd></div>)}</dl></DialogContent><DialogActions><Button onClick={() => setViewing(null)}>Cerrar</Button></DialogActions></Dialog>
    <Snackbar open={!!notice} autoHideDuration={3500} onClose={() => setNotice('')} message={notice} />
  </section>;
}
