import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { getSessionUser } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { status } = await request.json();
    if (!status || !["Processing", "Shipping", "Completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const { id } = await params;

    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const ordersCollectionId = process.env.APPWRITE_ORDERS_COLLECTION_ID || "orders";
    const { databases } = createAdminClient();

    let updatedOrder;
    try {
      updatedOrder = await databases.updateDocument(databaseId, ordersCollectionId, id, {
        status,
      });
    } catch (err: any) {
      if (err.code === 404) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
      throw err;
    }

    // Format output with deserialized JSON strings for items and shippingAddress
    let items = [];
    let shippingAddress = {};
    try {
      items = JSON.parse(updatedOrder.items);
    } catch (e) {}
    try {
      shippingAddress = JSON.parse(updatedOrder.shippingAddress);
    } catch (e) {}

    const formattedOrder = {
      ...updatedOrder,
      items,
      shippingAddress,
    };

    return NextResponse.json(formattedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
