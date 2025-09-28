import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import DownloadResume from "../../../assets/07-04-2025 Current Tech Resume.pdf";
import { FiDownload } from "react-icons/fi";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);
    const lastScrollY = useRef(0);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                // scrolling down & passed 50px → hide navbar
                setShowNavbar(false);
            } else {
                // scrolling up → show navbar
                setShowNavbar(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`${styles.navbar} ${!showNavbar ? styles.navbarHidden : ""}`}
        >
            <div className={styles.logo}>Sushil Panthi</div>

            <button className={styles.burgerButton} onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <ul
                className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksMobile : ""
                    }`}
            >
                <li>
                    <a href="#home" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Home</a>
                </li>
                <li>
                    <a href="#about" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>About</a>
                </li>
                <li>
                    <a href="#skills" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Skills</a>
                </li>
                <li>
                    <a href="#projects" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Projects</a>
                </li>
                <li>
                    <a href="#experience" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Experience</a>
                </li>
                <li>
                    <a href="#additional-experience" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Additional Experience</a>
                </li>
                <li>
                    <a href="#education" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Education</a>
                </li>
                <li>
                    <a href="#courses" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Courses</a>
                </li>
                <li>
                    <a href="#achievements" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Achievements</a>
                </li>
                <li>
                    <a href="#Papers" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Research Papers</a>
                </li>
                <li>
                    <a href="#contact" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contact</a>
                </li>
            </ul>

            <div className={styles.navActions}>
                <a
                    href={DownloadResume}
                    download="Sushil_Panthi_Resume.pdf"
                    className={styles.resumeButton}
                >
                    <FiDownload size={20} />
                    <span className={styles.buttonText}>Resume</span>
                </a>
            </div>
        </nav>
    );
}

export default Navbar;
