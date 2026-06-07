"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

// Initial Mock Datasets
const initialProducts = [
  { id: "prod-1", name: "Minimalist Terracotta Vase", category: "Pottery", price: "$72.00", stock: 12 },
  { id: "prod-2", name: "Woven Wool Throw Blanket", category: "Textiles", price: "$145.00", stock: 3 },
  { id: "prod-3", name: "Espresso Leather Tote", category: "Leather", price: "$280.00", stock: 8 },
  { id: "prod-4", name: "Ceramic Tableware Set", category: "Pottery", price: "$110.00", stock: 1 },
  { id: "prod-5", name: "Spun Linen Yarn Pack", category: "Textiles", price: "$55.00", stock: 25 },
];

const initialOrders = [
  { id: "SL-9982", customer: "Sarah Jenkins", date: "June 2, 2026", items: "Terracotta Vase, Hand Towel", total: "$182.00", status: "Completed" },
  { id: "SL-9941", customer: "Marcus Vance", date: "May 15, 2026", items: "Woven Wool Throw Blanket", total: "$145.00", status: "Shipping" },
  { id: "SL-9889", customer: "Aanya Patel", date: "May 10, 2026", items: "Espresso Leather Tote", total: "$280.00", status: "Completed" },
  { id: "SL-9872", customer: "David Miller", date: "May 08, 2026", items: "Spun Linen Yarn Pack", total: "$55.00", status: "Processing" },
  { id: "SL-9860", customer: "Elena Rostova", date: "May 05, 2026", items: "Ceramic Tableware Set", total: "$110.00", status: "Processing" },
];

