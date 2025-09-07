"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', name: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (form.password !== form.confirm) {
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.auth.register({
        email: form.email,
        password: form.password,
        name: form.name,
      });
      const payload = res.data;
      if (payload?.success) {
        const user = payload?.data?.user || payload?.user;
        setMessage(`Đăng ký thành công! Xin chào ${user?.name || form.name}`);
        setTimeout(() => router.push('/login?registered=true'), 800);
      } else if (payload?.errors) {
        const errs = Object.values(payload.errors as any).flat().join(' ');
        setMessage(errs);
      } else if (payload?.error || payload?.message) {
        setMessage(payload.error || payload.message);
      } else {
        setMessage('Có lỗi xảy ra');
      }
    } catch (err: any) {
      setMessage(err?.response?.data?.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleRegister} className="relative z-10 flex flex-col md:flex-row bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl p-8 md:p-12 max-w-4xl w-full mx-4">
        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col justify-center space-y-6">
          <h2 className="text-4xl font-bold text-center">Đăng ký</h2>
          {message && <div className="text-center text-red-400">{message}</div>}

          <input
            id="name"
            type="text"
            placeholder="Họ và tên"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <Image src="/icons/eye-slash.svg" alt="Hide" width={20} height={20} />
              ) : (
                <Image src="/icons/eye.svg" alt="Show" width={20} height={20} />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Xác nhận mật khẩu"
              value={form.confirm}
              onChange={handleChange}
              className="w-full p-3 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              {showConfirm ? (
                <Image src="/icons/eye-slash.svg" alt="Hide" width={20} height={20} />
              ) : (
                <Image src="/icons/eye.svg" alt="Show" width={20} height={20} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-xl transition duration-300 disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Đăng ký'}
          </button>
        </div>

        <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg md:rounded-l-none md:ml-4 mt-8 md:mt-0">
          <h2 className="text-4xl italic font-semibold leading-relaxed">
             Chào mừng bạn đã <br /> đến với ViecLab <br /> Nơi tạo nền tảng kết nối
            <br /> minh bạch
          </h2>
        </div>
      </form>
    </div>
  );
}
