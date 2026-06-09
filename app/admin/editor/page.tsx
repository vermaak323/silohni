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
  imageUrl: string;
  otherImageUrls?: string[];
  originalPrice?: number | null;
  sizes?: string[];
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
    latestArrivalIds: [] as string[],
    galleryItems: [
      { id: "gallery-1", src: "/images/gallery_1.png", alt: "Cotton Anarkali Linen Dress", title: "Cotton Anarkali", type: "trough" },
      { id: "gallery-2", src: "/images/gallery_2.png", alt: "Silk Straight Kurta", title: "Silk Straight", type: "peak" },
      { id: "gallery-3", src: "/images/gallery_3.png", alt: "Georgette Flared Dress", title: "Georgette Flared", type: "trough" },
      { id: "gallery-4", src: "/images/gallery_4.png", alt: "Chanderi Blend Suit", title: "Chanderi Blend", type: "peak" }
    ],
    testimonials: [
      { id: "testimonial-1", name: "Sarah J.", avatarUrl: "/images/avatar_1.png", text: "Absolutely fell in love with their ceramics! The earthy finish and minimal design are perfect. The packaging was also completely plastic-free." },
      { id: "testimonial-2", name: "Marcus V.", avatarUrl: "/images/avatar_2.png", text: "The woolen throws are incredibly cozy and heavy-weight. You can tell they were woven with care. Silohni is my absolute favorite home boutique now." }
    ]
  });

  // Modal Editing States
  const [activeModal, setActiveModal] = useState<"hero" | "collection" | "product-add" | "product-edit" | "gallery" | "testimonial" | null>(null);
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState<number | null>(null);

  // Form Field Temporary Values
  const [heroForm, setHeroForm] = useState({ ...storefrontConfig.hero });
  const [colForm, setColForm] = useState({ title: "", subtitle: "", imageUrl: "" });
  const [productForm, setProductForm] = useState({ 
    name: "", 
    category: "", 
    price: "", 
    stock: "10", 
    imageUrl: "", 
    otherImageUrls: [] as string[],
    originalPrice: "",
    sizes: ""
  });
  const [galleryForm, setGalleryForm] = useState({ title: "", alt: "", src: "", type: "peak" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", text: "", avatarUrl: "" });

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
        const parsed = JSON.parse(savedConfig);
        if (!parsed.galleryItems) {
          parsed.galleryItems = [
            { id: "gallery-1", src: "/images/gallery_1.png", alt: "Cotton Anarkali Linen Dress", title: "Cotton Anarkali", type: "trough" },
            { id: "gallery-2", src: "/images/gallery_2.png", alt: "Silk Straight Kurta", title: "Silk Straight", type: "peak" },
            { id: "gallery-3", src: "/images/gallery_3.png", alt: "Georgette Flared Dress", title: "Georgette Flared", type: "trough" },
            { id: "gallery-4", src: "/images/gallery_4.png", alt: "Chanderi Blend Suit", title: "Chanderi Blend", type: "peak" }
          ];
        }
        if (!parsed.testimonials) {
          parsed.testimonials = [
            { id: "testimonial-1", name: "Sarah J.", avatarUrl: "/images/avatar_1.png", text: "Absolutely fell in love with their ceramics! The earthy finish and minimal design are perfect. The packaging was also completely plastic-free." },
            { id: "testimonial-2", name: "Marcus V.", avatarUrl: "/images/avatar_2.png", text: "The woolen throws are incredibly cozy and heavy-weight. You can tell they were woven with care. Silohni is my absolute favorite home boutique now." }
          ];
        }
        setStorefrontConfig(parsed);
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
        const formatted = data.map((p: any) => {
          let parsedOthers: string[] = [];
          if (p.otherImageUrls) {
            try {
              parsedOthers = JSON.parse(p.otherImageUrls);
            } catch (e) {
              parsedOthers = [];
            }
          }
          let parsedSizes: string[] = [];
          if (p.sizes) {
            try {
              parsedSizes = JSON.parse(p.sizes);
            } catch (e) {
              if (typeof p.sizes === "string") {
                parsedSizes = p.sizes.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            }
          }
          return {
            id: p.$id,
            src: p.imageUrl,
            alt: p.name,
            tag: p.category,
            name: p.name,
            price: `₹${p.price.toFixed(2)}`,
            category: p.category,
            stock: p.stock || 0,
            imageUrl: p.imageUrl,
            otherImageUrls: parsedOthers,
            originalPrice: p.originalPrice || null,
            sizes: parsedSizes
          };
        });
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
    setProductForm({ name: "", category: "Pottery", price: "", stock: "10", imageUrl: "", otherImageUrls: [], originalPrice: "", sizes: "" });
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

  const handleOtherImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await handleCloudinaryUpload(files[i]);
        newUrls.push(url);
      }
      setProductForm(prev => ({
        ...prev,
        otherImageUrls: [...prev.otherImageUrls, ...newUrls]
      }));
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
          otherImageUrls: productForm.otherImageUrls,
          originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
          sizes: productForm.sizes ? productForm.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
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
      price: p.price.replace("₹", "").replace("$", ""),
      stock: String(p.stock),
      imageUrl: p.src,
      otherImageUrls: p.otherImageUrls || [],
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      sizes: p.sizes ? p.sizes.join(", ") : ""
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
          otherImageUrls: productForm.otherImageUrls,
          originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
          sizes: productForm.sizes ? productForm.sizes.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
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

  // Gallery Actions
  const openEditGallery = (idx: number) => {
    setSelectedGalleryIndex(idx);
    const item = storefrontConfig.galleryItems?.[idx] || { title: "", alt: "", src: "", type: "peak" };
    setGalleryForm({
      title: item.title,
      alt: item.alt || item.title,
      src: item.src,
      type: item.type || "peak"
    });
    setActiveModal("gallery");
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleCloudinaryUpload(file);
      setGalleryForm(prev => ({ ...prev, src: url }));
    } catch (err) {}
  };

  const handleSaveGallery = () => {
    if (selectedGalleryIndex === null) return;
    const updated = [...(storefrontConfig.galleryItems || [])];
    updated[selectedGalleryIndex] = {
      ...updated[selectedGalleryIndex],
      title: galleryForm.title,
      alt: galleryForm.alt,
      src: galleryForm.src,
      type: galleryForm.type
    };
    saveConfig({
      ...storefrontConfig,
      galleryItems: updated
    });
    setActiveModal(null);
    setSelectedGalleryIndex(null);
  };

  // Testimonials Actions
  const openEditTestimonial = (idx: number) => {
    setSelectedTestimonialIndex(idx);
    const item = storefrontConfig.testimonials?.[idx] || { name: "", text: "", avatarUrl: "" };
    setTestimonialForm({
      name: item.name,
      text: item.text,
      avatarUrl: item.avatarUrl
    });
    setActiveModal("testimonial");
  };

  const handleTestimonialFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await handleCloudinaryUpload(file);
      setTestimonialForm(prev => ({ ...prev, avatarUrl: url }));
    } catch (err) {}
  };

  const handleSaveTestimonial = () => {
    if (selectedTestimonialIndex === null) return;
    const updated = [...(storefrontConfig.testimonials || [])];
    updated[selectedTestimonialIndex] = {
      ...updated[selectedTestimonialIndex],
      name: testimonialForm.name,
      text: testimonialForm.text,
      avatarUrl: testimonialForm.avatarUrl
    };
    saveConfig({
      ...storefrontConfig,
      testimonials: updated
    });
    setActiveModal(null);
    setSelectedTestimonialIndex(null);
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

        {/* Image Gallery Section */}
        <section className={homeStyles.section} id="image-gallery-section" style={{ padding: "80px 40px" }}>
          <h2 className={homeStyles.sectionTitle}>Image Gallery</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "32px", marginTop: "32px" }}>
            {(storefrontConfig.galleryItems || []).map((item, index) => (
              <div
                key={item.id}
                className={editorStyles.cardContainer}
                style={{ 
                  cursor: "pointer", 
                  backgroundColor: "#FFFFFF", 
                  padding: "14px 14px 22px 14px", 
                  boxShadow: "0 10px 20px rgba(120, 108, 102, 0.08)", 
                  border: "1px solid rgba(120, 108, 102, 0.15)",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative"
                }}
              >
                <div className={editorStyles.cardEditOverlay}>
                  <button className={editorStyles.editButton} style={{ position: "static" }} onClick={() => openEditGallery(index)}>
                    ✏️ Edit Polaroid
                  </button>
                </div>
                
                <div style={{ position: "relative", width: "100%", aspectRatio: "1", overflow: "hidden", backgroundColor: "#fcfcfb" }}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <span className={homeStyles.wavePolaroidTitle} style={{ marginTop: "14px", fontFamily: "var(--font-serif), serif", fontSize: "15px", textAlign: "center", color: "var(--color-dark-espresso)", fontWeight: "600" }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={homeStyles.section} id="testimonials-section" style={{ padding: "80px 40px" }}>
          <h2 className={homeStyles.sectionTitle}>Testimonials</h2>
          <div className={homeStyles.testimonialsGrid}>
            {(storefrontConfig.testimonials || []).map((t, idx) => (
              <div className={`${homeStyles.testimonialCard} ${editorStyles.cardContainer}`} id={`testimonial-card-${idx+1}`} key={t.id}>
                <div className={editorStyles.cardEditOverlay}>
                  <button className={editorStyles.editButton} style={{ position: "static" }} onClick={() => openEditTestimonial(idx)}>
                    ✏️ Edit Quote
                  </button>
                </div>

                <div className={homeStyles.pendantLine}>
                  <div className={homeStyles.pendantDot} />
                </div>
                <div className={homeStyles.avatarWrapper}>
                  <Image
                    src={t.avatarUrl}
                    alt={`Portrait of ${t.name}, verified customer`}
                    fill
                    sizes="90px"
                    className={homeStyles.avatarImage}
                  />
                </div>
                <div className={homeStyles.speechBubble}>
                  <p className={homeStyles.testimonialText}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <span className={homeStyles.testimonialAuthor}>— {t.name}</span>
                </div>
              </div>
            ))}
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
              <input
                type="text"
                className={editorStyles.input}
                value={productForm.category}
                onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Studio Pottery"
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Discounted Price (INR ₹)</span>
              <input
                type="number"
                step="0.01"
                className={editorStyles.input}
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="2500.00"
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Original Price (INR ₹) (Optional)</span>
              <input
                type="number"
                step="0.01"
                className={editorStyles.input}
                value={productForm.originalPrice}
                onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                placeholder="3500.00"
              />
            </div>
            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Available Sizes (comma-separated, e.g. S, M, L) (Optional)</span>
              <input
                type="text"
                className={editorStyles.input}
                value={productForm.sizes}
                onChange={(e) => setProductForm(prev => ({ ...prev, sizes: e.target.value }))}
                placeholder="S, M, L, XL"
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
              <span className={editorStyles.label}>Upload Product Main Image</span>
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

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Other Photos (Gallery)</span>
              
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                {productForm.otherImageUrls?.map((url, idx) => (
                  <div key={idx} style={{ position: "relative", width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden", border: "1px solid #d3cdbf" }}>
                    <img src={url} alt={`Gallery ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({
                        ...prev,
                        otherImageUrls: prev.otherImageUrls.filter((_, i) => i !== idx)
                      }))}
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "2px",
                        backgroundColor: "rgba(220, 53, 69, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "10px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                multiple
                className={editorStyles.input}
                accept="image/*"
                onChange={handleOtherImageUpload}
                disabled={isUploading}
              />
              <span style={{ fontSize: "11px", color: "#706f6c" }}>
                Upload multiple auxiliary images to show on the details page.
              </span>
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

      {/* Gallery Polaroid Edit Modal */}
      {activeModal === "gallery" && (
        <div className={editorStyles.modalBackdrop}>
          <div className={editorStyles.modal}>
            <h3 className={editorStyles.modalTitle}>Curation: Gallery Polaroid Card</h3>
            
            {isUploading && (
              <div style={{ backgroundColor: "#faf9f6", border: "1px solid #d3cdbf", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "var(--color-rose-taupe)", textAlign: "center" }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Polaroid Title</span>
              <input
                type="text"
                className={editorStyles.input}
                value={galleryForm.title}
                onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Cotton Anarkali"
              />
            </div>

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Image Alt Text</span>
              <input
                type="text"
                className={editorStyles.input}
                value={galleryForm.alt}
                onChange={(e) => setGalleryForm(prev => ({ ...prev, alt: e.target.value }))}
                placeholder="Brief description for accessibility"
              />
            </div>

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Polaroid Curve Type</span>
              <select
                className={editorStyles.input}
                value={galleryForm.type}
                onChange={(e) => setGalleryForm(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="peak">Peak (Curved Up)</option>
                <option value="trough">Trough (Curved Down)</option>
              </select>
            </div>

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Upload Gallery Photo</span>
              <input
                type="file"
                className={editorStyles.input}
                accept="image/*"
                onChange={handleGalleryFileChange}
                disabled={isUploading}
              />
              {galleryForm.src && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#706f6c", wordBreak: "break-all" }}>
                  Selected Image: {galleryForm.src}
                </div>
              )}
            </div>

            <div className={editorStyles.modalActions}>
              <button onClick={() => setActiveModal(null)} className={editorStyles.cancelBtn} disabled={isUploading}>Cancel</button>
              <button onClick={handleSaveGallery} className={editorStyles.saveBtn} disabled={isUploading}>Save Polaroid</button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Edit Modal */}
      {activeModal === "testimonial" && (
        <div className={editorStyles.modalBackdrop}>
          <div className={editorStyles.modal}>
            <h3 className={editorStyles.modalTitle}>Curation: Customer Review</h3>
            
            {isUploading && (
              <div style={{ backgroundColor: "#faf9f6", border: "1px solid #d3cdbf", padding: "12px", borderRadius: "6px", marginBottom: "20px", fontSize: "13px", color: "var(--color-rose-taupe)", textAlign: "center" }}>
                ⏳ {uploadProgress}
              </div>
            )}

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Author Name</span>
              <input
                type="text"
                className={editorStyles.input}
                value={testimonialForm.name}
                onChange={(e) => setTestimonialForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sarah J."
              />
            </div>

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Review Quote Text</span>
              <textarea
                className={editorStyles.textarea}
                value={testimonialForm.text}
                onChange={(e) => setTestimonialForm(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter customer feedback..."
              />
            </div>

            <div className={editorStyles.formGroup}>
              <span className={editorStyles.label}>Upload Customer Avatar</span>
              <input
                type="file"
                className={editorStyles.input}
                accept="image/*"
                onChange={handleTestimonialFileChange}
                disabled={isUploading}
              />
              {testimonialForm.avatarUrl && (
                <div style={{ marginTop: "8px", fontSize: "11px", color: "#706f6c", wordBreak: "break-all" }}>
                  Selected Avatar: {testimonialForm.avatarUrl}
                </div>
              )}
            </div>

            <div className={editorStyles.modalActions}>
              <button onClick={() => setActiveModal(null)} className={editorStyles.cancelBtn} disabled={isUploading}>Cancel</button>
              <button onClick={handleSaveTestimonial} className={editorStyles.saveBtn} disabled={isUploading}>Save Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
