"use client";

import { motion } from "framer-motion";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SectionHeading from "./SectionHeading";

export default function Gallery({ photos }) {
  return (
    <section className="section gallery-section" aria-labelledby="gallery-title">
      <SectionHeading
        eyebrow="Cada instante nos trajo hasta aquí"
        title="Nuestra historia"
        description="Cinco recuerdos, una misma promesa y toda una vida por escribir."
      />
      <motion.div
        className="gallery"
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          loop
          speed={850}
          autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation
          pagination={{ clickable: true }}
          slidesPerView={1}
          spaceBetween={16}
          aria-label="Galería de fotografías de los novios"
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.src}>
              <figure className="gallery__slide">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  style={{ objectPosition: photo.position }}
                />
                <span className="gallery__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </section>
  );
}
