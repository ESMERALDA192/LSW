export default function PageHeading({ eyebrow = 'ESPACIO DE TRABAJO', title, description, children }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>;
}
