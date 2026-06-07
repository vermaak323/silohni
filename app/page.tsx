"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

  const scrollRef = useRef<HTMLDivElement>(null);

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
              src="/silohniLogo.png"
              alt="Silohani Logo"
              width={48}
              height={48}
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
            <div className={`${styles.actionIcon} ${styles.desktopOnlyIcon}`} aria-label="Profile" id="action-profile">
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

      <div className={styles.page}>

      {/* Hero Section */}
      <section className={styles.hero} id="hero-section">
        <Image
          src="/images/hero_banner.png"
          alt="Silohani Studio banner featuring minimalist ceramics and linens"
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
      <section className={`${styles.section} scroll-animate`} id="latest-arrival-section">
        <div className={styles.latestSectionWrapper}>
          {/* Left Column: Heading and Info */}
          <div className={styles.latestLeftCol}>
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
          <div className={styles.latestRightCol}>
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
              {filteredItems.map((item) => (
                <div className={styles.overlayCard} key={item.id}>
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
      <section className={`${styles.section} scroll-animate`} id="best-collections-section">
        <h2 className={styles.sectionTitle}>Best collections</h2>
        <div className={styles.bestGrid}>
          {/* Card 1 - Tall Left */}
          <div className={styles.bestCard1} id="best-collection-1">
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
          <div className={styles.bestCard2} id="best-collection-2">
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
          <div className={styles.bestCard3} id="best-collection-3">
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
          <div className={styles.bestCard4} id="best-collection-4">
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
          <div className={styles.bestCard5} id="best-collection-5">
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
      <section className={`${styles.section} scroll-animate`} id="image-gallery-section" style={{ padding: "80px 0", overflow: "visible" }}>
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
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.wavePolaroid} ${
                  item.type === "peak" ? styles.wavePolaroidPeak : styles.wavePolaroidTrough
                }`}
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
      <section className={`${styles.section} scroll-animate`} id="testimonials-section">
        <h2 className={styles.sectionTitle}>Testimonials</h2>
        <div className={styles.testimonialsGrid}>
          {/* Testimonial 1 */}
          <div className={styles.testimonialCard} id="testimonial-card-1">
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
          <div className={styles.testimonialCard} id="testimonial-card-2">
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
                &ldquo;The woolen throws are incredibly cozy and heavy-weight. You can tell they were woven with care. Silohani is my absolute favorite home boutique now.&rdquo;
              </p>
              <span className={styles.testimonialAuthor}>— Marcus V.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} id="footer">
        <div className={styles.footerLogo}>Silohani</div>
        <nav className={styles.footerLinks} aria-label="Footer Navigation">
          <a href="#" className={styles.footerLink}>About Us</a>
          <a href="#" className={styles.footerLink}>Store Policy</a>
          <a href="#" className={styles.footerLink}>FAQ</a>
          <a href="#" className={styles.footerLink}>Careers</a>
          <a href="#" className={styles.footerLink}>Newsletter</a>
        </nav>
        <div className={styles.copyright}>
          &copy; {new Date().getFullYear()} Silohani. All rights reserved. Designed with organic simplicity.
        </div>
      </footer>
    </div>
  </div>
);
}
