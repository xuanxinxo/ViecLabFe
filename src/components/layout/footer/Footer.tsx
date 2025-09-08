import React from 'react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer id="footer" className="bg-blue-900 text-white pt-10 pb-5 px-4 md:px-16 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột 1: Thông tin công ty */}
        <div>
          <h2 className="font-bold uppercase mb-4">ViecLab là dự án chiến lược bởi<br /> TOREDCO – Công ty tư vấn và đào tạo <br />nhân lực hàng đầu</h2>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              📞 02366 527799 – 0932 512 521
            </li>
            <li className="flex items-center gap-2">
              🌐 www.toredco.vn
            </li>
            <li className="flex items-center gap-2">
              📍 04 Mỹ An 4, Ngũ Hành Sơn, Đà Nẵng
            </li>
            <li className="flex items-center gap-2">
              ✉️ toredco.dn@gmail.com
            </li>
          </ul>
        </div>

        {/* Cột 2: Dịch vụ cung cấp */}
        <div>
          <h2 className="font-bold uppercase mb-4">Các dịch vụ cung cấp</h2>
          <div className="grid grid-cols-2 gap-2">
            <ul className="space-y-1">
              <li>Giấy phép</li>
              <li>Chiến lược kinh doanh</li>
              <li>Thiết kế thi công</li>
              <li>Nhân sự</li>
              <li>Menu</li>
            </ul>
            <ul className="space-y-1">
              <li>Tư vấn trang thiết bị</li>
              <li>Marketing</li>
              <li>Tư vấn quy trình vận hành</li>
              <li>Tổ chức sự kiện</li>
              <li>Vận hành, giám sát, bàn giao</li>
            </ul>
          </div>
        </div>

        {/* Cột 3: Fanpage + Map */}
        <div>
          <h2 className="font-bold uppercase mb-4">Fanpage</h2>
          <div className="space-y-4">
            {/* Facebook Page Link */}
            <div className="mb-3">
              <a 
                href="https://www.facebook.com/dichvutuvansetupnhahangquancafe" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook Fanpage
              </a>
            </div>

            {/* Facebook Page Embed */}
            <iframe
              src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fdichvutuvansetupnhahangquancafe&tabs=timeline&width=300&height=200&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
              width="300"
              height="200"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />


            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3833.877435498256!2d108.24173841490222!3d16.072876288875655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219ac0d8a5fb1%3A0x16873b98a07b73d!2zQ-G7rWEgVGjhu6UgVMOibiBUaOG7pyBU4bq_IEPGoW8gVuG6p24gVMawxqFuIFR1ecOqbiB04bqhbyBUT1JFRENP!5e0!3m2!1svi!2s!4v1616406943621!5m2!1svi!2s"
              width="100%"
              height="130"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-white/20 pt-4 text-center text-xs">
        @copyright by TOREDCO • Powered by Team Marketing TOREDCO COMPANY
      </div>
    </footer>
  );
};

export default Footer; 