export default function AdminPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "customers">("dashboard");

  // Dynamic States for Interactive Controls
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  
  // Add Product Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("Pottery");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");

  // Store setting states
  const [storeStatus, setStoreStatus] = useState("Open");
  const [broadcastMsg, setBroadcastMsg] = useState("Free global shipping on organic linens this weekend.");

  useEffect(() => {
    const savedUser = localStorage.getItem("silohni_user");
    if (!savedUser) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== "admin") {
        router.push("/profile"); // regular users go to standard profile
        return;
      }
      setAdminUser(parsed);
    } catch (err) {
      localStorage.removeItem("silohni_user");
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const savedMsg = localStorage.getItem("silohni_announcement");
    if (savedMsg) {
      setBroadcastMsg(savedMsg);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("silohni_user");
    router.push("/");
  };

  // Product Actions
  const handleRestock = (prodId: string) => {
    setProducts(prev => 
      prev.map(p => p.id === prodId ? { ...p, stock: p.stock + 10 } : p)
    );
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock) return;
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCat,
      price: `$${parseFloat(newProdPrice).toFixed(2)}`,
      stock: parseInt(newProdStock, 10),
    };
    setProducts(prev => [newProduct, ...prev]);
    // Reset form
    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    setShowAddForm(false);
  };

  // Order Actions
  const handleUpdateOrderStatus = (orderId: string, nextStatus: "Completed" | "Shipping" | "Processing") => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    );
  };

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
                  <div className={styles.statValue}>$24,820.00</div>
                  <span className={styles.statSubtext}>
                    <span className={styles.trendUp}>▲ +18.4%</span> vs last month
                  </span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Orders Completed</div>
                  <div className={styles.statValue}>
                    {orders.filter(o => o.status === "Completed").length}
                  </div>
                  <span className={styles.statSubtext}>
                    <span className={styles.trendUp}>▲ +5.2%</span> vs last month
                  </span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Active Shipments</div>
                  <div className={styles.statValue}>
                    {orders.filter(o => o.status === "Shipping").length}
                  </div>
                  <span className={styles.statSubtext}>
                    12 completed today
                  </span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Low Stock Warnings</div>
                  <div className={styles.statValue} style={{ color: "var(--color-rose-taupe)" }}>
                    {products.filter(p => p.stock <= 3).length}
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
                    <li style={{ borderBottom: "1px solid rgba(214,183,170,0.06)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--color-rose-taupe)" }}>10:14 AM</span>: Completed Order #SL-9982.
                    </li>
                    <li style={{ borderBottom: "1px solid rgba(214,183,170,0.06)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--color-rose-taupe)" }}>09:45 AM</span>: Low Stock Alert (Blanket, 3 units left).
                    </li>
                    <li style={{ borderBottom: "1px solid rgba(214,183,170,0.06)", paddingBottom: "8px" }}>
                      <span style={{ color: "var(--color-rose-taupe)" }}>Yesterday</span>: Updated product image details.
                    </li>
                    <li>
                      <span style={{ color: "var(--color-rose-taupe)" }}>Yesterday</span>: Added Spun Linen Yarn pack.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT MANAGEMENT */}
          {activeTab === "products" && (
            <div className={styles.cardPanel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 className={styles.chartTitle}>Active Product Inventory</h3>
                <button 
                  className={styles.actionBtn}
                  onClick={() => setShowAddForm(prev => !prev)}
                >
                  {showAddForm ? "Cancel Add" : "+ Add New Product"}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddProduct} className={styles.addForm}>
                  <h4>Add Product Form</h4>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Product Name</span>
                      <input 
                        type="text" 
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Clay Coffee Mug" 
                        className={styles.inputField}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Category</span>
                      <select 
                        value={newProdCat}
                        onChange={(e) => setNewProdCat(e.target.value)}
                        className={styles.inputField}
                        style={{ height: "40px" }}
                      >
                        <option value="Pottery">Pottery</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Leather">Leather</option>
                      </select>
                    </div>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Price (USD)</span>
                      <input 
                        type="number" 
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="35.00" 
                        className={styles.inputField}
                        step="0.01"
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Stock Level</span>
                      <input 
                        type="number" 
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="10" 
                        className={styles.inputField}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className={styles.submitBtn}>Submit Product</button>
                </form>
              )}

              <div className={styles.tableWrapper}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {products.map(p => (
                    <div className={styles.productItem} key={p.id}>
                      <div className={styles.productInfo}>
                        <span className={styles.productName}>{p.name}</span>
                        <span className={styles.productCategory}>{p.category} &bull; {p.price}</span>
                      </div>
                      <div className={styles.productActions}>
                        <span className={`${styles.stockCount} ${p.stock <= 3 ? styles.stockAlert : ""}`}>
                          {p.stock} units
                        </span>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => handleRestock(p.id)}
                        >
                          Restock (+10)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS COMPLETED & SHIPPING */}
          {activeTab === "orders" && (
            <div className={styles.cardPanel}>
              <h3 className={styles.chartTitle} style={{ marginBottom: "24px" }}>Manage Orders</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>{o.customer}</td>
                        <td style={{ color: "rgba(247,237,232,0.7)" }}>{o.items}</td>
                        <td>{o.total}</td>
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
                                onClick={() => handleUpdateOrderStatus(o.id, "Shipping")}
                                className={styles.actionBtn}
                              >
                                Ship Order
                              </button>
                            )}
                            {o.status === "Shipping" && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.id, "Completed")}
                                className={styles.actionBtn}
                              >
                                Mark Completed
                              </button>
                            )}
                            {o.status === "Completed" && (
                              <span style={{ fontSize: "12px", color: "rgba(247,237,232,0.4)" }}>No Action</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                  <div className={styles.statValue}>412</div>
                  <span className={styles.statSubtext}>+22 added this week</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Customer Retention</div>
                  <div className={styles.statValue}>68.2%</div>
                  <span className={styles.statSubtext}>High repeat purchases</span>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>Avg. Order Value</div>
                  <div className={styles.statValue}>$142.50</div>
                  <span className={styles.statSubtext}>+3.8% growth</span>
                </div>
              </div>

              <div className={styles.bottomGrid}>
                <div className={styles.cardPanel}>
                  <h3 className={styles.chartTitle} style={{ marginBottom: "16px" }}>Top Spending Customers</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Purchases</th>
                          <th>LTV</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Sarah Jenkins</td>
                          <td>sarah@example.com</td>
                          <td>8 Orders</td>
                          <td><strong>$1,120.00</strong></td>
                        </tr>
                        <tr>
                          <td>Marcus Vance</td>
                          <td>marcus@example.com</td>
                          <td>5 Orders</td>
                          <td><strong>$780.00</strong></td>
                        </tr>
                        <tr>
                          <td>Aanya Patel</td>
                          <td>aanya@example.com</td>
                          <td>3 Orders</td>
                          <td><strong>$450.00</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={styles.cardPanel}>
                  <h3 className={styles.chartTitle} style={{ marginBottom: "16px" }}>Engagement Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span>Pottery Enthusiasts</span>
                        <span>42%</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "rgba(214,183,170,0.1)", borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: "42%", backgroundColor: "var(--color-rose-taupe)", borderRadius: "3px" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span>Linen & Textiles Buyers</span>
                        <span>38%</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "rgba(214,183,170,0.1)", borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: "38%", backgroundColor: "var(--color-rose-taupe)", borderRadius: "3px" }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                        <span>Leather Collectors</span>
                        <span>20%</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "rgba(214,183,170,0.1)", borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: "20%", backgroundColor: "var(--color-rose-taupe)", borderRadius: "3px" }} />
                      </div>
                    </div>
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
