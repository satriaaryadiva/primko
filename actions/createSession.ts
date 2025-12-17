"use server";

import { cookies } from "next/headers";

export async function createSession(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 hari = 1 bulan
  });

  return { message: "Session dibuat (1 bulan)" };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { message: "Session dihapus" };
}
