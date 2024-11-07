"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useUserStore } from '@/utils/user.store';
import { useLoginLogout } from './useLoginLogout';
import { EOA } from './EOA';

const activeLinkIndicatorWidthRatio = 0.7;


export default function NavBar() {
  const pathname = usePathname();
  const { isConnected } = useUserStore();
  const { login, logout } = useLoginLogout();

  const [tabIndicatorLeft, setTabIndicatorLeft] = useState('');
  const [tabIndicatorWidth, setTabIndicatorWidth] = useState('');
  const navLinks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navLinks.current) return;

    const activeLink = navLinks.current.querySelector(`a[href="${pathname}"]`) as HTMLAnchorElement | null;
    if (!activeLink) return;

    const activeLinkWidth = activeLink.clientWidth;
    const indicatorLeft = (activeLinkWidth - activeLinkIndicatorWidthRatio * activeLinkWidth) / 2;
    setTabIndicatorWidth(activeLinkIndicatorWidthRatio * activeLinkWidth + 'px');
    setTabIndicatorLeft(activeLink.offsetLeft + indicatorLeft + 'px');
  }, [pathname]);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarLogo}>
        <Link href="/" className={styles.navbarBrand}>ftc-2024</Link>
      </div>

      <nav ref={navLinks} className={styles.navbarLinks}>
        <div
          className={styles.navIndicator}
          style={{ width: tabIndicatorWidth, left: tabIndicatorLeft }}
        ></div>
        {/*
        <Link href="/my-courses" className={`${styles.navLink} ${pathname === '/my-courses' ? styles.active : ''}`}>
          My Courses
        </Link>
        <Link href="/my-contents" className={`${styles.navLink} ${pathname === '/my-contents' ? styles.active : ''}`}>
          My Contents
        </Link>
        <Link href="/about-me" className={`${styles.navLink} ${pathname === '/about-me' ? styles.active : ''}`}>
          About Me
        </Link>
        */}
      </nav>

      <div className={styles.navbarUser}>
        {isConnected ? (
          <>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <button className={styles.loginButton} onClick={login}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}
