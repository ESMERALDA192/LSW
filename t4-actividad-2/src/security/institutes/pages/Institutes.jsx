import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Chip, Tab, Tabs } from '@mui/material';
import PageHeading from '../../../components/PageHeading.jsx';
import CrudTable from '../../../components/CrudTable.jsx';
import { CatalogContent } from '../../../pages/CatalogPage.jsx';
import { GET_DATA_START, SAVE_INSTITUTE, DELETE_INSTITUTE } from '../../redux/thunks.js';
const details = [['info', 'Info adicional'], ['files', 'Archivos'], ['phones', 'Teléfonos'], ['websites', 'Direcciones web'], ['addresses', 'Domicilios']];
export default function Institutes() {
  const dispatch = useDispatch(); const state = useSelector(s => s.institutesReducer);
  const [tab, setTab] = useState('institutes'); const [businessTab, setBusinessTab] = useState('businesses');
  const [instituteId, setInstituteId] = useState(null); const [business, setBusiness] = useState(null);
  const institute = state.institutesDataArr.find(r => r.id === instituteId);
  useEffect(() => { dispatch(GET_DATA_START()); }, [dispatch]);
  const data = { rows: state.institutesDataArr, loading: state.loading, error: state.error, reload: () => dispatch(GET_DATA_START()), save: r => dispatch(SAVE_INSTITUTE(r)).unwrap(), remove: id => dispatch(DELETE_INSTITUTE(id)).unwrap() };
  return <><PageHeading eyebrow="SEGURIDAD / NOTAS 6.5–6.6" title="Institutos y negocios" description="Organiza tus instituciones, campus y datos de contacto."><Chip variant="outlined" label="CRUD · Redux Toolkit" /></PageHeading>
    <div className="tabs-panel"><Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Institutos y negocios"><Tab label="Institutos" value="institutes"/><Tab label="Negocios" value="businesses" disabled={!institute}/></Tabs></div>
    {tab === 'institutes' ? <><CrudTable entity="institutes" data={data} selectedId={instituteId} onSelect={r => { setInstituteId(r?.id || null); setBusiness(null); setBusinessTab('businesses'); }} /><Alert severity="info" sx={{ mt: 2 }}>Selecciona un instituto con el icono de verificación para administrar sus negocios.</Alert></> : institute ? <><div className="selection-strip">Instituto seleccionado <strong>{institute.name}</strong></div><Tabs value={businessTab} onChange={(_, v) => setBusinessTab(v)} variant="scrollable" scrollButtons="auto" aria-label="Datos del negocio"><Tab label="Negocios" value="businesses"/>{details.map(([key, name]) => <Tab key={key} label={name} value={key} disabled={!business}/>)}</Tabs>
      {businessTab === 'businesses' ? <><CatalogContent key={instituteId} entity="businesses" parentId={instituteId} selectedId={business?.id} onSelect={r => setBusiness(r)} /><p className="page-footnote">Selecciona un negocio para habilitar sus pestañas de detalle.</p></> : <><div className="selection-strip">Negocio seleccionado <strong>{business.name}</strong></div>{businessTab === 'files' && <Alert severity="info" sx={{ mb: 2 }}>Este catálogo guarda referencias por URL a archivos; no sube archivos binarios.</Alert>}<CatalogContent key={`${business.id}-${businessTab}`} entity={businessTab} parentId={business.id}/></>}
    </> : <Alert severity="info">Selecciona un instituto para continuar.</Alert>}</>;
}
