"use client";

import React, { useState, useEffect } from "react";
import { Job } from "@/src/app/types/job";

export type JobApplyModalProps = {
  open: boolean;
  onClose: () => void;
  job: Job;
};

export default function JobApplyModal({ open, onClose, job }: JobApplyModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cv: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setForm({ name: "", email: "", phone: "", cv: "", message: "" });
      setMessage("");
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jobId: job.id }),
      });
      const data = await res.json();
      console.log('Application response:', data);
      
      // Handle nested response structure
      const isSuccess = data.success && (data.data?.success !== false);
      if (isSuccess) {
        setMessage("Ứng tuyển thành công!");
        setTimeout(() => {
          setForm({ name: "", email: "", phone: "", cv: "", message: "" });
          onClose();
        }, 1200);
      } else {
        setMessage("Ứng tuyển thất bại!");
      }
    } catch (err) {
      console.error(err);
      setMessage("Đã có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative animate-fadeIn">
        <button
          className="absolute top-3 right-4 text-gray-400 text-2xl hover:text-gray-700 transition"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold text-center text-blue-800 mb-4">
          Ứng tuyển: {job.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Họ tên"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Số điện thoại"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="cv"
            value={form.cv}
            onChange={handleChange}
            placeholder="Link CV"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tin nhắn (tùy chọn)"
            className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi ứng tuyển"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Hủy
            </button>
          </div>
        </form>

        {message && (
          <p className="text-center mt-3 text-sm text-green-700">{message}</p>
        )}
      </div>
    </div>
  );
}
