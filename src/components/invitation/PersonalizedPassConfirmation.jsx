import PersonalizedPass from "./PersonalizedPass";
import WhatsAppConfirmation from "./WhatsAppConfirmation";

export default function PersonalizedPassConfirmation({ event, guest }) {
  return <section className="invitation-section pass-confirmation-section" aria-labelledby="pass-confirmation-title">
    <p className="section-intro">Preparado especialmente para ustedes</p>
    <h2 id="pass-confirmation-title">Tu pase y confirmación</h2>
    <p>Consulta los lugares reservados y confirma aquí mismo si podrán acompañarnos.</p>
    <div className="pass-confirmation-card">
      <PersonalizedPass event={event} guest={guest} compact />
      <WhatsAppConfirmation event={event} guest={guest} compact />
    </div>
  </section>;
}
