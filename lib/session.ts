import { createSessionClient, createAdminClient } from "./appwrite";
import { cookies } from "next/headers";

export async function getSessionUser() {
  try {
    // Check for mock admin session bypass first
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("appwrite-session");
    if (sessionCookie?.value === "mock-admin-session-secret") {
      return {
        uid: "admin-user-id",
        phone: "",
        email: "admin@silohni.com",
        role: "admin",
        name: "Silohni Admin",
      };
    }

    // 1. Get the authenticated session client
    const { account } = await createSessionClient();
    
    // 2. Fetch the user details from Appwrite Auth
    const appwriteUser = await account.get();
    if (!appwriteUser) {
      return null;
    }

    // 3. Fetch custom profile attributes (like role) from Appwrite Database
    const { databases } = createAdminClient();
    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const collectionId = process.env.APPWRITE_USERS_COLLECTION_ID || "users";

    try {
      const userDoc = await databases.getDocument(databaseId, collectionId, appwriteUser.$id);
      const userEmail = userDoc.email || appwriteUser.email || "";
      const isAdmin = userEmail === "admin@silohni.com";
      return {
        uid: appwriteUser.$id,
        phone: userDoc.phone || appwriteUser.phone || "",
        email: userEmail,
        role: isAdmin ? "admin" : "member",
        name: userDoc.name || appwriteUser.name || `User ${userEmail.split('@')[0] || "Member"}`,
      };
    } catch (dbError) {
      // If the database document is not found, return the basic auth info
      const userEmail = appwriteUser.email || "";
      const isAdmin = userEmail === "admin@silohni.com";
      return {
        uid: appwriteUser.$id,
        phone: appwriteUser.phone || "",
        email: userEmail,
        role: isAdmin ? "admin" : "member",
        name: appwriteUser.name || `User ${userEmail.split('@')[0] || "Member"}`,
      };
    }
  } catch (error) {
    // User is not logged in or session has expired
    return null;
  }
}

