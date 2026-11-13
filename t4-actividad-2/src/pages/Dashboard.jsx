import { Link } from 'react-router-dom';
import { ArrowForward, PeopleOutline, AccountBalanceOutlined, ScienceOutlined, Public, CheckCircleOutline, Code } from '@mui/icons-material';
import { Button, Chip } from '@mui/material';
import PageHeading from '../components/PageHeading.jsx';
const cards = [
  { number: '01', icon: PeopleOutline, title: 'Usuarios', text: 'Crea, consulta y organiza los usuarios de tu comunidad.', path: '/security/users', tag: 'Formularios + hooks', tone: 'green' },
  { number: '02', icon: AccountBalanceOutlined, title: 'Institutos', text: 'Administra institutos, negocios y su información relacionada.', path: '/security/institutes', tag: 'Redux + CRUD', tone: 'sand' },
  { number: '03', icon: ScienceOutlined, title: 'Laboratorio de hooks', text: 'Explora el estado de React con ejemplos interactivos.', path: '/lab/hooks', tag: 'useState + useReducer', tone: 'lavender' }
];
export default function Dashboard() {
  return <><PageHeading eyebrow="TU ESPACIO DE APRENDIZAJE" title="Todo empieza con una idea." description="Explora, administra y pon en práctica lo aprendido en clase."><Chip className="course-chip" label="T4 · Actividad 2"/></PageHeading>
    <section className="hero-panel"><div className="hero-copy"><span className="hero-kicker"><span className="status-dot"/> LABORATORIO WEB</span><h2>De los componentes<br/>a una app completa.</h2><p>Formularios, APIs y operaciones CRUD.<br/>Todo conectado en una aplicación progresiva.</p><Button component={Link} to="/security/users" endIcon={<ArrowForward/>} variant="contained">Explorar usuarios</Button></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="code-tile"><Code sx={{ fontSize: 88 }}/></div><div className="floating-tag tag-top"><span className="status-dot"/> Estado conectado</div><div className="floating-tag tag-bottom"><CheckCircleOutline fontSize="small"/> Listo para crear</div><span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span></div></section>
    <div className="section-heading"><h2>Elige por dónde empezar</h2><span>Aprende haciendo</span></div><div className="module-cards">{cards.map(c => <Link to={c.path} className="module-card" key={c.number}><div className="module-card-top"><div className={`module-icon ${c.tone}`}><c.icon/></div><span>{c.number}</span></div><h3>{c.title}</h3><p>{c.text}</p><div className="module-card-bottom"><span>{c.tag}</span><ArrowForward fontSize="small"/></div></Link>)}</div>
    <div className="bottom-grid"><section className="api-callout"><div className="module-icon blue"><Public/></div><div><h3>Conecta con datos reales</h3><p>Consulta usuarios de ReqRes con Axios y navega entre páginas.</p><Button component={Link} to="/lab/api" endIcon={<ArrowForward/>}>Probar API</Button></div></section><section className="learning-path"><div className="eyebrow">LA RUTA DE ESTA ACTIVIDAD</div><div><span>01</span> Hooks y formularios <b>4.6–4.13</b></div><div><span>02</span> Rutas, AppBar y Redux <b>6.1–6.5</b></div><div><span>03</span> Pestañas y CRUD <b>6.6 + actividad</b></div></section></div>
  </>;
}
