"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const latestArrivals = [
  {
    id: "latest-1",
    src: "/images/latest_1.png",
    alt: "Minimalist handcrafted ceramic vase",
    tag: "Studio Pottery",
    name: "Minimalist Terracotta Vase",
    price: "$72.00",
    category: "Pottery",
  },
  {
    id: "latest-2",
    src: "/images/latest_2.png",
    alt: "Premium handwoven wool throw blanket",
    tag: "Artisan Textiles",
    name: "Woven Wool Throw Blanket",
    price: "$145.00",
    category: "Textiles",
  },
  {
    id: "latest-3",
    src: "/images/latest_3.png",
    alt: "Handcrafted dark espresso leather tote bag",
    tag: "Bespoke Leather",
    name: "Espresso Leather Tote",
    price: "$280.00",
    category: "Leather",
  },
  {
    id: "latest-4",
    src: "/images/best_2.png",
    alt: "Artisan Ceramic Tableware Collection",
    tag: "Studio Pottery",
    name: "Ceramic Tableware Set",
    price: "$110.00",
    category: "Pottery",
  },
  {
    id: "latest-5",
    src: "/images/best_4.png",
    alt: "Organic Spun Yarn and Threads",
    tag: "Artisan Textiles",
    name: "Spun Linen Yarn Pack",
    price: "$55.00",
    category: "Textiles",
  },
];

const categories = ["All", "Pottery", "Textiles", "Leather"];

