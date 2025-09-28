import React from 'react';
import styles from './SkillCard.module.css';
import { FaReact, FaPython, FaJava, FaDatabase, FaHtml5, FaCss3, FaJs, FaChartBar, FaChartLine, FaFileExcel, FaGitAlt, FaMicrosoft, FaUserFriends, FaUsers, FaCommentDots, FaPuzzlePiece, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const iconMap = {
    'MERN Stack': FaReact,
    'Python': FaPython,
    'Java': FaJava,
    'SQL': FaDatabase,
    'C': FaDatabase, // Generic database icon for C/C++
    'C++': FaDatabase,
    'HTML': FaHtml5,
    'CSS': FaCss3,
    'JavaScript': FaJs,
    'Power BI': FaChartBar,
    'Data Visualization': FaChartLine,
    'Microsoft Excel': FaFileExcel,
    'Git': FaGitAlt,
    'Microsoft Office Suite': FaMicrosoft,
    'Leadership': FaUserFriends,      // Changed to specific icon
    'Team Management': FaUsers,     // Added Team Management icon
    'Communication': FaCommentDots,    // Changed to specific icon
    'Team Collaboration': FaUsers, // Reused Team/Users icon, adjust if needed
    'Problem Solving': FaPuzzlePiece,  // Changed to specific icon
    'Time Management': FaClock,        // Added Time Management icon
};


function SkillCard({ skill }) {
    const IconComponent = iconMap[skill.name] || (() => <span>{skill.name}</span>);

    return (
        <motion.div
            className={styles.skillCard}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
        >
            <div className={styles.iconContainer}>
                <IconComponent className={styles.skillIcon} size={40} />
            </div>
            <h3 className={styles.skillName}>{skill.name}</h3>
            {skill.proficiency && (
                <div className={styles.proficiencyBar}>
                    <motion.div
                        className={styles.proficiencyLevel}
                        style={{ width: `${skill.proficiency}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.proficiency}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                </div>
            )}
        </motion.div>
    );
}

export default SkillCard;