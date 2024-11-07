"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { useUserStore } from '@/utils/user.store';
import { WalletConnectService } from '@/utils/WalletConnectService';

const activeLinkIndicatorWidthRatio = 0.7;

export default function NavBar() {
    const pathname = usePathname();
    const { isConnected } = useUserStore();

    const [tabIndicatorLeft, setTabIndicatorLeft] = useState('');
    const [tabIndicatorWidth, setTabIndicatorWidth] = useState('');
    const navLinks = useRef<HTMLDivElement>(null);

    // Set indicator position on active link
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
                <Link href="/" className={styles.navbarBrand}>GREEN</Link>
            </div>

            <nav ref={navLinks} className={styles.navbarLinks}>
                <div
                    className={styles.navIndicator}
                    style={{ width: tabIndicatorWidth, left: tabIndicatorLeft }}
                ></div>
                <Link href="/my-contents" className={`${styles.navLink} ${pathname === '/my-contents' ? styles.active : ''}`}>
                    My Contents
                </Link>
                <Link href="/about-me" className={`${styles.navLink} ${pathname === '/about-me' ? styles.active : ''}`}>
                    About GREEN
                </Link>
            </nav>


            <div className={styles.navbarUser}>
                {isConnected ? (
                    <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={() => console.log("Logged out")}
                    >
                        Logout
                    </button>
                ) : (
                    <button className={styles.loginButton} onClick={() => console.log("Logged in")}>
                        Login
                    </button>
                )}
            </div>
        </div>
    );
}
