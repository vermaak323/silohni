import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { getSessionUser } from "@/lib/session";
import { Query } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const { items, shippingAddress } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Missing cart items or shipping address." }, { status: 400 });
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const productsCollectionId = process.env.APPWRITE_PRODUCTS_COLLECTION_ID || "products";
    const ordersCollectionId = process.env.APPWRITE_ORDERS_COLLECTION_ID || "orders";
    const { databases } = createAdminClient();

    const orderItems = [];
    let secureTotal = 0;

    // Securely compute prices on the server and check stock
    for (const item of items) {
      let dbProduct;
      try {
        dbProduct = await databases.getDocument(databaseId, productsCollectionId, item.productId);
      } catch (err: any) {
        return NextResponse.json({ error: `Product not found: ${item.name || item.productId}` }, { status: 404 });
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock} left.` }, { status: 400 });
      }

      // Decrement stock
      const newStock = dbProduct.stock - item.quantity;
      await databases.updateDocument(databaseId, productsCollectionId, dbProduct.$id, {
        stock: newStock,
      });

      const itemTotal = dbProduct.price * item.quantity;
      secureTotal += itemTotal;

      orderItems.push({
        productId: dbProduct.$id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        imageUrl: dbProduct.imageUrl,
      });
    }

    // Create the order document (storing structured items/address as JSON strings for simplicity)
    const newOrder = await databases.createDocument(
      databaseId,
      ordersCollectionId,
      "unique()",
      {
        userPhone: user.phone,
        items: JSON.stringify(orderItems),
        totalAmount: secureTotal,
        shippingAddress: JSON.stringify({
          fullName: shippingAddress.fullName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        }),
        status: "Processing",
      }
    );

    // Format order for response
    const formattedOrder = {
      ...newOrder,
      items: orderItems,
      shippingAddress: shippingAddress,
    };

    return NextResponse.json(formattedOrder, { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const ordersCollectionId = process.env.APPWRITE_ORDERS_COLLECTION_ID || "orders";
    const { databases } = createAdminClient();

    const response = await databases.listDocuments(databaseId, ordersCollectionId, [
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
