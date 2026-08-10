"use client";

import { CalendarDays, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";

function compactUtc(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export default function AddToCalendar({ data }) {
  const start = new Date(data.date);
  const end = new Date(start.getTime() + 6 * 60 * 60 * 1000);
  const title = `Boda de ${data.couple.bride} y ${data.couple.groom}`;
  const location = `${data.ceremony.name}, ${data.ceremony.address}`;
  const description = `${data.heroMessage} Recepción: ${data.reception.name}, ${data.reception.address}.`;
  const dates = `${compactUtc(start)}/${compactUtc(end)}`;
  const googleParams = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details: description, location });
  const googleUrl = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dulce y Eduardo//Invitacion de boda//ES",
    "BEGIN:VEVENT",
    `UID:boda-dulce-eduardo-${data.dateDisplay.replace(/\s/g, "")}@invitacion`,
    `DTSTAMP:${compactUtc(new Date("2026-01-01T00:00:00Z"))}`,
    `DTSTART:${compactUtc(start)}`,
    `DTEND:${compactUtc(end)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;

  return (
    <section className="section calendar-section" aria-labelledby="calendar-title">
      <SectionHeading
        eyebrow="Guarda nuestro día"
        title="Agrégalo a tu calendario"
        description="Conserva la fecha, la hora y la ubicación en tu teléfono."
      />
      <motion.div
        className="calendar-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75 }}
      >
        <CalendarDays size={32} strokeWidth={1.15} aria-hidden="true" />
        <div>
          <strong id="calendar-title">10 de octubre de 2026</strong>
          <span>5:00 PM · Irapuato, Guanajuato</span>
        </div>
        <div className="calendar-card__actions">
          <a className="button button--primary" href={googleUrl} target="_blank" rel="noreferrer">
            Google Calendar <ExternalLink size={14} />
          </a>
          <a className="button button--outline" href={icsUrl} download="boda-dulce-eduardo.ics">
            Descargar evento <Download size={14} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
