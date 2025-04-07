import React, { useState } from 'react'; // Import useState
import styles from './Navbar.module.css';
import DownloadResume from '../../../assets/07-04-2025 Current Tech Resume.pdf';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { FaBars, FaTimes } from 'react-icons/fa'; // Import FaBars and FaTimes for menu icon

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu open/close

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <motion.nav
            className={styles.navbar}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100 }}
        >
            <div className={styles.logo}>Sushil Panthi</div>

            {/* Hamburger Icon for smaller screens */}
            <button className={styles.burgerButton} onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />} {/* Icon change on menu open/close */}
            </button>

            <ul className={`${styles.navLinks} ${isMenuOpen ? styles.navLinksMobile : ''}`}> {/* Conditionally apply mobile menu class */}
                <li><a href="#home" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Home</a></li> {/* Close menu on link click */}
                <li><a href="#about" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>About</a></li>
                <li><a href="#skills" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Skills</a></li>
                <li><a href="#projects" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Projects</a></li>
                <li><a href="#experience" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Experience</a></li>
                <li><a href="#additional-experience" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Additional Experience</a></li>
                <li><a href="#education" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Education</a></li>
                <li><a href="#courses" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Courses</a></li>
                <li><a href="#achievements" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Achievements</a></li>
                <li><a href="#contact" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>Contact</a></li>
            </ul>

            <div className={styles.navActions}>
                <motion.a
                    href= {DownloadResume}
                    download="Sushil_Panthi_Resume.pdf"
                    className={styles.resumeButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                >
                    <FiDownload size={20} />
                    <span className={styles.buttonText}>Resume</span>
                </motion.a>





            </div>
        </motion.nav>
    );
}

export default Navbar;