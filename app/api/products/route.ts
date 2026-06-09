import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { getSessionUser } from "@/lib/session";
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
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { name, category, price, stock, imageUrl, otherImageUrls, originalPrice, sizes } = await request.json();
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
        otherImageUrls: Array.isArray(otherImageUrls) ? JSON.stringify(otherImageUrls) : (otherImageUrls || ""),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        sizes: Array.isArray(sizes) ? JSON.stringify(sizes) : (sizes || ""),
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
    const user = await getSessionUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { productId, name, category, price, stock, imageUrl, otherImageUrls, originalPrice, sizes } = await request.json();
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
    if (otherImageUrls !== undefined) {
      updateData.otherImageUrls = Array.isArray(otherImageUrls) ? JSON.stringify(otherImageUrls) : otherImageUrls;
    }
    if (originalPrice !== undefined) {
      updateData.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    }
    if (sizes !== undefined) {
      updateData.sizes = Array.isArray(sizes) ? JSON.stringify(sizes) : sizes;
    }

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

