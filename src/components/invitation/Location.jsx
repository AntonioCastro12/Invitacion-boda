import { MapPin, Navigation } from "lucide-react";

export default function Location({
  title,
  name,
  address,
  lat,
  lng,
  image,
  showWaze = true,
}) {
  const hasCoordinates =
    lat != null &&
    lng != null &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng));
  const placeQuery = encodeURIComponent(`${name} ${address || ""}`.trim());
  const maps = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${placeQuery}`;
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  return (
    <article className="location-card">
      <img
        className="location-card__image"
        src={
          image ||
          (title === "Ceremonia"
            ? "/images/pareja-3.jpg"
            : "/images/pareja-5.jpg")
        }
        alt={name}
        loading="lazy"
        decoding="async"
      />
      <div className="location-card__body">
        <MapPin className="section-icon" aria-hidden="true" />
        <span className="eyebrow">{title}</span>
        <h3>{name}</h3>
        <p>{address}</p>
        <div className="button-row">
          <a
            className="button button--outline"
            href={maps}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={16} /> Google Maps
          </a>
          {showWaze && hasCoordinates && (
            <a
              className="button button--outline"
              href={waze}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={16} /> Waze
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
