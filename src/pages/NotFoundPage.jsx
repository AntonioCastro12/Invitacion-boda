import { Link } from "react-router-dom";
export default function NotFoundPage() { return <main className="state-page"><span className="state-mark">404</span><h1>No encontramos esta página.</h1><p>El enlace puede estar incompleto o haber cambiado.</p><Link className="button button--dark" to="/">Volver al inicio</Link></main>; }
