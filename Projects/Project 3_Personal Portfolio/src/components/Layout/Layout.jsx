import React from 'react';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import styles from './Layout.module.css';
import { motion } from 'framer-motion';

function Layout({ children }) {
    return (
        <motion.div
            className={styles.layoutContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Navbar />
            <main className={styles.mainContent}>{children}</main>
            <Footer />
        </motion.div>
    );
}

export default Layout;