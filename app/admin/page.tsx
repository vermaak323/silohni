"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  imageUrl?: string;
}

interface OrderItem {
  $id: string;
  userPhone: string;
  userEmail?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    zip: string;
    country: string;
  };
  status: "Processing" | "Shipping" | "Completed";
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "customers">("dashboard");

  // Dynamic States for MongoDB Data
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  
  // Add Product Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("Pottery");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  
  // Media Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Store setting states
  const [storeStatus, setStoreStatus] = useState("Open");
  const [broadcastMsg, setBroadcastMsg] = useState("Free global shipping on organic linens this weekend.");
  const [storefrontConfig, setStorefrontConfig] = useState({
    hero: {
      mediaType: "image",
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
  const [configSavedSuccess, setConfigSavedSuccess] = useState(false);

  // Inline editing states for products
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProdName, setEditProdName] = useState("");
  const [editProdCat, setEditProdCat] = useState("Pottery");
  const [editProdPrice, setEditProdPrice] = useState("");
  const [editProdStock, setEditProdStock] = useState("");
  const [editProdImgUrl, setEditProdImgUrl] = useState("");

  const handleStartEdit = (p: ProductItem) => {
    setEditingProductId(p.id);
    setEditProdName(p.name);
    setEditProdCat(p.category);
    setEditProdPrice(p.price.replace("$", ""));
    setEditProdStock(String(p.stock));
    setEditProdImgUrl(p.imageUrl || "");
  };

  const handleSaveProductEdit = async (productId: string) => {
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: editProdName,
          category: editProdCat,
          price: parseFloat(editProdPrice),
          stock: parseInt(editProdStock, 10),
          imageUrl: editProdImgUrl,
        })
      });
      if (res.ok) {
        setEditingProductId(null);
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update product details.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error saving product changes.");
    }
  };

  // Inline row creation states
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newRowName, setNewRowName] = useState("");
  const [newRowCat, setNewRowCat] = useState("Pottery");
  const [newRowPrice, setNewRowPrice] = useState("");
  const [newRowStock, setNewRowStock] = useState("10");
  const [newRowImgUrl, setNewRowImgUrl] = useState("");

  const handleSaveNewRowProduct = async () => {
    if (!newRowName || !newRowPrice || !newRowImgUrl) {
      alert("Please enter Name, Price, and Photo URL/Path.");
      return;
    }
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRowName,
          category: newRowCat,
          price: parseFloat(newRowPrice),
          stock: parseInt(newRowStock, 10) || 10,
          imageUrl: newRowImgUrl,
        })
      });
      if (res.ok) {
        setIsAddingNewRow(false);
        setNewRowName("");
        setNewRowPrice("");
        setNewRowImgUrl("");
        setNewRowStock("10");
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create product.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error saving new product.");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem("silohni_user");
        if (!savedUser) {
          router.push("/admin/login");
          return;
        }

        const parsed = JSON.parse(savedUser);
        if (parsed.role !== "admin" || parsed.email !== "admin@silohni.com") {
          localStorage.removeItem("silohni_user");
          router.push("/admin/login");
          return;
        }

        // Verify active session with the backend API
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          localStorage.removeItem("silohni_user");
          router.push("/admin/login");
          return;
        }

        const data = await res.json();
        if (!data.user || data.user.email !== "admin@silohni.com" || data.user.role !== "admin") {
          localStorage.removeItem("silohni_user");
          router.push("/admin/login");
          return;
        }

        setAdminUser(parsed);
      } catch (err) {
        localStorage.removeItem("silohni_user");
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const savedMsg = localStorage.getItem("silohni_announcement");
    if (savedMsg) {
      setBroadcastMsg(savedMsg);
    }
    const savedConfig = localStorage.getItem("silohni_storefront_config");
    if (savedConfig) {
      try {
        setStorefrontConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error loading storefront config:", e);
      }
    }
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((p: any) => ({
          id: p.$id,
          name: p.name,
          category: p.category,
          price: `$${p.price.toFixed(2)}`,
          stock: p.stock,
          imageUrl: p.imageUrl,
        }));
        setProducts(formatted);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("silohni_user");
    router.push("/");
  };

  const handleRestock = async (prodId: string) => {
    // Restock demo update (Client side mockup for inventory restock toggle)
    setProducts(prev => 
      prev.map(p => p.id === prodId ? { ...p, stock: p.stock + 10 } : p)
    );
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError("");
    
    if (!newProdName || !newProdPrice || !newProdStock) {
      setUploadError("Please fill in all fields.");
      return;
    }

    if (!selectedFile) {
      setUploadError("Please select a photo.");
      return;
    }

    try {
      setIsUploading(true);

      const sigRes = await fetch("/api/upload/signature", { method: "POST" });
      const sigData = await sigRes.json();
      if (!sigRes.ok) {
        throw new Error(sigData.error || "Failed to generate Cloudinary signature");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", "silohni");

      const cloudUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
      const cloudRes = await fetch(cloudUrl, {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) {
        throw new Error(cloudData.error?.message || "Failed to upload to Cloudinary");
      }

      const imageUrl = cloudData.secure_url;

      const saveRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCat,
          price: parseFloat(newProdPrice),
          stock: parseInt(newProdStock, 10),
          imageUrl,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || "Failed to save product details");
      }

      setNewProdName("");
      setNewProdPrice("");
      setNewProdStock("");
      setSelectedFile(null);
      setShowAddForm(false);
      
      loadProducts();
    } catch (err: any) {
      console.error("Product creation error:", err);
      setUploadError(err.message || "An error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: "Completed" | "Shipping") => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        loadOrders();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Compute live aggregates from MongoDB
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeShipmentsCount = orders.filter(o => o.status === "Shipping").length;
  const completedOrdersCount = orders.filter(o => o.status === "Completed").length;
  const lowStockCount = products.filter(p => p.stock <= 3).length;

  if (!adminUser) {
    return (
      <div className={styles.wrapper} style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#f7ede8", fontSize: "16px" }}>Authenticating Command Centre...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Left Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.brandLogo}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          Silohni Panel
        </div>

        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === "dashboard" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Command Centre
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === "products" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Product Management
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === "orders" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders & Shipping
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === "customers" ? styles.navItemActive : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customer Insights
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleSignOut} className={styles.signOutBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className={styles.mainPanel}>
        <header className={styles.topbar}>
          <h1 className={styles.sectionTitle}>
            {activeTab === "dashboard" && "Dashboard Command Centre"}
            {activeTab === "products" && "Product Catalog Control"}
            {activeTab === "orders" && "Fulfillment & Shipments"}
            {activeTab === "customers" && "Customer Analytics & Insights"}
          </h1>

          <div className={styles.adminProfile}>
            <Link href="/" style={{ fontSize: "13px", color: "var(--color-rose-taupe)", marginRight: "16px", textDecoration: "underline" }}>
              Go to Storefront
            </Link>
            <div className={styles.adminAvatar}>A</div>
            <div className={styles.adminInfo}>
              <div>Admin Administrator</div>
              <span style={{ color: "var(--color-rose-taupe)", fontSize: "11px" }}>Store Owner</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {/* TAB 1: DASHBOARD COMMAND CENTRE */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stat Widgets */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Total Revenue</div>
                  <div className={styles.statValue}>${totalRevenue.toFixed(2)}</div>
                  <span className={styles.statSubtext}>
                    <span className={styles.trendUp}>▲ +18.4%</span> vs last month
                  </span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Orders Completed</div>
                  <div className={styles.statValue}>{completedOrdersCount}</div>
                  <span className={styles.statSubtext}>
                    <span className={styles.trendUp}>▲ +5.2%</span> vs last month
                  </span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Active Shipments</div>
                  <div className={styles.statValue}>{activeShipmentsCount}</div>
                  <span className={styles.statSubtext}>
                    Fulfillment underway
                  </span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Low Stock Warnings</div>
                  <div className={styles.statValue} style={{ color: "var(--color-rose-taupe)" }}>
                    {lowStockCount}
                  </div>
                  <span className={styles.statSubtext}>
                    Needs immediate attention
                  </span>
                </div>
              </div>

              {/* Weekly Sales Charts Mock */}
              <div className={styles.chartContainer}>
                <div className={styles.chartTitle}>Weekly Sales Summary</div>
                <div className={styles.chartVisual}>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$1,400</span>
                    <div className={styles.chartBar} style={{ height: "45%" }} />
                    <span className={styles.chartLabel}>Mon</span>
                  </div>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$1,800</span>
                    <div className={styles.chartBar} style={{ height: "60%" }} />
                    <span className={styles.chartLabel}>Tue</span>
                  </div>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$1,100</span>
                    <div className={styles.chartBar} style={{ height: "35%" }} />
                    <span className={styles.chartLabel}>Wed</span>
                  </div>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$2,300</span>
                    <div className={styles.chartBar} style={{ height: "75%" }} />
                    <span className={styles.chartLabel}>Thu</span>
                  </div>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$2,600</span>
                    <div className={styles.chartBar} style={{ height: "85%" }} />
                    <span className={styles.chartLabel}>Fri</span>
                  </div>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$1,900</span>
                    <div className={styles.chartBar} style={{ height: "65%" }} />
                    <span className={styles.chartLabel}>Sat</span>
                  </div>
                  <div className={styles.chartBarWrapper}>
                    <span className={styles.chartValue}>$2,800</span>
                    <div className={styles.chartBar} style={{ height: "95%" }} />
                    <span className={styles.chartLabel}>Sun</span>
                  </div>
                </div>
              </div>

              {/* Quick Config Toggles */}
              <div className={styles.bottomGrid}>
                <div className={styles.cardPanel}>
                  <h3 className={styles.chartTitle} style={{ marginBottom: "16px" }}>Boutique Command Center Actions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>Storefront Status</strong>
                        <div style={{ fontSize: "12px", color: "rgba(247,237,232,0.6)" }}>Open for checkouts.</div>
                      </div>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => setStoreStatus(prev => prev === "Open" ? "Closed" : "Open")}
                      >
                        Set: {storeStatus === "Open" ? "CLOSED" : "OPEN"}
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(214,183,170,0.1)", paddingTop: "16px" }}>
                      <strong>Update Broadcast Announcement</strong>
                      <input 
                        type="text" 
                        value={broadcastMsg}
                        onChange={(e) => setBroadcastMsg(e.target.value)}
                        className={styles.inputField}
                        style={{ width: "100%" }}
                      />
                      <button 
                        className={styles.actionBtn}
                        style={{ alignSelf: "flex-end" }}
                        onClick={() => {
                          localStorage.setItem("silohni_announcement", broadcastMsg);
                          alert("Announcement broadcasted successfully!");
                        }}
                      >
                        Update Banner
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.cardPanel}>
                  <h3 className={styles.chartTitle} style={{ marginBottom: "16px" }}>Recent Activity Logs</h3>
                  <ul style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "12px", listStyle: "none" }}>
                    {orders.slice(0, 4).map((o) => (
                      <li key={o.$id} style={{ borderBottom: "1px solid rgba(214,183,170,0.06)", paddingBottom: "8px" }}>
                        <span style={{ color: "var(--color-rose-taupe)" }}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>: Order #{o.$id.slice(-6).toUpperCase()} placed (${o.totalAmount.toFixed(2)})
                      </li>
                    ))}
                    {orders.length === 0 && (
                      <li style={{ color: "var(--color-warm-gray)" }}>No recent checkout activities.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === "products" && (
            <div className={styles.cardPanel} style={{ padding: "48px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ backgroundColor: "rgba(214, 183, 170, 0.12)", color: "var(--color-rose-taupe)", padding: "16px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "8px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h3 className={styles.chartTitle} style={{ fontSize: "22px", fontFamily: "var(--font-serif)" }}>Visual Storefront & Catalog Editor</h3>
              <p style={{ color: "var(--color-warm-gray)", maxWidth: "560px", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                Edit your hero banner, collections, and product catalog directly on the live website layout in edit mode. Add new products, remove existing arrivals, or update details inline with instant previews.
              </p>
              <button 
                onClick={() => router.push("/admin/editor")} 
                className={styles.submitBtn}
                style={{ marginTop: "12px", padding: "12px 28px", fontSize: "14px", borderRadius: "20px" }}
              >
                Launch Visual Storefront Editor &rarr;
              </button>
            </div>
          )}

          {/* TAB 3: ORDERS COMPLETED & SHIPPING */}
          {activeTab === "orders" && (
            <div className={styles.cardPanel}>
              <h3 className={styles.chartTitle} style={{ marginBottom: "24px" }}>Manage Customer Orders</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Address</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.$id}>
                        <td><strong>#{o.$id.slice(-6).toUpperCase()}</strong></td>
                        <td>
                          <div>{o.shippingAddress.fullName}</div>
                          <div style={{ fontSize: "11px", color: "var(--color-warm-gray)" }}>{o.userEmail || o.userPhone}</div>
                        </td>
                        <td style={{ fontSize: "11px", color: "rgba(120,108,102,0.8)" }}>
                          {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.country}
                        </td>
                        <td style={{ color: "rgba(120, 108, 102, 0.7)", fontSize: "12px" }}>
                          {o.items.map(item => `${item.name} (x${item.quantity})`).join(", ")}
                        </td>
                        <td><strong>${o.totalAmount.toFixed(2)}</strong></td>
                        <td>
                          <span className={`${styles.statusBadge} ${
                            o.status === "Completed" ? styles.badgeSuccess : styles.badgeWarning
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {o.status === "Processing" && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.$id, "Shipping")}
                                className={styles.actionBtn}
                              >
                                Ship Order
                              </button>
                            )}
                            {o.status === "Shipping" && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.$id, "Completed")}
                                className={styles.actionBtn}
                              >
                                Mark Completed
                              </button>
                            )}
                            {o.status === "Completed" && (
                              <span style={{ fontSize: "12px", color: "rgba(120,108,102,0.4)" }}>No Action</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", fontStyle: "italic", color: "var(--color-warm-gray)" }}>No orders found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOMER INSIGHTS */}
          {activeTab === "customers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Total Customers</div>
                  <div className={styles.statValue}>
                    {new Set(orders.map(o => o.userPhone)).size}
                  </div>
                  <span className={styles.statSubtext}>Active accounts in DB</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Fulfillment Rate</div>
                  <div className={styles.statValue}>
                    {orders.length > 0 
                      ? `${Math.round((completedOrdersCount / orders.length) * 100)}%` 
                      : "0%"
                    }
                  </div>
                  <span className={styles.statSubtext}>Completed orders percentage</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Avg. Order Value</div>
                  <div className={styles.statValue}>
                    ${orders.length > 0 
                      ? (totalRevenue / orders.length).toFixed(2) 
                      : "0.00"
                    }
                  </div>
                  <span className={styles.statSubtext}>Average spent per checkout</span>
                </div>
              </div>

              <div className={styles.bottomGrid}>
                <div className={styles.cardPanel} style={{ gridColumn: "span 2" }}>
                  <h3 className={styles.chartTitle} style={{ marginBottom: "16px" }}>Customer Order Summary</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Email / Phone</th>
                          <th>Purchased Items</th>
                          <th>Total Orders</th>
                          <th>Lifetime Value (LTV)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(orders.map(o => o.userEmail || o.userPhone))).map((contact) => {
                          const customerOrders = orders.filter(o => (o.userEmail || o.userPhone) === contact);
                          const totalSpend = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                          const itemsSummary = Array.from(new Set(
                            customerOrders.flatMap(o => o.items.map(i => i.name))
                          )).slice(0, 3).join(", ");
                          
                          return (
                            <tr key={contact}>
                              <td>{contact}</td>
                              <td style={{ color: "rgba(120,108,102,0.8)", fontSize: "12px" }}>{itemsSummary}</td>
                              <td>{customerOrders.length}</td>
                              <td><strong>${totalSpend.toFixed(2)}</strong></td>
                            </tr>
                          );
                        })}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", color: "var(--color-warm-gray)" }}>No customer data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
