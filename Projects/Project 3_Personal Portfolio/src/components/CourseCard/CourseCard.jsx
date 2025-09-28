import React from 'react';
import styles from './CourseCard.module.css';
import { motion } from 'framer-motion';

function CourseCard({ course }) {
    return (
        <motion.div
            className={styles.courseCard}
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
        >
            <h3 className={styles.courseName}>{course.name}</h3>
            <h4 className={styles.institution}>{course.institution}</h4>
            <p className={styles.date}>{course.date}</p>
            <p className={styles.description}>{course.description}</p>

        </motion.div>
    );
}

export default CourseCard;