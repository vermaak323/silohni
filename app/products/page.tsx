"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

interface Product {
  id: string;
  src: string;
  alt: string;
  tag: string;
  name: string;
  price: string;
  category: string;
}

export default function AllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load products dynamic + fallback static
  useEffect(() => {
    async function loadAllProducts() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/products");
        let dbProducts: Product[] = [];
        if (res.ok) {
          const data = await res.json();
          dbProducts = data.map((p: any) => ({
            id: p.$id,
            src: p.imageUrl,
            alt: p.name,
            tag: p.category,
            name: p.name,
            price: `₹${p.price.toFixed(2)}`,
            category: p.category,
          }));
        }

        const staticList: Product[] = [
          { id: "latest-1", src: "/images/latest_1.png", alt: "Minimalist handcrafted ceramic vase", tag: "Studio Pottery", name: "Minimalist Terracotta Vase", price: "₹72.00", category: "Pottery" },
          { id: "latest-2", src: "/images/latest_2.png", alt: "Premium handwoven wool throw blanket", tag: "Artisan Textiles", name: "Woven Wool Throw Blanket", price: "₹145.00", category: "Textiles" },
          { id: "latest-3", src: "/images/latest_3.png", alt: "Handcrafted dark espresso leather tote bag", tag: "Bespoke Leather", name: "Espresso Leather Tote", price: "₹280.00", category: "Leather" },
          { id: "latest-4", src: "/images/best_2.png", alt: "Artisan Ceramic Tableware Collection", tag: "Studio Pottery", name: "Ceramic Tableware Set", price: "₹110.00", category: "Pottery" },
          { id: "latest-5", src: "/images/best_4.png", alt: "Organic Spun Yarn and Threads", tag: "Artisan Textiles", name: "Spun Linen Yarn Pack", price: "₹55.00", category: "Textiles" },
        ];

        const combined = [...dbProducts, ...staticList];
        setProducts(combined);

        // Extract unique categories
        const uniqCats = ["All", ...Array.from(new Set(combined.map(p => p.category)))];
        setCategories(uniqCats);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllProducts();
  }, []);

  // Filter products by category and search query
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh", paddingBottom: "80px" }}>
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
            <Link href="/products" className={styles.navLink} style={{ color: "var(--text-light)" }}>All Products</Link>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "40px auto 0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
          <span className={styles.carouselCardTag}>Boutique Catalog</span>
          <h1 className={styles.sectionTitle} style={{ textAlign: "left", margin: 0, alignSelf: "flex-start" }}>
            Explore All Creations
          </h1>
          <p style={{ color: "var(--color-warm-gray)", fontSize: "14px", maxWidth: "600px" }}>
            Browse through our full curated assortment of minimalist studio pottery, handwoven textures, and premium apparel.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px", marginBottom: "32px", borderBottom: "1px solid rgba(120, 108, 102, 0.15)", paddingBottom: "20px" }}>
          {/* Categories Tab list */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterTabBtn} ${activeCategory === cat ? styles.filterTabBtnActive : ""}`}
                style={{ fontSize: "13px", padding: "8px 16px" }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 16px",
                border: "1px solid rgba(120, 108, 102, 0.3)",
                borderRadius: "20px",
                fontSize: "13px",
                backgroundColor: "#fff",
                outline: "none",
                fontFamily: "var(--font-sans), sans-serif"
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--color-warm-gray)" }}>
            <p>Gathering items from the artisan studios...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "32px" }}>
            {filteredProducts.map((p) => (
              <div 
                key={p.id} 
                onClick={() => router.push(`/products/${p.id}`)}
                style={{ 
                  cursor: "pointer",
                  borderRadius: "8px", 
                  overflow: "hidden", 
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(120,108,102,0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column"
                }}
                className={styles.overlayCardHover} // CSS hover hook
              >
                <div style={{ position: "relative", width: "100%", height: "260px" }}>
                  <img
                    src={p.src}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "20px" }}>
                  <span className={styles.carouselCardTag} style={{ fontSize: "11px" }}>{p.category}</span>
                  <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "17px", color: "var(--color-dark-espresso)", margin: "8px 0 6px 0", fontWeight: "600" }}>
                    {p.name}
                  </h3>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-rose-taupe)" }}>{p.price}</span>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: "span 4", textAlign: "center", padding: "60px 0", color: "var(--color-warm-gray)", fontStyle: "italic" }}>
                No matching creations found. Try resetting filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
