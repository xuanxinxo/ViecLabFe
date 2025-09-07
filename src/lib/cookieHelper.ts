import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "adminToken";

export const serverCookieHelper = {
  /** Dùng trong server component / server action*/
  getToken: (): string | null => {
    const cookieStore = cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
  },

  setToken: (token: string, maxAgeSeconds: number = 86400) => {
    const cookieStore = cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: maxAgeSeconds,
      path: "/",
      sameSite: "lax",
    });
  },

  deleteToken: () => {
    cookies().delete(COOKIE_NAME);
  },

  /** Dùng trong API Route (Route Handler)*/
  setTokenToResponse: (
    response: NextResponse,
    token: string,
    maxAgeSeconds: number = 86400
  ) => {
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: maxAgeSeconds,
      path: "/",
      sameSite: "lax",
    });
  },

  deleteTokenFromResponse: (response: NextResponse) => {
    response.cookies.set({
      name: COOKIE_NAME,
      value: "",
      maxAge: 0,
      path: "/",
    });
  },
};
