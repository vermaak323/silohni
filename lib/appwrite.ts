import { Client as ServerClient, Account as ServerAccount, Databases as ServerDatabases, Users as ServerUsers } from "node-appwrite";
import { cookies } from "next/headers";

export function createAdminClient() {
  const client = new ServerClient()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "");

  return {
    get account() { return new ServerAccount(client); },
    get databases() { return new ServerDatabases(client); },
    get users() { return new ServerUsers(client); }
  };
}

export async function createSessionClient() {
  const client = new ServerClient()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");
  if (session?.value) {
    client.setSession(session.value);
  }

  return {
    get account() { return new ServerAccount(client); },
    get databases() { return new ServerDatabases(client); }
  };
}
