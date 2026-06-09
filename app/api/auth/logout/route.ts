import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/appwrite";

export async function POST() {
  try {
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current");
    } catch (sessionErr) {
      // Ignore if session is already invalid or client fails to load
    }

    const cookieStore = await cookies();
    cookieStore.delete("appwrite-session");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
