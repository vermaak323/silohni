"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formattedEmail = email.trim().toLowerCase();
    if (formattedEmail !== "admin@silohni.com") {
      setError("Access denied. Only the authorized administrator email can login here.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          secret: otp.trim(),
          userId: email.trim() === "admin@silohni.com" ? "admin-user-id" : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin role required.");
      }

      // Store in localStorage
      localStorage.setItem(
        "silohni_user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        })
      );

      // Redirect to Admin dashboard
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.brand}>Silohni</div>
        <div className={styles.subtitle}>Admin Portal</div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@silohni.com"
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="otp">
              One-Time Passcode (OTP)
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit passcode"
              required
              maxLength={6}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Login to Portal"}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          ← Back to Boutique Home
        </Link>
      </div>
    </div>
  );
}
