'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

const sponsors = [
  '/img/giảnlogo.jpg',
  '/img/cham.jpg',
  '/img/xui.jpg',
  '/img/abu.jpg',
  '/img/dalat.jpg',
  '/img/su.png',
  '/img/toredco.jpg',


];

export default function LogoSupport() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-10">
      <div className="max-w-screen-xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-white mb-6">
          Nhà Tài Trợ Đồng Hành
        </h3>

        <Swiper
          modules={[Autoplay]}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          loop
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          spaceBetween={0}
          className="w-full"
        >
          {sponsors.map((logo, index) => (
            <SwiperSlide key={index} className="p-2">
              <img
                src={logo}
                alt={`Sponsor ${index + 1}`}
                className="h-60 w-full object-contain hover:grayscale-0 transform transition duration-300 hover:-translate-y-2 border border-gray-200 rounded-xl hover:border-white shadow-sm bg-white p-4"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
