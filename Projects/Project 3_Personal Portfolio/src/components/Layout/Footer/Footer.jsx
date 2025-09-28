import React from 'react';
import styles from './Footer.module.css';
import { motion } from 'framer-motion';

function Footer() {
    return (
        <motion.footer
            className={styles.footer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
        >
            <p>&copy; {new Date().getFullYear()} Sushil Panthi. All Rights Reserved.</p>
            <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/sushilpanthi/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    LinkedIn
                </a>
                <a href="https://github.com/npanthi718" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    GitHub
                </a>
            </div>
        </motion.footer>
    );
}

export default Footer;