const galleryItems = [
  {
    id: "gallery-1",
    src: "/images/gallery_1.png",
    alt: "Cotton Anarkali Linen Dress",
    title: "Cotton Anarkali",
    type: "trough",
  },
  {
    id: "gallery-2",
    src: "/images/gallery_2.png",
    alt: "Silk Straight Kurta",
    title: "Silk Straight",
    type: "peak",
  },
  {
    id: "gallery-3",
    src: "/images/gallery_3.png",
    alt: "Georgette Flared Dress",
    title: "Georgette Flared",
    type: "trough",
  },
  {
    id: "gallery-4",
    src: "/images/gallery_4.png",
    alt: "Chanderi Blend Suit",
    title: "Chanderi Blend",
    type: "peak",
  },
];

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auth & Profile states
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [announcement, setAnnouncement] = useState("Free global shipping on organic linens this weekend.");

  // Load session & announcement on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("silohni_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem("silohni_user");
      }
    }
    const savedMsg = localStorage.getItem("silohni_announcement");
    if (savedMsg) {
      setAnnouncement(savedMsg);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("Please fill in all fields.");
      return;
    }
    
    // Explicit Test Credentials Logic
    if (emailInput === "admin@silohni.com") {
      if (passwordInput === "admin123") {
        const adminUser = {
          name: "Admin Administrator",
          email: emailInput,
          role: "admin",
        };
        setUser(adminUser);
        localStorage.setItem("silohni_user", JSON.stringify(adminUser));
        setAuthError("");
        setEmailInput("");
        setPasswordInput("");
        // Redirect Admin immediately to full dashboard
        router.push("/admin");
        setIsAuthDrawerOpen(false);
        return;
      } else {
        setAuthError("Incorrect password for Administrator.");
        return;
      }
    }

    if (emailInput === "user@silohni.com" && passwordInput !== "user123") {
      setAuthError("Incorrect password for Test User.");
      return;
    }

    // Accept any other valid input
    const memberUser = {
      name: emailInput.split("@")[0].charAt(0).toUpperCase() + emailInput.split("@")[0].slice(1),
      email: emailInput,
      role: "member",
    };
    setUser(memberUser);
    localStorage.setItem("silohni_user", JSON.stringify(memberUser));
    setAuthError("");
    setEmailInput("");
    setPasswordInput("");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !passwordInput) {
      setAuthError("Please fill in all fields.");
      return;
    }
    const memberUser = {
      name: nameInput,
      email: emailInput,
      role: "member",
    };
    setUser(memberUser);
    localStorage.setItem("silohni_user", JSON.stringify(memberUser));
    setAuthError("");
    setNameInput("");
    setEmailInput("");
    setPasswordInput("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("silohni_user");
    setUser(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Intersection Observer scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(`.${styles.scrollReveal}`);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [activeCategory]);

  const filteredItems = activeCategory === "All"
    ? latestArrivals
    : latestArrivals.filter((item) => item.category === activeCategory);

  // Autoplay effect using horizontal scroll
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If we reached the end (with a small threshold), wrap around to start
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, filteredItems]);

  const handleScrollTrack = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollProgress((scrollLeft / maxScroll) * 100);
      } else {
        setScrollProgress(0);
      }
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className={styles.wrapper}>
      {/* Navigation Navbar */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`} id="navbar">
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <Image
              src="/silohniLogoLight.png"
              alt="Silohni Logo"
              width={84}
              height={56}
              priority
              className={styles.logoImage}
            />
          </div>
          <nav className={styles.nav} aria-label="Main Navigation">
            <a href="#" className={styles.navLink}>Home</a>
            <a href="#" className={styles.navLink}>Categories</a>
            <a href="#" className={styles.navLink}>Contact Us</a>
            <a href="#" className={styles.navLink}>Delivery</a>
            <a href="#" className={styles.navLink}>Support</a>
          </nav>
          <div className={styles.actions}>
            {/* Search Icon */}
            <div className={styles.actionIcon} aria-label="Search" id="action-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            {/* Messages Icon */}
            <div className={`${styles.actionIcon}  ${styles.desktopOnlyIcon}`} aria-label="Messages" id="action-messages">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            {/* Shopping Bag Icon */}
            <div className={styles.actionIcon} aria-label="Shopping Bag" id="action-cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            {/* Profile Icon */}
            <div className={styles.actionIcon} aria-label="Profile" id="action-profile" onClick={() => setIsAuthDrawerOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            {/* Hamburger Icon */}
            <div className={styles.hamburgerIcon} aria-label="Menu" onClick={() => setIsMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </div>
          </div>
        </div>
        {announcement && (
          <div className={styles.announcementBar}>
            <div className={styles.marqueeText}>
              {announcement}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`${styles.mobileDrawer} ${isMenuOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerClose} onClick={() => setIsMenuOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <nav className={styles.drawerNav}>
          <a href="#" className={styles.drawerNavLink} onClick={() => setIsMenuOpen(false)}>Home</a>
          <a href="#" className={styles.drawerNavLink} onClick={() => setIsMenuOpen(false)}>Categories</a>
          <a href="#" className={styles.drawerNavLink} onClick={() => setIsMenuOpen(false)}>Contact Us</a>
          <a href="#" className={styles.drawerNavLink} onClick={() => setIsMenuOpen(false)}>Delivery</a>
          <a href="#" className={styles.drawerNavLink} onClick={() => setIsMenuOpen(false)}>Support</a>
        </nav>
      </div>

      {/* Auth & Profile Drawer Slide-over */}
      <div 
        className={`${styles.authDrawerBackdrop} ${isAuthDrawerOpen ? styles.authDrawerBackdropOpen : ""}`} 
        onClick={() => setIsAuthDrawerOpen(false)} 
      />
      <div className={`${styles.authDrawer} ${isAuthDrawerOpen ? styles.authDrawerOpenState : ""}`}>
        <div className={styles.authDrawerClose} onClick={() => { setIsAuthDrawerOpen(false); setAuthError(""); }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <div className={styles.authDrawerContent}>
          {!user ? (
            <div className={styles.authFormWrapper}>
              <div className={styles.authTabs}>
                <button 
                  className={`${styles.authTabBtn} ${authMode === "signin" ? styles.authTabBtnActive : ""}`}
                  onClick={() => { setAuthMode("signin"); setAuthError(""); }}
                >
                  Sign In
                </button>
                <button 
                  className={`${styles.authTabBtn} ${authMode === "signup" ? styles.authTabBtnActive : ""}`}
                  onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                >
                  Register
                </button>
              </div>

              <h2 className={styles.authTitle}>
                {authMode === "signin" ? "Welcome Back to Silohni" : "Join the Silohni Community"}
              </h2>
              <p className={styles.authSubtitle}>
                {authMode === "signin" 
                  ? "Access your saved addresses, check order status, and track delivery details." 
                  : "Create an account for natural lifestyle inspiration, order history tracking, and fast checkout."}
              </p>

              <form onSubmit={authMode === "signin" ? handleLogin : handleRegister} className={styles.authForm}>
                {authError && <div className={styles.authErrorAlert}>{authError}</div>}
                
                {authMode === "signup" && (
                  <div className={styles.inputGroup}>
                    <label htmlFor="auth-name" className={styles.inputLabel}>Full Name</label>
                    <input 
                      type="text" 
                      id="auth-name" 
                      className={styles.authInputField} 
                      placeholder="Jane Doe"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="auth-email" className={styles.inputLabel}>Email Address</label>
                  <input 
                    type="email" 
                    id="auth-email" 
                    className={styles.authInputField} 
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="auth-password" className={styles.inputLabel}>Password</label>
                  <input 
                    type="password" 
                    id="auth-password" 
                    className={styles.authInputField} 
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>

                <button type="submit" className={styles.authSubmitBtn}>
                  {authMode === "signin" ? "Sign In to Account" : "Register Account"}
                </button>
              </form>

              <div className={styles.socialDivider}>
                <span>or continue with</span>
              </div>

              <div className={styles.socialAuthButtons}>
                <button className={styles.socialBtn} onClick={() => {
                  const u = { name: "Google Guest", email: "google@guest.com", role: "member" };
                  setUser(u);
                  localStorage.setItem("silohni_user", JSON.stringify(u));
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.6 0 11-4.65 11-11.19 0-.756-.08-1.333-.177-1.815H12.24z"/>
                  </svg>
                  Google
                </button>
                <button className={styles.socialBtn} onClick={() => {
                  const u = { name: "Apple User", email: "apple@guest.com", role: "member" };
                  setUser(u);
                  localStorage.setItem("silohni_user", JSON.stringify(u));
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.profileWrapper}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar} style={user.role === "admin" ? { backgroundColor: "var(--color-dark-espresso)", color: "var(--text-light)" } : {}}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className={styles.profileName}>{user.name}</h2>
                <p className={styles.profileEmail}>{user.email}</p>
                <span className={`${styles.profileBadge} ${user.role === "admin" ? styles.profileBadgeAdmin : ""}`}>
                  {user.role === "admin" ? "Store Administrator" : "Member since 2026"}
                </span>

                <button 
                  onClick={() => {
                    if (user.role === "admin") {
                      router.push("/admin");
                    } else {
                      router.push("/profile");
                    }
                    setIsAuthDrawerOpen(false);
                  }} 
                  className={styles.fullProfileBtn}
                >
                  {user.role === "admin" ? "Go to Command Centre" : "Go to Full Profile Page"} &rarr;
                </button>
              </div>

              <div className={styles.profileSection}>
                <h3 className={styles.profileSectionTitle}>Recent Orders</h3>
                <div className={styles.orderHistory}>
                  <div className={styles.orderCard}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>Order #SL-9982</span>
                      <span className={`${styles.orderStatus} ${styles.statusDelivered}`}>Delivered</span>
                    </div>
                    <p className={styles.orderDate}>Placed on June 2, 2026</p>
                    <p className={styles.orderItems}>Minimalist Terracotta Vase, Linen Hand Towel</p>
                    <div className={styles.orderFooter}>
                      <span>Total: <strong>$182.00</strong></span>
                      <button className={styles.orderActionBtn}>Track Delivery</button>
                    </div>
                  </div>

                  <div className={styles.orderCard}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>Order #SL-9941</span>
                      <span className={`${styles.orderStatus} ${styles.statusProcessing}`}>Processing</span>
                    </div>
                    <p className={styles.orderDate}>Placed on May 15, 2026</p>
                    <p className={styles.orderItems}>Woven Wool Throw Blanket</p>
                    <div className={styles.orderFooter}>
                      <span>Total: <strong>$145.00</strong></span>
                      <button className={styles.orderActionBtn}>View Details</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.profileSection}>
                <h3 className={styles.profileSectionTitle}>Shipping Details</h3>
                <div className={styles.addressCard}>
                  <div className={styles.addressHeader}>
                    <strong>Home Address</strong>
                    <span className={styles.defaultLabel}>Default</span>
                  </div>
                  <p className={styles.addressText}>
                    128 Artisan Way, Suite 4B<br />
                    Portland, OR 97201<br />
                    United States
                  </p>
                </div>
              </div>

              <button onClick={handleSignOut} className={styles.signOutBtn}>
                Sign Out from Account
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.page}>

      {/* Hero Section */}
      <section className={styles.hero} id="hero-section">
        <Image
          src="/images/hero_banner.png"
          alt="Silohni Studio banner featuring minimalist ceramics and linens"
          fill
          priority
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <span className={styles.heroTagline}>Exquisite Craftsmanship</span>
            <h1 className={styles.heroTitle}>A Warm Embrace of Pure Organic Textures</h1>
            <p className={styles.heroDesc}>
              Discover handcrafted linens, studio pottery, and slow-made garments woven to tell a story of organic simplicity and refined comfort.
            </p>
            <button className={styles.heroBtn} id="hero-cta">Explore the Collection</button>
          </div>
        </div>
      </section>

      {/* Latest Arrival Section */}
      <section className={`${styles.section} ${styles.scrollReveal}`} id="latest-arrival-section">
        <div className={styles.latestSectionWrapper}>
          {/* Left Column: Heading and Info */}
          <div className={`${styles.latestLeftCol} ${styles.scrollReveal} ${styles.stagger1}`}>
            <span className={styles.carouselCardTag}>New Season</span>
            <h2 className={styles.sectionTitle} style={{ textAlign: "left", margin: 0, alignSelf: "flex-start" }}>Latest Arrival</h2>
            <p className={styles.heroDesc} style={{ color: "var(--color-warm-gray)", fontSize: "14px" }}>
              Explore our fresh collection of organic pottery, handwoven textiles, and slow-made garments designed for mindful living.
            </p>
            <button className={styles.heroBtn} style={{ margin: 0 }}>
              Explore All Collection &rarr;
            </button>
          </div>

          {/* Right Column: Tabs and Carousel */}
          <div className={`${styles.latestRightCol} ${styles.scrollReveal} ${styles.stagger2}`}>
            {/* Filter Tabs */}
            <div className={styles.filterTabs}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterTabBtn} ${activeCategory === cat ? styles.filterTabBtnActive : ""}`}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveCategory(cat);
                    // scroll back to start when category changes
                    if (scrollRef.current) {
                      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                    }
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable Carousel Track */}
            <div
              className={styles.carouselScrollTrack}
              ref={scrollRef}
              onScroll={handleScrollTrack}
            >
              {filteredItems.map((item, index) => (
                <div className={`${styles.overlayCard} ${styles.scrollReveal} ${styles[`stagger${(index % 4) + 1}`]}`} key={item.id}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="280px"
                    className={styles.cardBgImage}
                  />
                  <div className={styles.cardOverlayContent}>
                    <span className={styles.cardOverlayTag}>{item.tag}</span>
                    <h3 className={styles.cardOverlayName}>{item.name}</h3>
                    <span className={styles.cardOverlayPrice}>{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls block: Arrows and Progress Bar */}
            <div className={styles.latestControlsBlock}>
              <div className={styles.arrowsGroup}>
                <button
                  className={styles.carouselArrow}
                  onClick={handlePrev}
                  aria-label="Previous Slide"
                  style={{ width: "36px", height: "36px" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <button
                  className={styles.carouselPlayPause}
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
                  style={{ width: "36px", height: "36px" }}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                      <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  )}
                </button>
                <button
                  className={styles.carouselArrow}
                  onClick={handleNext}
                  aria-label="Next Slide"
                  style={{ width: "36px", height: "36px" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

              {/* Progress Line */}
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: `${scrollProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Collections Section */}
      <section className={`${styles.section} ${styles.scrollReveal}`} id="best-collections-section">
        <h2 className={styles.sectionTitle}>Best collections</h2>
        <div className={styles.bestGrid}>
          {/* Card 1 - Tall Left */}
          <div className={`${styles.bestCard1} ${styles.scrollReveal} ${styles.stagger1}`} id="best-collection-1">
            <Image
              src="/images/best_1.png"
              alt="Organic Linen Apparel Collection"
              fill
              sizes="(max-width: 992px) 100vw, 450px"
              className={styles.cardImage}
            />
            <div className={styles.bestOverlay}>
              <h3 className={styles.bestTitle}>Slow-Wear Apparel</h3>
              <span className={styles.bestSubtitle}>Linen Garments</span>
            </div>
          </div>

          {/* Card 2 - Middle Top */}
          <div className={`${styles.bestCard2} ${styles.scrollReveal} ${styles.stagger2}`} id="best-collection-2">
            <Image
              src="/images/best_2.png"
              alt="Artisan Tableware Collection"
              fill
              sizes="(max-width: 992px) 100vw, 380px"
              className={styles.cardImage}
            />
            <div className={styles.bestOverlay}>
              <h3 className={styles.bestTitle}>Artisan Tableware</h3>
              <span className={styles.bestSubtitle}>Handmade Ceramics</span>
            </div>
          </div>

          {/* Card 3 - Middle Bottom */}
          <div className={`${styles.bestCard3} ${styles.scrollReveal} ${styles.stagger3}`} id="best-collection-3">
            <Image
              src="/images/best_3.png"
              alt="Cosy Home Living Space Decor"
              fill
              sizes="(max-width: 992px) 100vw, 380px"
              className={styles.cardImage}
            />
            <div className={styles.bestOverlay}>
              <h3 className={styles.bestTitle}>Warm Living Decor</h3>
              <span className={styles.bestSubtitle}>Cozy Spaces</span>
            </div>
          </div>

          {/* Card 4 - Right Top */}
          <div className={`${styles.bestCard4} ${styles.scrollReveal} ${styles.stagger4}`} id="best-collection-4">
            <Image
              src="/images/best_4.png"
              alt="Organic Spun Yarn and Threads"
              fill
              sizes="(max-width: 992px) 100vw, 380px"
              className={styles.cardImage}
            />
            <div className={styles.bestOverlay}>
              <h3 className={styles.bestTitle}>Raw Organic Yarn</h3>
              <span className={styles.bestSubtitle}>Natural Fibers</span>
            </div>
          </div>

          {/* Card 5 - Right Bottom */}
          <div className={`${styles.bestCard5} ${styles.scrollReveal} ${styles.stagger5}`} id="best-collection-5">
            <Image
              src="/images/best_5.png"
              alt="Home Fragrances and Candles"
              fill
              sizes="(max-width: 992px) 100vw, 380px"
              className={styles.cardImage}
            />
            <div className={styles.bestOverlay}>
              <h3 className={styles.bestTitle}>Amber Glass Fragrance</h3>
              <span className={styles.bestSubtitle}>Essential Scents</span>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className={`${styles.section} ${styles.scrollReveal}`} id="image-gallery-section" style={{ padding: "80px 0", overflow: "visible" }}>
        <h2 className={styles.sectionTitle}>Image Gallery</h2>
        
        <div className={styles.waveGallerySection}>
          {/* SVG Wave Line in the background */}
          <svg className={styles.waveSvgBackground} viewBox="0 0 1000 400" preserveAspectRatio="none">
            <path
              className={styles.wavePath}
              d="M 0 200 C 62.5 200, 62.5 280, 125 280 C 250 280, 250 120, 375 120 C 500 120, 500 280, 625 280 C 750 280, 750 120, 875 120 C 937.5 120, 937.5 200, 1000 200"
            />
            {/* Circles at peaks and troughs */}
            <circle cx="125" cy="280" r="5" className={styles.waveDot} />
            <circle cx="375" cy="120" r="5" className={styles.waveDot} />
            <circle cx="625" cy="280" r="5" className={styles.waveDot} />
            <circle cx="875" cy="120" r="5" className={styles.waveDot} />
          </svg>

          {/* Cards Container */}
          <div className={styles.waveGalleryContainer}>
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className={`${styles.wavePolaroid} ${
                  item.type === "peak" ? styles.wavePolaroidPeak : styles.wavePolaroidTrough
                } ${styles.scrollReveal} ${styles[`stagger${(index % 4) + 1}`]}`}
              >
                {/* Hanging Line */}
                <div className={styles.wavePolaroidLinkLine} />
                
                <div className={styles.wavePolaroidImageWrapper}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="190px"
                    className={styles.cardImage}
                  />
                </div>
                <span className={styles.wavePolaroidTitle}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`${styles.section} ${styles.scrollReveal}`} id="testimonials-section">
        <h2 className={styles.sectionTitle}>Testimonials</h2>
        <div className={styles.testimonialsGrid}>
          {/* Testimonial 1 */}
          <div className={`${styles.testimonialCard} ${styles.scrollReveal} ${styles.stagger1}`} id="testimonial-card-1">
            <div className={styles.pendantLine}>
              <div className={styles.pendantDot} />
            </div>
            <div className={styles.avatarWrapper}>
              <Image
                src="/images/avatar_1.png"
                alt="Portrait of Sarah Jenkins, verified customer"
                fill
                sizes="90px"
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.speechBubble}>
              <p className={styles.testimonialText}>
                &ldquo;Absolutely fell in love with their ceramics! The earthy finish and minimal design are perfect. The packaging was also completely plastic-free.&rdquo;
              </p>
              <span className={styles.testimonialAuthor}>— Sarah J.</span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className={`${styles.testimonialCard} ${styles.scrollReveal} ${styles.stagger2}`} id="testimonial-card-2">
            <div className={styles.pendantLine}>
              <div className={styles.pendantDot} />
            </div>
            <div className={styles.avatarWrapper}>
              <Image
                src="/images/avatar_2.png"
                alt="Portrait of Marcus Vance, verified customer"
                fill
                sizes="90px"
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.speechBubble}>
              <p className={styles.testimonialText}>
                &ldquo;The woolen throws are incredibly cozy and heavy-weight. You can tell they were woven with care. Silohni is my absolute favorite home boutique now.&rdquo;
              </p>
              <span className={styles.testimonialAuthor}>— Marcus V.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${styles.footer} ${styles.scrollReveal}`} id="footer">
        <div className={`${styles.footerLogo} ${styles.scrollReveal} ${styles.stagger1}`}>Silohni</div>
        <nav className={`${styles.footerLinks} ${styles.scrollReveal} ${styles.stagger2}`} aria-label="Footer Navigation">
          <a href="#" className={styles.footerLink}>About Us</a>
          <a href="#" className={styles.footerLink}>Store Policy</a>
          <a href="#" className={styles.footerLink}>FAQ</a>
          <a href="#" className={styles.footerLink}>Careers</a>
          <a href="#" className={styles.footerLink}>Newsletter</a>
        </nav>
        <div className={`${styles.copyright} ${styles.scrollReveal} ${styles.stagger3}`}>
          &copy; {new Date().getFullYear()} Silohni. All rights reserved. Designed with organic simplicity.
        </div>
      </footer>
    </div>
  </div>
);
}
