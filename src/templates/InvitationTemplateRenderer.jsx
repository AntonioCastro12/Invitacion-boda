import ElegantClassicTemplate from "./ElegantClassicTemplate";

const templates = {
  "elegante-clasica": ElegantClassicTemplate,
  elegante: ElegantClassicTemplate
};

export const availableTemplates = [
  { key: "elegante-clasica", name: "Elegante clásica", description: "Sobre champagne, papel marfil y detalles botánicos." }
];

export default function InvitationTemplateRenderer({ event, guest }) {
  const Template = templates[event.template_key] || templates[event.plan] || ElegantClassicTemplate;
  return <Template event={event} guest={guest} />;
}
