"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import homeStyles from "../../page.module.css";
import editorStyles from "./editor.module.css";

interface ProductItem {
  id: string;
  src: string;
  alt: string;
  tag: string;
  name: string;
  price: string;
  category: string;
  stock: number;
}

export default function StorefrontVisualEditor() {
  const router = useRouter();
  const [isAdminValid, setIsAdminValid] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Storefront Config state matching homepage
  const [storefrontConfig, setStorefrontConfig] = useState({
    hero: {
      mediaType: "image" as "image" | "video",
      mediaUrl: "/images/hero_banner.png",
      tagline: "Exquisite Craftsmanship",
      title: "A Warm Embrace of Pure Organic Textures",
      description: "Discover handcrafted linens, studio pottery, and slow-made garments woven to tell a story of organic simplicity and refined comfort."
    },
    bestCollections: [
      { id: "best-1", title: "Slow-Wear Apparel", subtitle: "Linen Garments", imageUrl: "/images/best_1.png" },
      { id: "best-2", title: "Artisan Tableware", subtitle: "Handmade Ceramics", imageUrl: "/images/best_2.png" },
      { id: "best-3", title: "Warm Living Decor", subtitle: "Cozy Spaces", imageUrl: "/images/best_3.png" },
      { id: "best-4", title: "Raw Organic Yarn", subtitle: "Natural Fibers", imageUrl: "/images/best_4.png" },
      { id: "best-5", title: "Home Fragrances", subtitle: "Candles & Scents", imageUrl: "/images/best_5.png" }
    ],
    latestArrivalIds: [] as string[]
  });

  // Modal Editing States
  const [activeModal, setActiveModal] = useState<"hero" | "collection" | "product-add" | "product-edit" | null>(null);
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form Field Temporary Values
  const [heroForm, setHeroForm] = useState({ ...storefrontConfig.hero });
  const [colForm, setColForm] = useState({ title: "", subtitle: "", imageUrl: "" });
  const [productForm, setProductForm] = useState({ name: "", category: "Pottery", price: "", stock: "10", imageUrl: "" });

  // Upload progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    const verifySession = async () => {
      try {
        const savedUser = localStorage.getItem("silohni_user");
        if (!savedUser) {
          router.push("/admin/login");
          return;
        }

        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "admin" || parsed.email !== "admin@silohni.com") {
          router.push("/admin/login");
          return;
        }

        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }

        setIsAdminValid(true);
      } catch (err) {
        router.push("/admin/login");
      }
    };
    verifySession();
  }, [router]);

  // Load products and layout config
  useEffect(() => {
    if (!isAdminValid) return;
    
    const savedConfig = localStorage.getItem("silohni_storefront_config");
    if (savedConfig) {
      try {
        setStorefrontConfig(JSON.parse(savedConfig));
      } catch (e) {}
    }

    loadProductsData();
  }, [isAdminValid]);

  const loadProductsData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.$id,
          src: p.imageUrl,
          alt: p.name,
          tag: p.category,
          name: p.name,
          price: `$${p.price.toFixed(2)}`,
          category: p.category,
          stock: p.stock || 0,
          imageUrl: p.imageUrl
        }));
        setProducts(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = (newConfig: typeof storefrontConfig) => {
    setStorefrontConfig(newConfig);
    localStorage.setItem("silohni_storefront_config", JSON.stringify(newConfig));
  };

  // Cloudinary Upload helper
  const handleCloudinaryUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress("Generating secure upload token...");
    try {
      // 1. Get signature
      const sigRes = await fetch("/api/upload/signature", { method: "POST" });
      if (!sigRes.ok) {
        throw new Error("Failed to generate signature");
      }
      const sigData = await sigRes.json();
      
      // 2. Build form data for Cloudinary
      setUploadProgress("Uploading file to Cloudinary...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", String(sigData.timestamp));
      formData.append("signature", sigData.signature);
      formData.append("folder", "silohni");

      // 3. Post to Cloudinary API
      const uploadUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`;
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json();
        throw new Error(uploadErr.error?.message || "Upload failed");
      }

      const uploadResult = await uploadRes.json();
      setUploadProgress("Upload complete!");
      return uploadResult.secure_url;
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      alert("Error uploading file: " + err.message);
      throw err;
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  // Hero Actions
  const openEditHero = () => {
    setHeroForm({ ...storefrontConfig.hero });
    setActiveModal("hero");
  };

  const handleHeroFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleCloudinaryUpload(file);
      setHeroForm(prev => ({ ...prev, mediaUrl: url }));
    } catch (err) {}
  };

  const handleSaveHero = () => {
    saveConfig({
      ...storefrontConfig,
      hero: { ...heroForm }
    });
    setActiveModal(null);
  };

  // Collections Actions
  const openEditCollection = (idx: number) => {
    setSelectedColIndex(idx);
    setColForm({
      title: storefrontConfig.bestCollections[idx].title,
      subtitle: storefrontConfig.bestCollections[idx].subtitle,
      imageUrl: storefrontConfig.bestCollections[idx].imageUrl
    });
    setActiveModal("collection");
  };

  const handleCollectionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleCloudinaryUpload(file);
      setColForm(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {}
  };

  const handleSaveCollection = () => {
    if (selectedColIndex === null) return;
    const updated = [...storefrontConfig.bestCollections];
    updated[selectedColIndex] = {
      ...updated[selectedColIndex],
      title: colForm.title,
      subtitle: colForm.subtitle,
      imageUrl: colForm.imageUrl
    };
    saveConfig({
      ...storefrontConfig,
      bestCollections: updated
    });
    setActiveModal(null);
    setSelectedColIndex(null);
  };

  // Product Add Actions
  const openAddProduct = () => {
    setProductForm({ name: "", category: "Pottery", price: "", stock: "10", imageUrl: "" });
    setActiveModal("product-add");
  };

  const handleProductFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleCloudinaryUpload(file);
      setProductForm(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {}
  };

  const handleSaveNewProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.imageUrl) {
      alert("Please complete all product fields (including image upload).");
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          category: productForm.category,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock, 10) || 10,
          imageUrl: productForm.imageUrl,
        })
      });
      if (res.ok) {
        const newProduct = await res.json();
        // Automatically add newly created product to featured latest arrivals showcase
        saveConfig({
          ...storefrontConfig,
          latestArrivalIds: [...storefrontConfig.latestArrivalIds, newProduct.$id]
        });
        setActiveModal(null);
        loadProductsData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save product.");
      }
    } catch (e) {
      alert("Error adding product.");
    }
  };

  // Product Edit Actions
  const openEditProduct = (p: ProductItem) => {
    setSelectedProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      price: p.price.replace("$", ""),
      stock: String(p.stock),
      imageUrl: p.src
    });
    setActiveModal("product-edit");
  };

  const handleSaveProductEdit = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          name: productForm.name,
          category: productForm.category,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock, 10),
          imageUrl: productForm.imageUrl,
        })
      });
      if (res.ok) {
        setActiveModal(null);
        setSelectedProduct(null);
        loadProductsData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update product.");
      }
    } catch (e) {
      alert("Error updating product.");
    }
  };

  // Showcase Toggle
  const handleToggleShowcase = (id: string, isCurrentlyFeatured: boolean) => {
    let updatedIds = [...storefrontConfig.latestArrivalIds];
    if (isCurrentlyFeatured) {
      updatedIds = updatedIds.filter(fId => fId !== id);
    } else {
      updatedIds.push(id);
    }
    saveConfig({
      ...storefrontConfig,
      latestArrivalIds: updatedIds
    });
  };

  // Restock action
  const handleRestock = async (productId: string) => {
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          stock: 50 // Directly bump to 50
        })
      });
      if (res.ok) {
        loadProductsData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAdminValid) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f7f5f0" }}>
        <p>Loading editor session...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      {/* Visual Editor Controlling bar */}
      <div className={editorStyles.editorBar}>
        <div className={editorStyles.editorTitle}>
          Silohni Storefront Editor
          <span className={editorStyles.badge}>Edit Mode</span>
        </div>
        <div className={editorStyles.barActions}>
          <button
            onClick={() => {
              if (confirm("Reset storefront config?")) {
                localStorage.removeItem("silohni_storefront_config");
                window.location.reload();
              }
            }}
            className={editorStyles.exitBtn}
            style={{ color: "#d6b7aa", borderColor: "#d6b7aa" }}
          >
            Reset Layout
          </button>
          <button onClick={() => router.push("/admin")} className={editorStyles.exitBtn}>
            Exit Editor &rarr;
          </button>
        </div>
      </div>

      {/* RENDER THE HOME SITE */}
      <div className={homeStyles.page}>
        {/* Hero Banner Section */}
        <section className={`${homeStyles.hero} ${editorStyles.cardContainer}`} id="hero-section">
          <button className={editorStyles.editButton} onClick={openEditHero}>
            ✏️ Edit Hero Banner
          </button>

          {storefrontConfig.hero.mediaType === "video" ? (
            <video
              src={storefrontConfig.hero.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className={homeStyles.heroImage}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          ) : (
            <Image
              src={storefrontConfig.hero.mediaUrl}
              alt="Silohni Studio banner featuring minimalist ceramics and linens"
              fill
              priority
              className={homeStyles.heroImage}
            />
          )}

          <div className={homeStyles.heroOverlay}>
            <div className={homeStyles.heroContent}>
              <span className={homeStyles.heroTagline}>{storefrontConfig.hero.tagline}</span>
              <h1 className={homeStyles.heroTitle}>{storefrontConfig.hero.title}</h1>
              <p className={homeStyles.heroDesc}>{storefrontConfig.hero.description}</p>
              <button className={homeStyles.heroBtn}>Explore the Collection</button>
            </div>
          </div>
        </section>

        {/* Latest Arrivals Section */}
        <section className={homeStyles.section} id="latest-arrival-section" style={{ padding: "80px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid rgba(120, 108, 102, 0.15)", paddingBottom: "16px" }}>
            <div>
              <span className={homeStyles.carouselCardTag}>Catalog Editor</span>
              <h2 className={homeStyles.sectionTitle} style={{ textAlign: "left", margin: "4px 0 0 0" }}>Featured Products</h2>
            </div>
            <button
              onClick={openAddProduct}
              className={editorStyles.editButton}
              style={{ position: "static", backgroundColor: "#1a1a1a", color: "#ffffff" }}
            >
              ➕ Add New Product Catalog
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px" }}>
            {products.map((p) => {
              const isFeatured = storefrontConfig.latestArrivalIds.includes(p.id);
              return (
                <div key={p.id} className={`${homeStyles.carouselCard} ${editorStyles.cardContainer}`} style={{ border: "1px solid rgba(120, 108, 102, 0.1)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fcfcfb" }}>
                  
                  {/* Action overlays on hover */}
                  <div className={editorStyles.cardEditOverlay} style={{ opacity: 1 }}>
                    <div className={editorStyles.actionPill}>
                      <button className={editorStyles.pillBtn} onClick={() => openEditProduct(p)}>
                        ✏️ Edit details
                      </button>
                      <button
                        className={`${editorStyles.pillBtn} ${isFeatured ? editorStyles.pillBtnDanger : ""}`}
                        onClick={() => handleToggleShowcase(p.id, isFeatured)}
                      >
                        {isFeatured ? "❌ Hide from Home" : "✨ Showcase"}
                      </button>
                      {p.stock === 0 && (
                        <button className={editorStyles.pillBtn} onClick={() => handleRestock(p.id)} style={{ color: "#a9d18e" }}>
                          Restock
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ position: "relative", width: "100%", height: "240px" }}>
                    <Image
                      src={p.src}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "16px" }}>
                    <span className={homeStyles.carouselCardTag} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{p.category}</span>
                      <span style={{ color: p.stock <= 3 ? "var(--color-rose-taupe)" : "var(--color-warm-gray)" }}>
                        {p.stock} units
                      </span>
                    </span>
                    <h3 className={homeStyles.carouselCardTitle} style={{ fontSize: "16px", margin: "6px 0" }}>{p.name}</h3>
                    <span className={homeStyles.carouselCardPrice} style={{ fontWeight: "700" }}>{p.price}</span>
                    {isFeatured && (
                      <span style={{ display: "inline-block", backgroundColor: "#e2f0d9", color: "#385723", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "10px", marginTop: "8px", textTransform: "uppercase" }}>
                        Featured on Home
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p style={{ gridColumn: "span 3", textAlign: "center", fontStyle: "italic", padding: "40px 0" }}>
                No catalog items. Click "+ Add New Product" to register your first boutique piece!
              </p>
            )}
          </div>
        </section>

        {/* Best Collections Section */}
        <section className={homeStyles.section} id="best-collections-section" style={{ padding: "80px 40px" }}>
          <h2 className={homeStyles.sectionTitle}>Best collections</h2>
          <div className={homeStyles.bestGrid}>
            {storefrontConfig.bestCollections.map((col, index) => {
              const cardClassName = 
                index === 0 ? homeStyles.bestCard1 :
                index === 1 ? homeStyles.bestCard2 :
                index === 2 ? homeStyles.bestCard3 :
                index === 3 ? homeStyles.bestCard4 :
                homeStyles.bestCard5;
              return (
                <div className={`${cardClassName} ${editorStyles.cardContainer}`} key={col.id} id={`best-collection-${index+1}`}>
                  
                  {/* Curation trigger */}
                  <div className={editorStyles.cardEditOverlay}>
                    <button className={editorStyles.editButton} style={{ position: "static" }} onClick={() => openEditCollection(index)}>
                      ✏️ Edit Card
                    </button>
                  </div>

                  <Image
                    src={col.imageUrl}
                    alt={col.title}
                    fill
                    sizes={index === 0 ? "(max-width: 992px) 100vw, 450px" : "(max-width: 992px) 100vw, 380px"}
                    className={homeStyles.cardImage}
                  />
                  <div className={homeStyles.bestOverlay}>
                    <h3 className={homeStyles.bestTitle}>{col.title}</h3>
                    <span className={homeStyles.bestSubtitle}>{col.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* EDIT MODALS OVERLAYS */}
      {activeModal === "hero" && (
        <div className={editorStyles.modalBackdrop}>
          <div className={editorStyles.modal}>
            <h3 className={editorStyles.modalTitle}>Curation: Hero Banner</h3>
            
            {isUploading && (
              <div style={{ backgroundColor: "#faf9f6", border: "1px solid #d3cdbf", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "var(--color-rose-taupe)", textAlign: "center" }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Media Type</span>
              <select
                className={editorStyles.input}
                value={heroForm.mediaType}
                onChange={(e) => setHeroForm(prev => ({ ...prev, mediaType: e.target.value as any }))}
              >
                <option value="image">Static Image</option>
                <option value="video">Background Video</option>
              </select>
            </div>
            
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Upload Hero {heroForm.mediaType === "video" ? "Video" : "Image"}</span>
              <input
                type="file"
                className={editorStyles.input}
                accept={heroForm.mediaType === "video" ? "video/*" : "image/*"}
                onChange={handleHeroFileChange}
                disabled={isUploading}
              />
              {heroForm.mediaUrl && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#706f6c", wordBreak: "break-all" }}>
                  Selected Media: {heroForm.mediaUrl}
                </div>
              )}
            </div>

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Tagline</span>
              <input
                type="text"
                className={editorStyles.input}
                value={heroForm.tagline}
                onChange={(e) => setHeroForm(prev => ({ ...prev, tagline: e.target.value }))}
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Headline Title</span>
              <input
                type="text"
                className={editorStyles.input}
                value={heroForm.title}
                onChange={(e) => setHeroForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Description Text</span>
              <textarea
                className={editorStyles.textarea}
                value={heroForm.description}
                onChange={(e) => setHeroForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className={editorStyles.modalActions}>
              <button onClick={() => setActiveModal(null)} className={editorStyles.cancelBtn} disabled={isUploading}>Cancel</button>
              <button onClick={handleSaveHero} className={editorStyles.saveBtn} disabled={isUploading}>Save Hero Settings</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "collection" && (
        <div className={editorStyles.modalBackdrop}>
          <div className={editorStyles.modal}>
            <h3 className={editorStyles.modalTitle}>Curation: Collection Card {selectedColIndex !== null ? selectedColIndex + 1 : ""}</h3>
            
            {isUploading && (
              <div style={{ backgroundColor: "#faf9f6", border: "1px solid #d3cdbf", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "var(--color-rose-taupe)", textAlign: "center" }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Title</span>
              <input
                type="text"
                className={editorStyles.input}
                value={colForm.title}
                onChange={(e) => setColForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Subtitle</span>
              <input
                type="text"
                className={editorStyles.input}
                value={colForm.subtitle}
                onChange={(e) => setColForm(prev => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>
            
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Upload Card Image</span>
              <input
                type="file"
                className={editorStyles.input}
                accept="image/*"
                onChange={handleCollectionFileChange}
                disabled={isUploading}
              />
              {colForm.imageUrl && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#706f6c", wordBreak: "break-all" }}>
                  Selected Image: {colForm.imageUrl}
                </div>
              )}
            </div>

            <div className={editorStyles.modalActions}>
              <button onClick={() => setActiveModal(null)} className={editorStyles.cancelBtn} disabled={isUploading}>Cancel</button>
              <button onClick={handleSaveCollection} className={editorStyles.saveBtn} disabled={isUploading}>Save Collection</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modals */}
      {(activeModal === "product-add" || activeModal === "product-edit") && (
        <div className={editorStyles.modalBackdrop}>
          <div className={editorStyles.modal}>
            <h3 className={editorStyles.modalTitle}>
              {activeModal === "product-add" ? "Add New Boutique Product" : "Edit Product Catalog Details"}
            </h3>

            {isUploading && (
              <div style={{ backgroundColor: "#faf9f6", border: "1px solid #d3cdbf", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "var(--color-rose-taupe)", textAlign: "center" }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Product Name</span>
              <input
                type="text"
                className={editorStyles.input}
                value={productForm.name}
                onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Stoneware Tea Cup"
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Category</span>
              <select
                className={editorStyles.input}
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Pottery">Pottery</option>
                <option value="Textiles">Textiles</option>
                <option value="Leather">Leather</option>
              </select>
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Price (USD)</span>
              <input
                type="number"
                step="0.01"
                className={editorStyles.input}
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="45.00"
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Stock units</span>
              <input
                type="number"
                className={editorStyles.input}
                value={productForm.stock}
                onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="10"
              />
            </div>
            
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Upload Product Image</span>
              <input
                type="file"
                className={editorStyles.input}
                accept="image/*"
                onChange={handleProductFileChange}
                disabled={isUploading}
              />
              {productForm.imageUrl && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#706f6c", wordBreak: "break-all" }}>
                  Selected Image: {productForm.imageUrl}
                </div>
              )}
            </div>

            <div className={editorStyles.modalActions}>
              <button onClick={() => setActiveModal(null)} className={editorStyles.cancelBtn} disabled={isUploading}>Cancel</button>
              <button
                onClick={activeModal === "product-add" ? handleSaveNewProduct : handleSaveProductEdit}
                className={editorStyles.saveBtn}
                disabled={isUploading}
              >
                {activeModal === "product-add" ? "Register Product" : "Save Product Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
