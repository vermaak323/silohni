import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export async function GET() {
  try {
    const { databases } = createAdminClient();
    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const collectionId = process.env.APPWRITE_PRODUCTS_COLLECTION_ID || "products";

    const response = await databases.listDocuments(databaseId, collectionId, [
      Query.orderDesc("$createdAt")
    ]);
    return NextResponse.json(response.documents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, price, stock, imageUrl } = await request.json();
    if (!name || !category || !price || stock === undefined || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { databases } = createAdminClient();
    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const collectionId = process.env.APPWRITE_PRODUCTS_COLLECTION_ID || "products";

    const product = await databases.createDocument(
      databaseId,
      collectionId,
      "unique()",
      {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl,
      }
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { productId, name, category, price, stock, imageUrl } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const { databases } = createAdminClient();
    const databaseId = process.env.APPWRITE_DATABASE_ID!;
    const collectionId = process.env.APPWRITE_PRODUCTS_COLLECTION_ID || "products";

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock, 10);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedProduct = await databases.updateDocument(
      databaseId,
      collectionId,
      productId,
      updateData
    );

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Product PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

