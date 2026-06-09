import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { getSessionUser } from "@/lib/session";
import { Query } from "node-appwrite";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const ordersCollectionId = process.env.APPWRITE_ORDERS_COLLECTION_ID || "orders";
    const { databases } = createAdminClient();

    const response = await databases.listDocuments(databaseId, ordersCollectionId, [
      Query.equal("userPhone", user.phone),
      Query.orderDesc("$createdAt")
    ]);

    const formattedOrders = response.documents.map((doc) => {
      let items = [];
      let shippingAddress = {};
      try {
        items = JSON.parse(doc.items);
      } catch (e) {}
      try {
        shippingAddress = JSON.parse(doc.shippingAddress);
      } catch (e) {}

      return {
        ...doc,
        items,
        shippingAddress,
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
