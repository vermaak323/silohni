"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { account } from "@/lib/appwrite-client";
import { ID } from "appwrite";

const latestArrivals = [
  {
    id: "latest-1",
    src: "/images/latest_1.png",
    alt: "Minimalist handcrafted ceramic vase",
    tag: "Studio Pottery",
    name: "Minimalist Terracotta Vase",
    price: "₹72.00",
    category: "Pottery",
  },
  {
    id: "latest-2",
    src: "/images/latest_2.png",
    alt: "Premium handwoven wool throw blanket",
    tag: "Artisan Textiles",
    name: "Woven Wool Throw Blanket",
    price: "₹145.00",
    category: "Textiles",
  },
  {
    id: "latest-3",
    src: "/images/latest_3.png",
    alt: "Handcrafted dark espresso leather tote bag",
    tag: "Bespoke Leather",
    name: "Espresso Leather Tote",
    price: "₹280.00",
    category: "Leather",
  },
  {
    id: "latest-4",
    src: "/images/best_2.png",
    alt: "Artisan Ceramic Tableware Collection",
    tag: "Studio Pottery",
    name: "Ceramic Tableware Set",
    price: "₹110.00",
    category: "Pottery",
  },
  {
    id: "latest-5",
    src: "/images/best_4.png",
    alt: "Organic Spun Yarn and Threads",
    tag: "Artisan Textiles",
    name: "Spun Linen Yarn Pack",
    price: "₹55.00",
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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  src: string;
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Auth & Profile states
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  
  // Email/OTP Auth states
  const [emailAddress, setEmailAddress] = useState("");

  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [appwriteUserId, setAppwriteUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");

  // E-commerce Cart & Checkout states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingCountry, setShippingCountry] = useState("United States");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [announcement, setAnnouncement] = useState("Free global shipping on organic linens this weekend.");
  const [productsList, setProductsList] = useState(latestArrivals);
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

  // Load session & announcement on mount, fetch products
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

    const savedConfig = localStorage.getItem("silohni_storefront_config");
    let currentLatestArrivalIds = [] as string[];
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
        if (parsed.latestArrivalIds) {
          currentLatestArrivalIds = parsed.latestArrivalIds;
        }
      } catch (e) {
        console.error("Error loading storefront config:", e);
      }
    }

    // Load Cart from localStorage if present
    const savedCart = localStorage.getItem("silohni_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        localStorage.removeItem("silohni_cart");
      }
    }

    // Fetch dynamic products from MongoDB
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const dbProducts = data.map((p: any) => ({
              id: p.$id,
              src: p.imageUrl,
              alt: p.name,
              tag: p.category,
              name: p.name,
              price: `₹${p.price.toFixed(2)}`,
              category: p.category,
            }));
            
            if (currentLatestArrivalIds && currentLatestArrivalIds.length > 0) {
              const curated = dbProducts.filter((p: any) => currentLatestArrivalIds.includes(p.id));
              if (curated.length > 0) {
                setProductsList(curated);
              } else {
                setProductsList([...dbProducts, ...latestArrivals]);
              }
            } else {
              setProductsList([...dbProducts, ...latestArrivals]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading products:", err);
      }
    }
    fetchProducts();
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("silohni_cart", JSON.stringify(cart));
  }, [cart]);

  // Load orders when user logs in
  useEffect(() => {
    if (user) {
      loadUserOrders();
    } else {
      setUserOrders([]);
    }
  }, [user]);

  const loadUserOrders = async () => {
    try {
      const res = await fetch("/api/profile/orders");
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error("Error loading user orders:", err);
    }
  };



  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    
    if (!emailAddress) {
      setAuthError("Please enter your email address.");
      return;
    }

    try {
      setIsVerifying(true);
      // Appwrite Email OTP token creation
      const token = await account.createEmailToken({
        userId: ID.unique(),
        email: emailAddress
      });
      setAppwriteUserId(token.userId);
      setOtpSent(true);
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setAuthError(err.message || "Failed to send OTP code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!otpCode || !appwriteUserId) {
      setAuthError("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      setIsVerifying(true);
      // Establish session with HTTP-only cookie and synchronize DB
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: otpCode,
          userId: appwriteUserId,
          email: emailAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize server session.");
      }

      const loggedUser = {
        name: data.user.name || `User ${data.user.email.split('@')[0]}`,
        email: data.user.email,
        role: data.user.role,
      };

      setUser(loggedUser);
      localStorage.setItem("silohni_user", JSON.stringify(loggedUser));
      setIsAuthDrawerOpen(false);
      setOtpSent(false);
      setOtpCode("");
      setEmailAddress("");
      setAppwriteUserId(null);


    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setAuthError(err.message || "Invalid verification code. Please check and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("silohni_user");
    setUser(null);
    router.push("/");
  };

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const cleanedPrice = parseFloat(product.price.replace(/[^0-9.]/g, ""));
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: cleanedPrice, quantity: 1, src: product.src }];
    });
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = (itemId: string, amount: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!user) {
      setCheckoutError("You must sign in to place an order.");
      setIsCheckoutOpen(false);
      setIsAuthDrawerOpen(true);
      return;
    }

    if (!shippingName || !shippingStreet || !shippingCity || !shippingZip || !shippingCountry) {
      setCheckoutError("Please fill in all shipping details.");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName: shippingName,
            street: shippingStreet,
            city: shippingCity,
            zip: shippingZip,
            country: shippingCountry,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      setCart([]);
      setCheckoutSuccess(true);
      loadUserOrders(); // Reload orders in user profile
      setTimeout(() => {
        setCheckoutSuccess(false);
        setIsCheckoutOpen(false);
      }, 3000);
    } catch (err: any) {
      setCheckoutError(err.message || "An unexpected error occurred during checkout.");
    } finally {
      setIsVerifying(false);
    }
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
  }, [activeCategory, productsList]);

  const filteredItems = activeCategory === "All"
    ? productsList
    : productsList.filter((item) => item.category === activeCategory);

  // Autoplay effect using horizontal scroll
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
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

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className={styles.wrapper}>


      {/* Navigation Navbar */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`} id="navbar">
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <Image
              src="/silohniLogoLight.png"
              alt="Silohni Logo"
              width={69}
              height={46}
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
            <div className={styles.actionIcon} aria-label="Search" id="action-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <div className={`${styles.actionIcon}  ${styles.desktopOnlyIcon}`} aria-label="Messages" id="action-messages">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            {/* Shopping Bag Icon with item count */}
            <div 
              className={styles.actionIcon} 
              aria-label="Shopping Bag" 
              id="action-cart" 
              onClick={() => setIsCartDrawerOpen(true)}
              style={{ position: "relative" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {cart.length > 0 && (
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
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
            <div className={styles.actionIcon} aria-label="Profile" id="action-profile" onClick={() => setIsAuthDrawerOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className={styles.hamburgerIcon} aria-label="Menu" onClick={() => setIsMenuOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </div>
          </div>
        </div>
      </header>
      {announcement && (
        <div className={styles.announcementBar}>
          <div className={styles.marqueeText}>
            {announcement}
          </div>
        </div>
      )}

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
              <h2 className={styles.authTitle}>Secure Email Authentication</h2>
              <p className={styles.authSubtitle}>
                Sign in instantly using a one-time OTP code sent to your email address.
              </p>

              {authError && <div className={styles.authErrorAlert}>{authError}</div>}

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className={styles.authForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="auth-email" className={styles.inputLabel}>Email Address</label>
                    <input 
                      type="email" 
                      id="auth-email" 
                      className={styles.authInputField} 
                      placeholder="you@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" disabled={isVerifying} className={styles.authSubmitBtn}>
                    {isVerifying ? "Sending Email OTP..." : "Send Verification OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className={styles.authForm}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="auth-otp" className={styles.inputLabel}>Enter 6-Digit OTP Code</label>
                    <input 
                      type="text" 
                      id="auth-otp" 
                      className={styles.authInputField} 
                      placeholder="123456"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" disabled={isVerifying} className={styles.authSubmitBtn}>
                    {isVerifying ? "Verifying..." : "Verify & Sign In"}
                  </button>

                  <button 
                    type="button" 
                    onClick={() => { setOtpSent(false); setOtpCode(""); }} 
                    className={styles.socialBtn}
                    style={{ marginTop: "12px", border: "none", background: "none", textDecoration: "underline" }}
                  >
                    Change Email Address
                  </button>
                </form>
              )}
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
                <h3 className={styles.profileSectionTitle}>Order History</h3>
                <div className={styles.orderHistory}>
                  {userOrders.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--color-warm-gray)", fontStyle: "italic" }}>No orders placed yet.</p>
                  ) : (
                    userOrders.map((ord: any) => (
                      <div className={styles.orderCard} key={ord.$id}>
                        <div className={styles.orderMeta}>
                          <span className={styles.orderId}>Order #{ord.$id.slice(-6).toUpperCase()}</span>
                          <span className={`${styles.orderStatus} ${
                            ord.status === "Completed" ? styles.statusDelivered : styles.statusProcessing
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className={styles.orderDate}>Placed on {new Date(ord.createdAt).toLocaleDateString()}</p>
                        <p className={styles.orderItems}>
                          {ord.items.map((i: any) => `${i.name} (x${i.quantity})`).join(", ")}
                        </p>
                        <div className={styles.orderFooter}>
                          <span>Total: <strong>₹{ord.totalAmount.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button onClick={handleSignOut} className={styles.signOutBtn}>
                Sign Out from Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart Drawer Slide-over */}
      <div 
        className={`${styles.authDrawerBackdrop} ${isCartDrawerOpen ? styles.authDrawerBackdropOpen : ""}`} 
        onClick={() => setIsCartDrawerOpen(false)} 
      />
      <div className={`${styles.authDrawer} ${isCartDrawerOpen ? styles.authDrawerOpenState : ""}`}>
        <div className={styles.authDrawerClose} onClick={() => setIsCartDrawerOpen(false)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <div className={styles.authDrawerContent}>
          <div className={styles.authFormWrapper} style={{ width: "100%" }}>
            <h2 className={styles.authTitle} style={{ marginBottom: "8px" }}>Shopping Bag</h2>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "var(--color-warm-gray)", fontSize: "14px", fontStyle: "italic" }}>Your cart is empty.</p>
                <button className={styles.authSubmitBtn} style={{ marginTop: "16px" }} onClick={() => setIsCartDrawerOpen(false)}>Continue Shopping</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "50vh", overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(120,108,102,0.1)", paddingBottom: "12px" }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ position: "relative", width: "50px", height: "50px", borderRadius: "4px", overflow: "hidden", backgroundColor: "#fbf6f3" }}>
                          <img src={item.src} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-dark-espresso)" }}>{item.name}</span>
                          <span style={{ fontSize: "11px", color: "var(--color-rose-taupe)" }}>₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ border: "1px solid rgba(120,108,102,0.3)", background: "white", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}>-</button>
                        <span style={{ fontSize: "13px", fontWeight: "bold" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ border: "1px solid rgba(120,108,102,0.3)", background: "white", padding: "2px 8px", borderRadius: "4px", cursor: "pointer" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(120,108,102,0.15)", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <span style={{ fontWeight: "600", fontSize: "15px" }}>Estimated Total:</span>
                    <span style={{ fontWeight: "700", fontSize: "16px", color: "var(--color-rose-taupe)" }}>₹{cartTotal.toFixed(2)}</span>
                  </div>

                  <button 
                    className={styles.authSubmitBtn} 
                    onClick={() => {
                      if (!user) {
                        setIsCartDrawerOpen(false);
                        setIsAuthDrawerOpen(true);
                      } else {
                        setIsCartDrawerOpen(false);
                        setIsCheckoutOpen(true);
                      }
                    }}
                  >
                    {user ? "Proceed to Checkout" : "Sign In to Checkout"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Form Modal */}
      {isCheckoutOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          backdropFilter: "blur(4px)"
        }}>
          <div className={styles.authFormWrapper} style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "var(--shadow-lg)",
            position: "relative"
          }}>
            <button 
              onClick={() => setIsCheckoutOpen(false)} 
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}
            >
              &times;
            </button>

            {checkoutSuccess ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <h3 className={styles.authTitle} style={{ color: "#799470" }}>Order Placed Successfully!</h3>
                <p style={{ color: "var(--color-warm-gray)", fontSize: "13px", marginTop: "8px" }}>Thank you for shopping at Silohni. Your order is processing.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className={styles.authForm} style={{ gap: "14px" }}>
                <h3 className={styles.authTitle}>Delivery Checkout</h3>
                <p className={styles.authSubtitle} style={{ marginBottom: "10px" }}>Enter details to complete your order of <strong>₹{cartTotal.toFixed(2)}</strong>.</p>
                
                {checkoutError && <div className={styles.authErrorAlert}>{checkoutError}</div>}

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Full Name</label>
                  <input 
                    type="text" 
                    className={styles.authInputField} 
                    value={shippingName} 
                    onChange={(e) => setShippingName(e.target.value)} 
                    placeholder="Jane Doe" 
                    required 
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Street Address</label>
                  <input 
                    type="text" 
                    className={styles.authInputField} 
                    value={shippingStreet} 
                    onChange={(e) => setShippingStreet(e.target.value)} 
                    placeholder="128 Artisan Way" 
                    required 
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>City</label>
                    <input 
                      type="text" 
                      className={styles.authInputField} 
                      value={shippingCity} 
                      onChange={(e) => setShippingCity(e.target.value)} 
                      placeholder="Portland" 
                      required 
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Zip / Postal Code</label>
                    <input 
                      type="text" 
                      className={styles.authInputField} 
                      value={shippingZip} 
                      onChange={(e) => setShippingZip(e.target.value)} 
                      placeholder="97201" 
                      required 
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Country</label>
                  <input 
                    type="text" 
                    className={styles.authInputField} 
                    value={shippingCountry} 
                    onChange={(e) => setShippingCountry(e.target.value)} 
                    placeholder="United States" 
                    required 
                  />
                </div>

                <button type="submit" disabled={isVerifying} className={styles.authSubmitBtn} style={{ marginTop: "10px" }}>
                  {isVerifying ? "Processing Order..." : "Confirm & Place Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className={styles.page}>
        {/* Hero Section */}
        <section className={styles.hero} id="hero-section">
          {storefrontConfig.hero.mediaType === "video" ? (
            <video
              src={storefrontConfig.hero.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className={styles.heroImage}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          ) : (
            <Image
              src={storefrontConfig.hero.mediaUrl}
              alt="Silohni Studio banner featuring minimalist ceramics and linens"
              fill
              priority
              className={styles.heroImage}
            />
          )}
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <span className={styles.heroTagline}>{storefrontConfig.hero.tagline}</span>
              <h1 className={styles.heroTitle}>{storefrontConfig.hero.title}</h1>
              <p className={styles.heroDesc}>
                {storefrontConfig.hero.description}
              </p>
              <button className={styles.heroBtn} id="hero-cta" onClick={() => router.push("/products")}>Explore the Collection</button>
            </div>
          </div>
        </section>

        {/* Latest Arrival Section */}
        <section className={`${styles.section} ${styles.scrollReveal}`} id="latest-arrival-section">
          <div className={styles.latestSectionWrapper}>
            <div className={`${styles.latestLeftCol} ${styles.scrollReveal} ${styles.stagger1}`}>
              <span className={styles.carouselCardTag}>New Season</span>
              <h2 className={styles.sectionTitle} style={{ textAlign: "left", margin: 0, alignSelf: "flex-start" }}>Latest Arrival</h2>
              <p className={styles.heroDesc} style={{ color: "var(--color-warm-gray)", fontSize: "14px" }}>
                Explore our fresh collection of organic pottery, handwoven textiles, and slow-made garments designed for mindful living.
              </p>
              <button className={styles.heroBtn} style={{ margin: 0 }} onClick={() => router.push("/products")}>
                Explore All Collection &rarr;
              </button>
            </div>

            <div className={`${styles.latestRightCol} ${styles.scrollReveal} ${styles.stagger2}`}>
              <div className={styles.filterTabs}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterTabBtn} ${activeCategory === cat ? styles.filterTabBtnActive : ""}`}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveCategory(cat);
                      if (scrollRef.current) {
                        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div
                className={styles.carouselScrollTrack}
                ref={scrollRef}
                onScroll={handleScrollTrack}
              >
                {filteredItems.map((item, index) => (
                  <div 
                    className={`${styles.overlayCard} ${styles.scrollReveal} ${styles[`stagger${(index % 4) + 1}`]}`} 
                    key={item.id}
                    onClick={() => router.push(`/products/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "8px" }}>
                        <span className={styles.cardOverlayPrice}>{item.price}</span>
                        <button 
                          className={styles.heroBtn} 
                          style={{ margin: 0, padding: "6px 12px", fontSize: "11px", height: "auto" }}
                          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
            {storefrontConfig.bestCollections.map((item, index) => {
              const cardClassName = 
                index === 0 ? styles.bestCard1 :
                index === 1 ? styles.bestCard2 :
                index === 2 ? styles.bestCard3 :
                index === 3 ? styles.bestCard4 :
                styles.bestCard5;
              return (
                <div className={`${cardClassName} ${styles.scrollReveal} ${styles[`stagger${index+1}`]}`} key={item.id} id={`best-collection-${index+1}`}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes={index === 0 ? "(max-width: 992px) 100vw, 450px" : "(max-width: 992px) 100vw, 380px"}
                    className={styles.cardImage}
                  />
                  <div className={styles.bestOverlay}>
                    <h3 className={styles.bestTitle}>{item.title}</h3>
                    <span className={styles.bestSubtitle}>{item.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Image Gallery Section */}
        <section className={`${styles.section} ${styles.scrollReveal}`} id="image-gallery-section" style={{ padding: "20px 0 240px 0", overflow: "visible" }}>
          <h2 className={styles.sectionTitle}>Image Gallery</h2>
          
          <div className={styles.waveGallerySection}>
            <svg className={styles.waveSvgBackground} viewBox="0 80 1000 240" preserveAspectRatio="none">
              <path
                className={styles.wavePath}
                d="M 0 200 C 62.5 200, 62.5 280, 125 280 C 250 280, 250 120, 375 120 C 500 120, 500 280, 625 280 C 750 280, 750 120, 875 120 C 937.5 120, 937.5 200, 1000 200"
              />
              <circle cx="125" cy="280" r="5" className={styles.waveDot} />
              <circle cx="375" cy="120" r="5" className={styles.waveDot} />
              <circle cx="625" cy="280" r="5" className={styles.waveDot} />
              <circle cx="875" cy="120" r="5" className={styles.waveDot} />
            </svg>

            <div className={styles.waveGalleryContainer}>
              {(storefrontConfig.galleryItems || galleryItems).map((item, index) => (
                <div
                  key={item.id}
                  className={`${styles.wavePolaroid} ${
                    item.type === "peak" ? styles.wavePolaroidPeak : styles.wavePolaroidTrough
                  } ${styles.scrollReveal} ${styles[`stagger${(index % 4) + 1}`]}`}
                >
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
            {(storefrontConfig.testimonials || []).map((t, idx) => (
              <div className={`${styles.testimonialCard} ${styles.scrollReveal} ${styles[`stagger${(idx % 2) + 1}`]}`} id={`testimonial-card-${idx+1}`} key={t.id}>
                <div className={styles.pendantLine}>
                  <div className={styles.pendantDot} />
                </div>
                <div className={styles.avatarWrapper}>
                  <Image
                    src={t.avatarUrl}
                    alt={`Portrait of ${t.name}, verified customer`}
                    fill
                    sizes="90px"
                    className={styles.avatarImage}
                  />
                </div>
                <div className={styles.speechBubble}>
                  <p className={styles.testimonialText}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <span className={styles.testimonialAuthor}>— {t.name}</span>
                </div>
              </div>
            ))}
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
