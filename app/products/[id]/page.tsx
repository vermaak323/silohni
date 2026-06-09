"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "../../page.module.css";

interface Product {
  id: string;
  src: string;
  alt: string;
  tag: string;
  name: string;
  price: string;
  category: string;
  otherImageUrls?: string[];
  originalPrice?: number | null;
  sizes?: string[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      try {
        setIsLoading(true);

        // Check if dynamic product exists in DB
        const res = await fetch("/api/products");
        let dbProduct: Product | null = null;
        if (res.ok) {
          const data = await res.json();
          const match = data.find((p: any) => p.$id === productId);
          if (match) {
            let parsedOthers: string[] = [];
            if (match.otherImageUrls) {
              try {
                parsedOthers = JSON.parse(match.otherImageUrls);
              } catch (e) {
                parsedOthers = [];
              }
            }
            let parsedSizes: string[] = [];
            if (match.sizes) {
              try {
                parsedSizes = JSON.parse(match.sizes);
              } catch (e) {
                if (typeof match.sizes === "string") {
                  parsedSizes = match.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
                }
              }
            }
            dbProduct = {
              id: match.$id,
              src: match.imageUrl,
              alt: match.name,
              tag: match.category,
              name: match.name,
              price: `₹${match.price.toFixed(2)}`,
              category: match.category,
              otherImageUrls: parsedOthers,
              originalPrice: match.originalPrice || null,
              sizes: parsedSizes
            };
          }
        }

        // Check fallback static list
        const staticList: Product[] = [
          { id: "latest-1", src: "/images/latest_1.png", alt: "Minimalist handcrafted ceramic vase", tag: "Studio Pottery", name: "Minimalist Terracotta Vase", price: "₹72.00", category: "Pottery" },
          { id: "latest-2", src: "/images/latest_2.png", alt: "Premium handwoven wool throw blanket", tag: "Artisan Textiles", name: "Woven Wool Throw Blanket", price: "₹145.00", category: "Textiles" },
          { id: "latest-3", src: "/images/latest_3.png", alt: "Handcrafted dark espresso leather tote bag", tag: "Bespoke Leather", name: "Espresso Leather Tote", price: "₹280.00", category: "Leather" },
          { id: "latest-4", src: "/images/best_2.png", alt: "Artisan Ceramic Tableware Collection", tag: "Studio Pottery", name: "Ceramic Tableware Set", price: "₹110.00", category: "Pottery" },
          { id: "latest-5", src: "/images/best_4.png", alt: "Organic Spun Yarn and Threads", tag: "Artisan Textiles", name: "Spun Linen Yarn Pack", price: "₹55.00", category: "Textiles" },
        ];

        const staticMatch = staticList.find(p => p.id === productId);
        setProduct(dbProduct || staticMatch || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.src);
    }
  }, [product]);

  // Read current cart length
  useEffect(() => {
    const savedCart = localStorage.getItem("silohni_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const totalQty = parsed.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCartCount(totalQty);
      } catch (e) {}
    }
  }, [successMsg]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size before adding to the bag.");
      return;
    }

    const savedCart = localStorage.getItem("silohni_cart");
    let cart: any[] = [];
    if (savedCart) {
      try {
        cart = JSON.parse(savedCart);
      } catch (e) {}
    }

    const existing = cart.find(item => item.id === product.id && item.size === selectedSize);
    const cleanedPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));

    if (existing) {
      cart = cart.map(item =>
        (item.id === product.id && item.size === selectedSize) ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: cleanedPrice,
        quantity: 1,
        src: product.src,
        size: selectedSize
      });
    }

    localStorage.setItem("silohni_cart", JSON.stringify(cart));
    setSuccessMsg(`Item (${selectedSize ? `Size ${selectedSize}` : "One Size"}) added to your shopping bag!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
        <p style={{ color: "var(--color-warm-gray)" }}>Gathering studio product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--bg-page)", gap: "20px" }}>
        <p style={{ color: "var(--color-warm-gray)" }}>Creation not found.</p>
        <button onClick={() => router.push("/products")} className={styles.heroBtn}>Back to All Products</button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Mini header */}
      <header className={styles.header} style={{ position: "static", backgroundColor: "var(--bg-header)" }}>
        <div className={styles.headerInner}>
          <div className={styles.logo} onClick={() => router.push("/")}>
            <Image
              src="/silohniLogoLight.png"
              alt="Silohni Logo"
              width={60}
              height={40}
              priority
            />
          </div>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/products" className={styles.navLink}>All Products</Link>
          </nav>
          <div className={styles.actions}>
            <div className={styles.actionIcon} style={{ position: "relative" }} onClick={() => router.push("/")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "var(--color-rose-taupe)",
                  color: "white",
                  fontSize: "9px",
                  fontWeight: "bold",
                  borderRadius: "50%",
                  width: "15px",
                  height: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "60px auto 0 auto", padding: "0 24px" }}>
        <button 
          onClick={() => router.push("/products")} 
          style={{ background: "none", border: "none", color: "var(--color-rose-taupe)", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", marginBottom: "32px" }}
        >
          &larr; Back to Catalog
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }} id="product-detail-layout">
          {/* Product image */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(120, 108, 102, 0.15)", boxShadow: "0 15px 30px rgba(120, 108, 102, 0.08)" }}>
              <img
                src={activeImage || product.src}
                alt={product.alt}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            {/* Thumbnail Gallery */}
            {product.otherImageUrls && product.otherImageUrls.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {/* Main image thumbnail first */}
                <div
                  onClick={() => setActiveImage(product.src)}
                  style={{
                    position: "relative",
                    width: "70px",
                    height: "70px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: (activeImage || product.src) === product.src ? "2px solid var(--color-rose-taupe)" : "1px solid rgba(120, 108, 102, 0.2)",
                    cursor: "pointer",
                    transition: "border 0.2s ease"
                  }}
                >
                  <img src={product.src} alt="Main view thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                {/* Other images */}
                {product.otherImageUrls.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(url)}
                    style={{
                      position: "relative",
                      width: "70px",
                      height: "70px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      border: activeImage === url ? "2px solid var(--color-rose-taupe)" : "1px solid rgba(120, 108, 102, 0.2)",
                      cursor: "pointer",
                      transition: "border 0.2s ease"
                    }}
                  >
                    <img src={url} alt={`Gallery thumbnail ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

           {/* Product details info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span className={styles.carouselCardTag} style={{ textTransform: "uppercase" }}>{product.category}</span>
              <h1 style={{ fontFamily: "var(--font-serif), serif", fontSize: "36px", color: "var(--color-dark-espresso)", margin: "12px 0 8px 0", fontWeight: "600", lineHeight: "1.2" }}>
                {product.name}
              </h1>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-rose-taupe)" }}>{product.price}</span>
                {product.originalPrice && (
                  <span style={{ fontSize: "18px", color: "var(--color-warm-gray)", textDecoration: "line-through" }}>
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", color: "var(--color-dark-espresso)", letterSpacing: "1px" }}>
                  Select Size
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  {product.sizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          minWidth: "40px",
                          height: "40px",
                          borderRadius: "4px",
                          border: isSelected ? "2px solid var(--color-dark-espresso)" : "1px solid rgba(120, 108, 102, 0.3)",
                          backgroundColor: isSelected ? "var(--color-dark-espresso)" : "transparent",
                          color: isSelected ? "white" : "var(--color-dark-espresso)",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 12px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px solid rgba(120, 108, 102, 0.15)", paddingTop: "24px" }}>
              <p style={{ color: "var(--color-warm-gray)", fontSize: "15px", lineHeight: "1.7", margin: 0 }}>
                This boutique piece is meticulously created by local artisans using completely organic, sustainably harvested materials. Every single item represents an individual journey of patience, craftsmanship, and refined design.
              </p>
            </div>

            {successMsg && (
              <div style={{ backgroundColor: "#e2f0d9", color: "#385723", padding: "12px 16px", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}>
                ✓ {successMsg}
              </div>
            )}

            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              <button 
                onClick={handleAddToCart} 
                className={styles.heroBtn} 
                style={{ margin: 0, padding: "16px 32px", fontSize: "14px", height: "auto", flex: 1, backgroundColor: "var(--color-dark-espresso)", color: "white" }}
              >
                Add to Shopping Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
