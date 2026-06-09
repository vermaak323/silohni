"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isSavedMessage, setIsSavedMessage] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("silohni_user");
    if (!savedUser) {
      // If not logged in, redirect to home page
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setNameInput(parsed.name);
      setEmailInput(parsed.email);
      

    } catch (err) {
      localStorage.removeItem("silohni_user");
      router.push("/");
    }
  }, [router]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = {
      ...user,
      name: nameInput,
      email: emailInput,
    };
    setUser(updated);
    localStorage.setItem("silohni_user", JSON.stringify(updated));
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 3000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("silohni_user");
    router.push("/");
  };

  if (!user) {
    return (
      <div className={styles.wrapper} style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "var(--color-dark-espresso)", fontSize: "16px" }}>Verifying session...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <Link href="/" className={styles.backHomeLink}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Boutique
        </Link>
        <h1 className={styles.title}>Silohni Profile</h1>
        <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
      </header>

      <div className={styles.grid}>
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className={styles.name}>{user.name}</h2>
            <p className={styles.email}>{user.email}</p>
            <span className={styles.badge}>Member since 2026</span>
          </div>

          <div className={styles.addressCard}>
            <div className={styles.sectionTitle}>
              Shipping Address
              <span className={styles.defaultLabel}>Default</span>
            </div>
            <p className={styles.addressText}>
              128 Artisan Way, Suite 4B<br />
              Portland, OR 97201<br />
              United States
            </p>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <div className={styles.formCard}>
            <h3 className={styles.sectionTitle}>Account Details</h3>
            <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
              {isSavedMessage && (
                <div style={{ backgroundColor: "rgba(120, 108, 102, 0.1)", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "var(--color-dark-espresso)" }}>
                  Changes saved successfully.
                </div>
              )}
              <div className={styles.inputGroup}>
                <label htmlFor="profile-name" className={styles.inputLabel}>Full Name</label>
                <input 
                  type="text" 
                  id="profile-name" 
                  className={styles.inputField} 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="profile-email" className={styles.inputLabel}>Email Address</label>
                <input 
                  type="email" 
                  id="profile-email" 
                  className={styles.inputField} 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.saveBtn}>Save Settings</button>
            </form>
          </div>

          <div className={styles.ordersCard}>
            <h3 className={styles.sectionTitle}>Your Orders</h3>
            <div className={styles.orderList}>
              <div className={styles.orderItem}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>Order #SL-9982</span>
                  <span className={`${styles.orderStatus} ${styles.statusDelivered}`}>Delivered</span>
                </div>
                <p className={styles.orderDate}>Placed on June 2, 2026</p>
                <p className={styles.orderItems}>Minimalist Terracotta Vase, Linen Hand Towel</p>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>Total: <strong>$182.00</strong></span>
                  <button className={styles.orderActionBtn}>Track Order</button>
                </div>
              </div>

              <div className={styles.orderItem}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>Order #SL-9941</span>
                  <span className={`${styles.orderStatus} ${styles.statusProcessing}`}>Processing</span>
                </div>
                <p className={styles.orderDate}>Placed on May 15, 2026</p>
                <p className={styles.orderItems}>Woven Wool Throw Blanket</p>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>Total: <strong>$145.00</strong></span>
                  <button className={styles.orderActionBtn}>View Details</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
