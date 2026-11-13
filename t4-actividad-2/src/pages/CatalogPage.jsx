import { useParams } from 'react-router-dom';
import { Chip } from '@mui/material';
import { catalogs } from '../domain/catalogs.js';
import { useCatalog } from '../hooks/useCatalog.js';
import CrudTable from '../components/CrudTable.jsx';
import PageHeading from '../components/PageHeading.jsx';
export function CatalogContent({ entity, parentId, onSelect, selectedId, label }) {
  const data = useCatalog(entity);
  return <CrudTable entity={entity} data={data} parentId={parentId} onSelect={onSelect} selectedId={selectedId} label={label} />;
}
export default function CatalogPage({ entity: fixedEntity }) {
  const params = useParams(); const entity = fixedEntity || params.entity;
  if (!catalogs[entity]) return <PageHeading title="Catálogo no encontrado" description="Elige un catálogo en el menú del módulo." />;
  return <><PageHeading eyebrow={`CATÁLOGOS / ${entity === 'users' ? 'SEGURIDAD' : 'GESTIÓN'}`} title={catalogs[entity].title} description={entity === 'users' ? 'Administra los usuarios de tu comunidad en un solo lugar.' : `Consulta y administra el catálogo de ${catalogs[entity].title.toLowerCase()}.`}><Chip label="CRUD · Custom hooks" variant="outlined" /></PageHeading><CatalogContent key={entity} entity={entity} /><p className="page-footnote">Datos de demostración · Los cambios se guardan en el almacenamiento seleccionado.</p></>;
}
