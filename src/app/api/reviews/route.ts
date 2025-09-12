import { NextRequest, NextResponse } from 'next/server';

import { addCorsHeaders, createCorsOptionsResponse } from '@/lib/corsHelper';
// Mock data cho bảng xếp hạng sao
const mockReviews = [
  // 5 sao - Nhân sự
  {
    id: 1,
    category: 'talent',
    name: 'Nguyễn Văn Minh',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'Đầu bếp trưởng',
    experience: 8,
    hometown: 'Đà Nẵng',
    content: 'Kinh nghiệm dày dặn, kỹ năng nấu ăn xuất sắc, quản lý đội nhóm tốt.',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    category: 'talent',
    name: 'Trần Thị Hương',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    title: 'Quản lý nhà hàng',
    experience: 6,
    hometown: 'Hồ Chí Minh',
    content: 'Quản lý xuất sắc, có tầm nhìn chiến lược, team work tốt.',
    createdAt: '2024-01-14T09:30:00Z'
  },
  {
    id: 3,
    category: 'talent',
    name: 'Lê Hoàng Nam',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Bartender chuyên nghiệp',
    experience: 5,
    hometown: 'Hà Nội',
    content: 'Kỹ năng pha chế đỉnh cao, sáng tạo trong cocktail, giao tiếp tốt.',
    createdAt: '2024-01-13T14:20:00Z'
  },

  // 5 sao - Doanh nghiệp
  {
    id: 4,
    category: 'company',
    name: 'Esco Beach Da Nang',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop',
    title: 'Resort & Restaurant',
    experience: 10,
    hometown: 'Đà Nẵng',
    content: 'Môi trường làm việc chuyên nghiệp, chế độ đãi ngộ tốt, cơ hội thăng tiến.',
    createdAt: '2024-01-12T16:45:00Z'
  },
  {
    id: 5,
    category: 'company',
    name: 'Highlands Coffee',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop',
    title: 'Coffee Chain',
    experience: 15,
    hometown: 'Toàn quốc',
    content: 'Thương hiệu uy tín, đào tạo nhân viên bài bản, môi trường năng động.',
    createdAt: '2024-01-11T11:15:00Z'
  },
  {
    id: 6,
    category: 'company',
    name: 'Fivitel Hotel',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&h=150&fit=crop',
    title: 'Khách sạn 4 sao',
    experience: 8,
    hometown: 'Đà Nẵng',
    content: 'Tiêu chuẩn quốc tế, dịch vụ chuyên nghiệp, cơ hội học hỏi nhiều.',
    createdAt: '2024-01-10T13:30:00Z'
  },

  // 4 sao - Nhân sự
  {
    id: 7,
    category: 'talent',
    name: 'Phạm Thị Lan',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    title: 'Phục vụ trưởng',
    experience: 4,
    hometown: 'Quảng Nam',
    content: 'Nhiệt tình, chăm chỉ, kỹ năng giao tiếp tốt với khách hàng.',
    createdAt: '2024-01-09T08:20:00Z'
  },
  {
    id: 8,
    category: 'talent',
    name: 'Hoàng Văn Đức',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    title: 'Bếp phó',
    experience: 6,
    hometown: 'Huế',
    content: 'Kỹ năng nấu ăn tốt, có kinh nghiệm quản lý, học hỏi nhanh.',
    createdAt: '2024-01-08T15:10:00Z'
  },
  {
    id: 9,
    category: 'talent',
    name: 'Nguyễn Thị Mai',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    title: 'Lễ tân',
    experience: 3,
    hometown: 'Đà Nẵng',
    content: 'Giao tiếp tiếng Anh tốt, ngoại hình ưa nhìn, thái độ phục vụ chuyên nghiệp.',
    createdAt: '2024-01-07T12:45:00Z'
  },

  // 4 sao - Doanh nghiệp
  {
    id: 10,
    category: 'company',
    name: 'VinMart',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    title: 'Siêu thị',
    experience: 12,
    hometown: 'Toàn quốc',
    content: 'Môi trường ổn định, chế độ lương thưởng hợp lý, có cơ hội thăng tiến.',
    createdAt: '2024-01-06T10:30:00Z'
  },
  {
    id: 11,
    category: 'company',
    name: 'ShopeeFood',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop',
    title: 'Delivery Service',
    experience: 5,
    hometown: 'Toàn quốc',
    content: 'Linh hoạt về thời gian, thu nhập ổn định, môi trường năng động.',
    createdAt: '2024-01-05T14:20:00Z'
  },
  {
    id: 12,
    category: 'company',
    name: 'Nhà hàng Gogi',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&h=150&fit=crop',
    title: 'Nhà hàng BBQ',
    experience: 7,
    hometown: 'Đà Nẵng',
    content: 'Môi trường làm việc thân thiện, học hỏi được nhiều kỹ năng mới.',
    createdAt: '2024-01-04T16:15:00Z'
  },

  // 3 sao - Nhân sự
  {
    id: 13,
    category: 'talent',
    name: 'Võ Thị Hoa',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên phục vụ',
    experience: 2,
    hometown: 'Quảng Ngãi',
    content: 'Chăm chỉ, có tiềm năng phát triển, cần cải thiện kỹ năng giao tiếp.',
    createdAt: '2024-01-03T09:45:00Z'
  },
  {
    id: 14,
    category: 'talent',
    name: 'Đặng Văn Tùng',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    title: 'Phụ bếp',
    experience: 1,
    hometown: 'Đà Nẵng',
    content: 'Nhiệt tình, muốn học hỏi, cần thêm kinh nghiệm và kỹ năng.',
    createdAt: '2024-01-02T11:30:00Z'
  },
  {
    id: 15,
    category: 'talent',
    name: 'Lý Thị Nga',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    title: 'Thu ngân',
    experience: 2,
    hometown: 'Bình Định',
    content: 'Cẩn thận, trung thực, cần cải thiện tốc độ xử lý giao dịch.',
    createdAt: '2024-01-01T13:20:00Z'
  },

  // 3 sao - Doanh nghiệp
  {
    id: 16,
    category: 'company',
    name: 'An\'s Cafe',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop',
    title: 'Quán cà phê',
    experience: 3,
    hometown: 'Đà Nẵng',
    content: 'Môi trường thân thiện, nhưng cần cải thiện chế độ đãi ngộ.',
    createdAt: '2023-12-31T15:10:00Z'
  },
  {
    id: 17,
    category: 'company',
    name: 'Mỳ Truyền Thống',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=150&h=150&fit=crop',
    title: 'Quán mỳ',
    experience: 5,
    hometown: 'Đà Nẵng',
    content: 'Công việc ổn định, nhưng cần cải thiện môi trường làm việc.',
    createdAt: '2023-12-30T10:45:00Z'
  },
  {
    id: 18,
    category: 'company',
    name: 'Trạm Beer',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop',
    title: 'Quán bia',
    experience: 4,
    hometown: 'Đà Nẵng',
    content: 'Môi trường năng động, nhưng giờ làm việc không ổn định.',
    createdAt: '2023-12-29T18:30:00Z'
  },

  // 2 sao - Nhân sự
  {
    id: 19,
    category: 'talent',
    name: 'Bùi Văn Hùng',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'Bảo vệ',
    experience: 1,
    hometown: 'Quảng Nam',
    content: 'Cần cải thiện thái độ làm việc và tính kỷ luật.',
    createdAt: '2023-12-28T08:15:00Z'
  },
  {
    id: 20,
    category: 'talent',
    name: 'Ngô Thị Linh',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên dọn dẹp',
    experience: 1,
    hometown: 'Đà Nẵng',
    content: 'Cần cải thiện hiệu suất công việc và thái độ.',
    createdAt: '2023-12-27T14:20:00Z'
  },

  // 2 sao - Doanh nghiệp
  {
    id: 21,
    category: 'company',
    name: 'SHB',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop',
    title: 'Ngân hàng',
    experience: 20,
    hometown: 'Toàn quốc',
    content: 'Cần cải thiện môi trường làm việc và chế độ đãi ngộ.',
    createdAt: '2023-12-26T11:30:00Z'
  },
  {
    id: 22,
    category: 'company',
    name: 'Katinat',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop',
    title: 'Quán cà phê',
    experience: 8,
    hometown: 'Đà Nẵng',
    content: 'Cần cải thiện quản lý và môi trường làm việc.',
    createdAt: '2023-12-25T16:45:00Z'
  },

  // 1 sao - Nhân sự
  {
    id: 23,
    category: 'talent',
    name: 'Lê Văn Tuấn',
    rating: 1,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên tạm thời',
    experience: 0,
    hometown: 'Đà Nẵng',
    content: 'Cần cải thiện nghiêm túc về thái độ và kỹ năng làm việc.',
    createdAt: '2023-12-24T09:20:00Z'
  },

  // 1 sao - Doanh nghiệp
  {
    id: 24,
    category: 'company',
    name: 'Lão Đại',
    rating: 1,
    avatar: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop',
    title: 'Quán ăn',
    experience: 2,
    hometown: 'Đà Nẵng',
    content: 'Cần cải thiện toàn diện về quản lý và môi trường làm việc.',
    createdAt: '2023-12-23T13:15:00Z'
  },

  // Thêm data để đầy đủ hơn - 5 sao
  {
    id: 25,
    category: 'talent',
    name: 'Phạm Minh Tuấn',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'Quản lý bar',
    experience: 7,
    hometown: 'Hồ Chí Minh',
    content: 'Kỹ năng quản lý xuất sắc, am hiểu về rượu và cocktail, giao tiếp tốt.',
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 26,
    category: 'talent',
    name: 'Nguyễn Thị Hoa',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    title: 'Đầu bếp bánh',
    experience: 9,
    hometown: 'Hà Nội',
    content: 'Chuyên gia làm bánh, sáng tạo trong menu, quản lý bếp bánh hiệu quả.',
    createdAt: '2024-01-19T14:45:00Z'
  },
  {
    id: 27,
    category: 'company',
    name: 'Marriott Hotel',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&h=150&fit=crop',
    title: 'Khách sạn 5 sao',
    experience: 25,
    hometown: 'Toàn quốc',
    content: 'Thương hiệu quốc tế uy tín, môi trường làm việc chuyên nghiệp, cơ hội thăng tiến tốt.',
    createdAt: '2024-01-18T16:20:00Z'
  },
  {
    id: 28,
    category: 'company',
    name: 'Starbucks Vietnam',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop',
    title: 'Coffee Chain',
    experience: 12,
    hometown: 'Toàn quốc',
    content: 'Môi trường làm việc năng động, đào tạo bài bản, chế độ đãi ngộ tốt.',
    createdAt: '2024-01-17T11:15:00Z'
  },

  // Thêm data 4 sao
  {
    id: 29,
    category: 'talent',
    name: 'Trần Văn Long',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Quản lý kho',
    experience: 5,
    hometown: 'Đà Nẵng',
    content: 'Quản lý kho hiệu quả, có kinh nghiệm về logistics, trách nhiệm cao.',
    createdAt: '2024-01-16T09:30:00Z'
  },
  {
    id: 30,
    category: 'talent',
    name: 'Lê Thị Mai',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên marketing',
    experience: 4,
    hometown: 'Quảng Nam',
    content: 'Sáng tạo trong marketing, có kinh nghiệm digital marketing, làm việc nhóm tốt.',
    createdAt: '2024-01-15T13:20:00Z'
  },
  {
    id: 31,
    category: 'company',
    name: 'Big C Supercenter',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    title: 'Siêu thị',
    experience: 15,
    hometown: 'Toàn quốc',
    content: 'Môi trường làm việc ổn định, có cơ hội học hỏi, chế độ lương thưởng hợp lý.',
    createdAt: '2024-01-14T15:45:00Z'
  },
  {
    id: 32,
    category: 'company',
    name: 'Grab Vietnam',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=150&fit=crop',
    title: 'Tech Company',
    experience: 8,
    hometown: 'Toàn quốc',
    content: 'Môi trường startup năng động, cơ hội phát triển kỹ năng, lương cạnh tranh.',
    createdAt: '2024-01-13T12:10:00Z'
  },

  // Thêm data 3 sao
  {
    id: 33,
    category: 'talent',
    name: 'Hoàng Văn Dũng',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên bảo trì',
    experience: 3,
    hometown: 'Huế',
    content: 'Có kinh nghiệm cơ bản, chăm chỉ, cần cải thiện kỹ năng chuyên môn.',
    createdAt: '2024-01-12T08:25:00Z'
  },
  {
    id: 34,
    category: 'talent',
    name: 'Võ Thị Lan',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên kế toán',
    experience: 2,
    hometown: 'Quảng Ngãi',
    content: 'Cẩn thận, trung thực, cần cải thiện tốc độ xử lý và kỹ năng Excel.',
    createdAt: '2024-01-11T10:40:00Z'
  },
  {
    id: 35,
    category: 'company',
    name: 'Circle K',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    title: 'Convenience Store',
    experience: 10,
    hometown: 'Toàn quốc',
    content: 'Môi trường làm việc ổn định, nhưng cần cải thiện chế độ đãi ngộ.',
    createdAt: '2024-01-10T14:15:00Z'
  },
  {
    id: 36,
    category: 'company',
    name: 'Lotteria Vietnam',
    rating: 3,
    avatar: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=150&h=150&fit=crop',
    title: 'Fast Food',
    experience: 6,
    hometown: 'Toàn quốc',
    content: 'Công việc ổn định, nhưng áp lực cao, cần cải thiện môi trường làm việc.',
    createdAt: '2024-01-09T16:30:00Z'
  },

  // Thêm data 2 sao
  {
    id: 37,
    category: 'talent',
    name: 'Đặng Văn Hải',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên giao hàng',
    experience: 1,
    hometown: 'Bình Định',
    content: 'Cần cải thiện thái độ làm việc và tính đúng giờ.',
    createdAt: '2024-01-08T07:20:00Z'
  },
  {
    id: 38,
    category: 'talent',
    name: 'Ngô Thị Hương',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên bán hàng',
    experience: 1,
    hometown: 'Quảng Nam',
    content: 'Cần cải thiện kỹ năng giao tiếp và thái độ phục vụ khách hàng.',
    createdAt: '2024-01-07T11:45:00Z'
  },
  {
    id: 39,
    category: 'company',
    name: 'FamilyMart',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    title: 'Convenience Store',
    experience: 8,
    hometown: 'Toàn quốc',
    content: 'Cần cải thiện môi trường làm việc và chế độ đãi ngộ nhân viên.',
    createdAt: '2024-01-06T13:20:00Z'
  },
  {
    id: 40,
    category: 'company',
    name: 'Jollibee Vietnam',
    rating: 2,
    avatar: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=150&h=150&fit=crop',
    title: 'Fast Food',
    experience: 5,
    hometown: 'Toàn quốc',
    content: 'Cần cải thiện quản lý và môi trường làm việc cho nhân viên.',
    createdAt: '2024-01-05T15:10:00Z'
  },

  // Thêm data 1 sao
  {
    id: 41,
    category: 'talent',
    name: 'Bùi Văn Thành',
    rating: 1,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên tạm thời',
    experience: 0,
    hometown: 'Quảng Ngãi',
    content: 'Cần cải thiện nghiêm túc về thái độ và kỹ năng làm việc.',
    createdAt: '2024-01-04T09:15:00Z'
  },
  {
    id: 42,
    category: 'talent',
    name: 'Lý Thị Nga',
    rating: 1,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    title: 'Nhân viên thử việc',
    experience: 0,
    hometown: 'Bình Định',
    content: 'Cần cải thiện toàn diện về kỹ năng và thái độ làm việc.',
    createdAt: '2024-01-03T12:30:00Z'
  },
  {
    id: 43,
    category: 'company',
    name: 'Quán ăn vỉa hè',
    rating: 1,
    avatar: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=150&h=150&fit=crop',
    title: 'Quán ăn nhỏ',
    experience: 1,
    hometown: 'Đà Nẵng',
    content: 'Cần cải thiện toàn diện về quản lý, môi trường và chế độ làm việc.',
    createdAt: '2024-01-02T14:45:00Z'
  },
  {
    id: 44,
    category: 'company',
    name: 'Cửa hàng tạp hóa',
    rating: 1,
    avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&h=150&fit=crop',
    title: 'Tạp hóa',
    experience: 2,
    hometown: 'Quảng Nam',
    content: 'Cần cải thiện nghiêm túc về quản lý và môi trường làm việc.',
    createdAt: '2024-01-01T10:20:00Z'
  }
];


// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    console.log('[REVIEWS API] Fetching reviews data...');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rating = searchParams.get('rating');
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');
    
    let filteredReviews = [...mockReviews];
    
    // Filter by category
    if (category && (category === 'talent' || category === 'company')) {
      filteredReviews = filteredReviews.filter(review => review.category === category);
    }
    
    // Filter by rating
    if (rating) {
      const ratingNum = parseInt(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        filteredReviews = filteredReviews.filter(review => review.rating === ratingNum);
      }
    }
    
    // Filter by status (mock all as approved)
    if (status === 'approved') {
      // All mock reviews are approved
    }
    
    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      filteredReviews = filteredReviews.slice(0, limitNum);
    }
    
    console.log(`[REVIEWS API] Returning ${filteredReviews.length} reviews`);
    
    const response = NextResponse.json({
      success: true,
      data: filteredReviews,
      count: filteredReviews.length,
      pagination: {
        total: mockReviews.length,
        page: 1,
        limit: limit ? parseInt(limit);
    return addCorsHeaders(response); : filteredReviews.length,
        totalPages: 1
      }
    });
    
  } catch (err) {
    console.error('Error in reviews API:', err);
    
    const response = NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tải danh sách đánh giá',
        details: process.env.NODE_ENV === 'development' ? {
          message: err instanceof Error ? err.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, name, rating, title, content, experience, hometown } = body;
    
    if (!category || !name || !rating) {
      const response = NextResponse.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
    return addCorsHeaders(response);
    }
    
    // Mock create review
    const newReview = {
      id: mockReviews.length + 1,
      category,
      name,
      rating,
      title: title || '',
      content: content || '',
      experience: experience || 0,
      hometown: hometown || '',
      avatar: `https://images.unsplash.com/photo-${1507003211169 + Math.random() * 1000000}?w=150&h=150&fit=crop&crop=face`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const response = NextResponse.json(
      { success: true, data: newReview },
      { status: 201 }
    );
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('Error creating review:', error);
    const response = NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo đánh giá mới' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
