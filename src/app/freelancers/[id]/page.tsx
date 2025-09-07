import { notFound } from 'next/navigation';
import Link from 'next/link';
// import ReviewSection from '/components/reviewSection/ReviewSection';

// Mock data, có thể thay bằng fetch API thực tế
const freelancers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    skill: 'Thiết kế',
    exp: '2 năm',
    avatar: '/avatars/user1.jpg',
    rating: 4.8,
    completedJobs: 15,
    description: 'Chuyên thiết kế UI/UX cho website và ứng dụng di động, có kinh nghiệm với Figma và Adobe XD...',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop'],
    portfolio: ['Dự án A', 'Dự án B', 'Dự án C'],
    location: 'Đà Nẵng',
    education: 'Đại học Kiến trúc Đà Nẵng',
    languages: ['Tiếng Việt', 'Tiếng Anh'],
    certifications: ['Google UX Design', 'Adobe Certified Expert']
  },
  {
    id: 2,
    name: 'Trần Thị B',
    skill: 'Pha chế',
    exp: '1 năm',
    avatar: '/avatars/user2.jpg',
    rating: 4.5,
    completedJobs: 8,
    description: 'Chuyên pha chế các loại cà phê và trà sữa, có chứng chỉ barista chuyên nghiệp...',
    skills: ['Barista', 'Latte Art', 'Menu Development'],
    portfolio: ['Quán Cafe X', 'Quán Trà Y'],
    location: 'Hải Châu',
    education: 'Trường Cao đẳng Du lịch Đà Nẵng',
    languages: ['Tiếng Việt'],
    certifications: ['Barista Professional', 'Food Safety']
  }
];

export default function FreelancerDetail({ params }: { params: { id: string } }) {
  const freelancer = freelancers.find(f => f.id === Number(params.id));
  if (!freelancer) return notFound();

  // Thêm mock contact info cho nhà tuyển dụng
  const contactInfo = {
    email: 'freelancer@example.com',
    phone: '0123 456 789',
    zalo: 'https://zalo.me/123456789',
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link href="/freelancers" className="text-blue-600 hover:underline mb-4 inline-block">← Quay lại danh sách ứng viên</Link>
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold">
              {freelancer.name.charAt(0)}
            </div>
          </div>
          <div className="mt-2 text-center">
            <h2 className="text-2xl font-bold text-blue-900">{freelancer.name}</h2>
            <p className="text-gray-600">{freelancer.skill} - {freelancer.exp} kinh nghiệm</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-lg ${i < Math.round(freelancer.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
              <span className="ml-1 text-gray-600">{freelancer.rating}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{freelancer.completedJobs} dự án đã hoàn thành</div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Giới thiệu</h3>
          <p className="text-gray-700 mb-4">{freelancer.description}</p>
          <div className="mb-4">
            <h4 className="font-semibold">Kỹ năng:</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {freelancer.skills.map((skill, idx) => (
                <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">{skill}</span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold">Portfolio:</h4>
            <ul className="list-disc list-inside text-gray-700">
              {freelancer.portfolio.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold">Thông tin khác:</h4>
            <ul className="list-disc list-inside text-gray-700">
              <li><b>Địa điểm:</b> {freelancer.location}</li>
              <li><b>Học vấn:</b> {freelancer.education}</li>
              <li><b>Ngôn ngữ:</b> {freelancer.languages.join(', ')}</li>
              <li><b>Chứng chỉ:</b> {freelancer.certifications.join(', ')}</li>
            </ul>
          </div>
          <div className="mb-4">
            <h4 className="font-semibold">Thông tin liên hệ:</h4>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-2">
              <p className="text-sm text-blue-900 mb-2">
                Bạn có thể liên hệ trực tiếp với ứng viên qua các kênh dưới đây để trao đổi công việc, phỏng vấn hoặc hợp tác. Vui lòng liên hệ trong giờ hành chính (8:00 - 17:30, Thứ 2 - Thứ 7).
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li><b>Email:</b> <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">{contactInfo.email}</a></li>
                <li><b>Điện thoại:</b> <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:underline">{contactInfo.phone}</a></li>
                <li><b>Zalo:</b> <a href={contactInfo.zalo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Liên hệ Zalo</a></li>
              </ul>
              <div className="mt-2 text-xs text-gray-500 italic">
                * Lưu ý: Hãy chuẩn bị nội dung trao đổi rõ ràng, chuyên nghiệp để tăng khả năng hợp tác thành công.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 