import { CalendarDays, Check, ExternalLink, FolderKanban, LogOut, Plus, RotateCcw, Save, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { featureCatalog, packageComparison, packages, resolvePackage } from "../data/packageCatalog";
import { useAuth } from "../hooks/useAuth";
import { createDemoProject, getDemoPlatformState, resetDemoPlatform, updateDemoProject } from "../services/demoPlatformService";

export default function AdminPage() {
  const { profile, signOut, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState(getDemoPlatformState);
  const [notice, setNotice] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(() => getDemoPlatformState().projects[0]?.id);
  const emptyProject = { name: "", slug: "", eventType: "Boda", date: "2027-01-01", clientName: "", clientEmail: "", clientPassword: "", packageKey: "elegante-900", invitationUrl: "" };
  const [projectForm, setProjectForm] = useState(emptyProject);
  const selectedProject = state.projects.find((project) => project.id === selectedProjectId) || state.projects[0];
  const entitlement = useMemo(() => resolvePackage(selectedProject?.packageKey, selectedProject?.featureOverrides), [selectedProject]);

  if (profile?.rol !== "super_admin") return <main className="state-page"><ShieldCheck size={42} /><h1>Área reservada</h1><p>Esta sección solamente está disponible para RCM Code Dev.</p><Link className="button button--dark" to="/panel">Volver al panel</Link></main>;
  if (!isDemoMode) return <main className="state-page"><ShieldCheck size={42} /><h1>RCM Super Admin</h1><p>La prueba de asignación local está disponible al activar VITE_DEMO_MODE.</p><Link className="button button--dark" to="/panel">Ir al panel</Link></main>;

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function choosePackage(packageKey) {
    const next = updateDemoProject(selectedProject.id, { packageKey, featureOverrides: {} });
    setState(next);
    flash(`Paquete de ${selectedProject.name} actualizado correctamente.`);
  }

  function toggleFeature(key) {
    const base = resolvePackage(selectedProject.packageKey).features[key];
    const effective = entitlement.features[key];
    const overrides = { ...(selectedProject.featureOverrides || {}) };
    if (!effective === base) delete overrides[key];
    else overrides[key] = !effective;
    const next = updateDemoProject(selectedProject.id, { featureOverrides: overrides });
    setState(next);
  }

  function saveClient(event) {
    event.preventDefault();
    if (!selectedProject.clientName?.trim() || !selectedProject.clientEmail?.trim() || selectedProject.clientPassword?.length < 6) {
      flash("Completa el nombre, correo y una contraseña de al menos 6 caracteres.");
      return;
    }
    setState(updateDemoProject(selectedProject.id, { clientName: selectedProject.clientName.trim(), clientEmail: selectedProject.clientEmail.trim().toLowerCase(), clientPassword: selectedProject.clientPassword }));
    flash(`Acceso de ${selectedProject.name} guardado correctamente.`);
  }

  function editSelectedProject(updates) {
    setState((current) => ({ ...current, projects: current.projects.map((project) => project.id === selectedProject.id ? { ...project, ...updates } : project) }));
  }

  function createProject(event) {
    event.preventDefault();
    try { const next = createDemoProject(projectForm); const created = next.projects.at(-1); setState(next); setSelectedProjectId(created.id); setProjectForm(emptyProject); flash(projectForm.invitationUrl ? "Invitación liberada y seleccionada para administrar." : "Proyecto guardado y seleccionado para administrar."); }
    catch (error) { flash(error.message); }
  }

  async function leave() {
    await signOut();
    navigate("/login");
  }

  return <main className="admin-console">
    {notice && <div className="toast" role="status">{notice}</div>}
    <header className="admin-console__topbar">
      <Link className="brand" to="/"><span>RCM</span> Invitaciones</Link>
      <div><span className="admin-role"><ShieldCheck size={15} /> Super administrador</span><button type="button" onClick={leave}><LogOut size={17} /> Salir</button></div>
    </header>
    <section className="admin-hero">
      <div><span className="page-eyebrow">Administrando evento seleccionado</span><h1>{selectedProject.name}</h1><p>Tú conservas el control del diseño. Aquí asignas el paquete, activas extras y preparas el acceso del cliente.</p></div>
      <div className="admin-hero__actions"><a className="button button--light" href={selectedProject.invitationUrl || `/evento/${selectedProject.slug}/A7X92`} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Ver invitación</a><button className="button button--gold" type="button" onClick={leave}><Users size={17} /> Salir y probar como cliente</button></div>
    </section>
    <section className="admin-overview"><article><FolderKanban /><span>Eventos totales<strong>{state.projects.length}</strong></span></article><article><CalendarDays /><span>Publicados<strong>{state.projects.filter((project) => project.status === "published").length}</strong></span></article><article><Users /><span>Clientes registrados<strong>{new Set(state.projects.map((project) => project.clientEmail)).size}</strong></span></article><article><Sparkles /><span>En diseño<strong>{state.projects.filter((project) => project.status === "design").length}</strong></span></article></section>
    <section className="admin-section">
      <header><div><span>01</span><div><h2>Cartera de invitaciones</h2><p>Registra bodas, XV años, bautizos y futuros diseños personalizados.</p></div></div><strong>{state.projects.length} proyectos</strong></header>
      <div className="admin-projects">{state.projects.map((project) => <article className={project.id === selectedProject.id ? "is-selected" : ""} key={project.id}><div><span className={`project-status project-status--${project.status}`}>{project.status === "published" ? "Liberada" : "En diseño"}</span><h3>{project.name}</h3><p>{project.eventType} · {project.date}</p></div><button className="project-manage" type="button" onClick={() => setSelectedProjectId(project.id)}>{project.id === selectedProject.id ? "Administrando" : "Administrar"}</button><dl><div><dt>Cliente</dt><dd>{project.clientEmail}</dd></div><div><dt>URL</dt><dd>{project.invitationUrl || "Pendiente"}</dd></div><div><dt>Paquete</dt><dd>{resolvePackage(project.packageKey, project.featureOverrides).name}</dd></div></dl>{project.invitationUrl ? <a href={project.invitationUrl} target="_blank" rel="noreferrer"><ExternalLink /> Abrir</a> : <span className="project-pending">Esperando diseño RCM</span>}</article>)}</div>
      <form className="new-project-form" onSubmit={createProject}><h3><Plus size={18} /> Registrar y asignar invitación</h3><p className="form-help">Publica tu diseño donde prefieras y pega aquí el enlace. Si todavía no lo tienes, puedes guardar el proyecto en diseño.</p><div><label>Nombre del evento<input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Ana & Carlos" /></label><label>Slug interno<input value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })} placeholder="ana-carlos" /></label><label>Tipo<select value={projectForm.eventType} onChange={(e) => setProjectForm({ ...projectForm, eventType: e.target.value })}><option>Boda</option><option>XV años</option><option>Bautizo</option><option>Otro evento</option></select></label><label>Fecha<input type="date" value={projectForm.date} onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })} /></label><label>Nombre del cliente<input value={projectForm.clientName} onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })} placeholder="Valentina y familia" /></label><label>Correo del cliente<input type="email" value={projectForm.clientEmail} onChange={(e) => setProjectForm({ ...projectForm, clientEmail: e.target.value })} /></label><label>Contraseña temporal<input minLength="6" value={projectForm.clientPassword} onChange={(e) => setProjectForm({ ...projectForm, clientPassword: e.target.value })} /></label><label>Paquete<select value={projectForm.packageKey} onChange={(e) => setProjectForm({ ...projectForm, packageKey: e.target.value })}>{packages.map((item) => <option key={item.key} value={item.key}>{item.name} · ${item.price.toLocaleString("es-MX")}</option>)}</select></label><label className="project-url-field">URL pública de la invitación<input type="url" value={projectForm.invitationUrl} onChange={(e) => setProjectForm({ ...projectForm, invitationUrl: e.target.value })} placeholder="https://mi-invitacion.netlify.app/" /><small>Al guardar una URL válida, la invitación queda liberada para el cliente.</small></label></div><button className="button button--dark" type="submit"><Plus size={17} /> Guardar y asignar</button></form>
    </section>
    <section className="admin-section">
      <header><div><span>02</span><div><h2>Paquete de {selectedProject.name}</h2><p>Selecciona un paquete para activar su configuración base.</p></div></div><strong>${entitlement.price.toLocaleString("es-MX")} MXN · {entitlement.name}</strong></header>
      <div className="package-selector">{packages.map((item) => <article className={item.key === selectedProject.packageKey ? "is-selected" : ""} key={item.key}><header><strong>{item.name}</strong><span>${item.price.toLocaleString("es-MX")} MXN</span></header><ul>{item.includes.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul><p><strong>Recomendado para:</strong> {item.recommendedFor}</p><button type="button" onClick={() => choosePackage(item.key)}>{item.key === selectedProject.packageKey ? <><Check size={15} /> Paquete activo</> : "Seleccionar paquete"}</button></article>)}</div>
      <section className="package-comparison"><header><span className="page-eyebrow">Comparativa rápida</span><h3>Funciones incluidas por paquete</h3></header><p className="package-explanation"><strong>¿Qué significa confirmación de asistencia?</strong> El invitado indica si acudirá y cuántas personas asistirán. Según el paquete, la respuesta se envía por WhatsApp, se captura en un formulario o queda guardada y organizada en el panel.</p><div><table><thead><tr><th>Función</th>{packages.map((item) => <th key={item.key}>${item.price.toLocaleString("es-MX")}{item.key === "vip-5000" ? " VIP" : ""}</th>)}</tr></thead><tbody>{packageComparison.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${packages[index].key}`}>{value}</td>)}</tr>)}</tbody></table></div></section>
    </section>
    <section className="admin-section">
      <header><div><span>03</span><div><h2>Servicios de {selectedProject.name}</h2><p>Puedes agregar o quitar servicios sin cambiar el diseño personalizado.</p></div></div><span className="service-count"><Sparkles size={16} /> {Object.values(entitlement.features).filter(Boolean).length} activos</span></header>
      <div className="feature-switches">{featureCatalog.map((feature) => <label htmlFor={`feature-${selectedProject.id}-${feature.key}`} key={feature.key} className={entitlement.features[feature.key] ? "is-enabled" : ""}><span><strong>{feature.label}</strong><small>{Object.hasOwn(selectedProject.featureOverrides || {}, feature.key) ? "Ajuste personalizado" : `Configuración de ${entitlement.name}`}</small></span><input id={`feature-${selectedProject.id}-${feature.key}`} aria-label={`Activar ${feature.label}`} type="checkbox" checked={entitlement.features[feature.key]} onChange={() => toggleFeature(feature.key)} /><i aria-hidden="true" /></label>)}</div>
      <p className="gallery-limit">Álbum colaborativo: <strong>sin límite de cantidad impuesto por RCM</strong> · máximo 10 MB por archivo · sujeto al almacenamiento contratado.</p>
    </section>
    <section className="admin-section">
      <header><div><span>04</span><div><h2>Acceso de {selectedProject.name}</h2><p>Estas credenciales abren únicamente el panel del evento seleccionado.</p></div></div></header>
      <form className="client-access-form" onSubmit={saveClient}><label>Nombre del cliente<input value={selectedProject.clientName || ""} onChange={(event) => editSelectedProject({ clientName: event.target.value })} /></label><label>Correo de acceso<input type="email" value={selectedProject.clientEmail || ""} onChange={(event) => editSelectedProject({ clientEmail: event.target.value })} /></label><label>Contraseña temporal<input value={selectedProject.clientPassword || ""} onChange={(event) => editSelectedProject({ clientPassword: event.target.value })} /></label><button className="button button--dark" type="submit"><Save size={17} /> Guardar acceso</button></form>
    </section>
    <footer className="admin-console__footer"><p>Los cambios de esta prueba se guardan únicamente en este navegador.</p><button type="button" onClick={() => { const next = resetDemoPlatform(); setState(next); flash("La demostración volvió a su configuración inicial."); }}><RotateCcw size={16} /> Restablecer demostración</button></footer>
  </main>;
}
