import React from 'react';
import styles from './Popup.module.css';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5'; // Import close icon

function Popup({ message, onClose }) {
    return (
        <div className={styles.popupOverlay}>
            <motion.div
                className={styles.popupContent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
            >
                <button className={styles.closeButton} onClick={onClose}>
                    <IoClose size={24} />
                </button>
                <p className={styles.message}>{message}</p>
            </motion.div>
        </div>
    );
}

export default Popup;