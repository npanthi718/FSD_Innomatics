import React, { useState } from 'react';
import styles from './Home.module.css';
import profileImage from '../../assets/profile-image.jpg';
import SkillCard from '../../components/SkillCard/SkillCard';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import CourseCard from '../../components/CourseCard/CourseCard';
import EducationCard from '../../components/EducationCard/EducationCard';
import { motion } from 'framer-motion';
import { ReactTyped } from 'react-typed';

function Home() {
    const categorizedSkillsData = { // Categorized skills data
        'Technical Skills': [
            { name: 'MERN Stack', proficiency: 90 },
            { name: 'Python', proficiency: 85 },
            { name: 'Java', proficiency: 80 },
            { name: 'SQL', proficiency: 80 },
            { name: 'C', proficiency: 85 },
            { name: 'C++', proficiency: 85 },
            { name: 'HTML', proficiency: 95 },
            { name: 'CSS', proficiency: 95 },
            { name: 'JavaScript', proficiency: 85 },
        ],
        'Tools & Platforms': [
            { name: 'Git', proficiency: 95 },
            { name: 'Power BI', proficiency: 80 },
            { name: 'Data Visualization', proficiency: 80 },
            { name: 'Microsoft Excel', proficiency: 90 },
            { name: 'Microsoft Office Suite', proficiency: 92 },
        ],
        'Soft Skills': [
            { name: 'Leadership' },
            { name: 'Team Management' },
            { name: 'Communication' },
            { name: 'Team Collaboration' },
            { name: 'Problem Solving' },
            { name: 'Time Management' },
        ],
    };

    const projectsData = [

        {
            title: 'LumbiniCare Connect: Lumbini Nepal Hospital',
            technologies: ['MERN Stack', 'MongoDB', 'Express.js', 'React.js', 'Node.js', 'Material-UI', 'JWT Authentication', 'RESTful APIs'],
            liveLink: 'https://lumbini-nepal-hospital-mern-stack-project.onrender.com/',
            githubLink: 'https://github.com/npanthi718/Lumbini-Nepal-Hospital--MERN-Stack-Project',
            keyContributions: [
                'Built a full-stack hospital management system enabling efficient management of appointments, prescriptions, and departments.',
                'Implemented secure authentication and role-based access control (RBAC) using JWT for data privacy and restricted access.',
                'Designed scalable RESTful APIs for CRUD operations with robust error handling and MongoDB integration.',
                'Enhanced user experience with a responsive React.js frontend and Material-UI for a mobile-friendly interface.'
            ]
        },


        {
            title: 'SushilGPT: Full-Stack AI Chat Platform',
            technologies: [
                'MERN Stack', 'MongoDB', 'Express.js', 'React.js', 'Node.js', 'Vite', 'CSS Modules', 'OpenAI API'
            ],
            liveLink: null,
            githubLink: 'https://github.com/npanthi718/SushilGPT',
            keyContributions: [
                'Developed a ChatGPT-inspired conversational AI platform featuring real-time chat using the MERN stack.',
                'Integrated OpenAI API for generating intelligent and context-aware responses, enabling seamless user interaction.',
                'Implemented persistent chat history storage with MongoDB and designed RESTful APIs for robust backend operations.',
                'Created a modern, responsive UI using React.js, Vite, and CSS modules, ensuring an engaging user experience across devices.'
            ]
        },

        {
            title: 'FaceMark: Automated Attendance Solution',
            technologies: ['Python 3.9', 'OpenCV 4.x', 'Face Recognition Library', 'Tkinter', 'Numpy', 'Pandas'],
            liveLink: null,
            githubLink: 'https://github.com/npanthi718/Face_Recognition_Attendance',
            keyContributions: [
                'Developed a dynamic and efficient attendance system using Face Recognition Technology. The system automates attendance marking by detecting and identifying student faces from classroom photos.',
                'The project allows teachers to take attendance by capturing a class photo, automatically marking students present or absent based on facerecognition. It also provides a dashboard for managing student details and viewing attendance records.',
                'Architected a face detection and recognition module leveraging Flask, OpenCV, and Face Recognition Library; the tool is now used by over 20 employees across security teams.',
            ],
        },

        {
            title: 'StockSmart: MEN Stack Inventory & Billing',
            technologies: ['MongoDB', 'Express.js', 'Node.js', 'HTML/CSS', 'MEN Stack'],
            liveLink: null,
            githubLink: 'https://github.com/npanthi718/SuperMarket-Management-Using-MEN-Stack',
            keyContributions: [
                'Developed a robust inventory and billing system with real-time stock updates and automated alerts.',
                'The project provides a comprehensive platform for administrators, cashiers, and stock managers to efficiently manage stock, generate bills, and monitor sales data.',
                'Built using the MEN stack (MongoDB, Express.js, Node.js). Employed HTML/CSS/JavaScript for frontend development and Node.js for backend operations.',
                'Streamlined supermarket operations, minimized human errors, and provided real-time insights into inventory and sales performance.',
            ],
        },
        {
            title: 'StudentTrack: Django-Based Management',
            technologies: ['Python', 'JavaScript', 'Django', 'HTML/CSS'],
            liveLink: null,
            githubLink: 'https://github.com/npanthi718/Student-Management-System',
            keyContributions: [
                'Developed a robust platform for managing student data with features like CRUD operations, course filtering, and error handling.',
                'Designed a responsive user interface for seamless interaction.',
                'Implemented secure database operations to manage sensitive information.',
            ],
        },
    ];

    const experienceData = [
        {
            title: 'Full Stack Development Intern',
            company: 'Innomatics Research Labs',
            date: '01/2025 - 03/2025',
            location: 'Remote',
            description: [
                'Built dynamic and interactive user interfaces using React.js, improving the usability and aesthetics of web applications.',
                'Implemented robust server-side logic with Node.js and Express.js, ensuring secure and efficient data handling.',
                'Managed and queried data using MongoDB, optimizing application performance through effective data modeling.',
                'Participated in training sessions to upskill in both frontend and backend technologies, applying new concepts directly to real-world tasks.',
                'Proactively handled assigned tasks, demonstrating problem-solving skills and a commitment to learning and growth.',
            ],
        },
        {
            title: 'Full Stack Development Intern',
            company: 'Pantech Prolabs India Pvt Ltd',
            date: '07/2024 - 01/2025',
            location: 'Remote',
            description: [
                'Utilized MERN stack (MongoDB, Express.js, React.js, Node.js) and modern development practices to build scalable and dynamic applications.',
                'Worked under the supervision of senior developers, learning and applying best practices in software development.',
                'Contributed to debugging, testing, and optimizing code to improve application performance and reliability.',
                'Enhanced technical knowledge through hands-on experience and real-world application of software development concepts.',
            ],
        },
        {
            title: 'Tech Intern',
            company: 'Anishk Sustainable Development Foundation (ASDF)',
            date: '04/2024 - 12/2024',
            location: 'Remote',
            description: [
                'Collaborated with a team to develop the "Arka Journal" website, focusing on research and publications related to rural and tribal community initiatives.',
                'Utilized HTML, CSS, JavaScript, and PHP to build a responsive, user-friendly website for showcasing research papers and publications.',
                'Worked closely with developers, designers, and researchers to integrate research content seamlessly into the website.',
                'Enhanced the accessibility and visibility of community-driven research by creating a digital platform for sharing knowledge and innovations.',
            ],
        },
    ];

    const additionalExperienceData = [
        {
            title: 'Manager',
            company: 'New Sushant Chamena Griha',
            date: 'April 2020 - June 2023',
            location: 'Kathmandu, Nepal (On-site)',
            description: [
                'Managed inventory, finances, and supplier relations effectively',
            ],
        },
        {
            title: 'Marketing Director',
            company: 'Vision Dreamery Private Limited',
            date: 'November 2022 - April 2023',
            location: 'Kathmandu, Nepal (On-site)',
            description: [
                'Oversaw marketing campaigns to enhance brand visibility and drive revenue growth.',
                'Conducted market research to inform strategy development.',
                'Led team efforts to design and execute impactful campaigns.',
            ],
        },
        {
            title: 'Motivational Speaker',
            company: 'Sarva Sikshya Educational Center',
            date: 'November 2022 - April 2023',
            location: 'Kathmandu, Nepal (On-site)',
            description: [
                'Delivered engaging speeches to inspire individuals to overcome challenges and achieve goals.',
                'Tailored presentations to suit audience needs, fostering motivation and personal growth.',
            ],
        },
        {
            title: 'Sales and Marketing Specialist',
            company: 'Emporium Marketing Private Limited',
            date: 'August 2021 - October 2022',
            location: 'West Bengal, India (On-site)',
            description: [
                'Developed and executed marketing programs to promote products and expand the customer base.',
                'Engaged in lead generation and strengthened distributor relationships.',
            ],
        },
        {
            title: 'Sales Supervisor',
            company: 'Bishal Impex',
            date: 'January 2021 - July 2021',
            location: 'Kathmandu, Nepal (On-site)',
            description: [
                'Led a team of sales associates, optimizing sales processes and mentoring staff.',
                'Managed inventory and ensured high levels of customer satisfaction.',
            ],
        },
    ];

    const educationData = [  // Education Data Array
        {
            degree: 'Bachelor of Computer Applications (BCA)',
            institution: 'School of Computer Science and Engineering, Sandip University',
            dates: 'July 2023 - July 2026',
            cgpa: '8.5/10',
        },
        {
            degree: 'Secondary Level (+2)',
            institution: 'Vijaya Memorial Secondary School',
            dates: 'July 2021 - May 2023',
            cgpa: '3.12/4',
        },
        {
            degree: 'Intermediate Level (10)',
            institution: 'Vijaya Memorial Secondary School',
            dates: 'Completed',
            cgpa: '3.8/4',
        },
    ];


    const achievementsData = [ // Achievements & Extracurricular Activities Data
        {
            title: 'President, Nature Club',
            company: 'Vijaya Memorial Secondary School',
            date: '2020 - 2021', // Year
            location: 'Kathmandu, Nepal',
            description: [
                'Led tree plantation drives, clean-up campaigns, and biodiversity seminars.',
                'Promoted eco-friendly practices like recycling and waste reduction in school.',
                'Organized field trips and workshops to foster environmental awareness.',
                'Collaborated with communities to address environmental challenges.',
            ],
        },
        {
            title: 'President, Child Club',
            company: 'Vijaya Memorial Secondary School',
            date: '2019 - 2021',
            location: 'Kathmandu, Nepal',
            description: [
                'Led initiatives to promote child rights, education, and personal development.',
                'Organized awareness programs, talent shows, and leadership workshops.',
                'Fostered teamwork and community engagement through various school activities.',
                'Collaborated with students and teachers to address child-related issues.'
            ],
        },
        {
            title: 'Cultural Program Coordinator',
            company: 'Vijaya Memorial Secondary School',
            date: '2018 - 2021',
            location: 'Kathmandu, Nepal',
            description: [
                'Organized and coordinated school cultural events and festivals.',
                'Promoted cultural awareness and student participation in arts and traditions.',
                'Managed event planning, scheduling, and resource allocation.',
                'Fostered teamwork and creativity among students through cultural activities.',

            ],
        },
    ];


    const coursesData = [ // Courses Data
        {
            name: 'AI in Current Technology (Advanced AI Technologies)',
            institution: 'Be10X',
            date: 'March 2025 - Aug 2025',
        },

        {
            name: 'Data Structures and Algorithms (DSA)',
            institution: 'Apna College',
            date: 'Oct 2024 - Feb 2025',
        },
        {
            name: 'Full Stack Development (MERN Stack)',
            institution: 'Apna College',
            date: 'Feb 2025 - July 2025',
        },

        {
            name: 'Advanced Power BI',
            institution: 'JatanSah',
            date: 'Jan 2024 - July 2024',
        },
    ];

    const researchpapersData = [
        {
            title: 'A Blockchain-Driven Decentralized Framework for Secure and Automated Spectrum Trading in 6G Wireless Networks Using Automata Theory',
            organizer: 'International Conference on Advances in Computational Intelligence and Applications-2025',
            institution: 'Insitute of Information Technology & Management(IITM), GGS Indraprastha University, New Delhi',
            date: 'November 7, 2025 (accepted yet to be presented)',
            location: 'Online Presentation',
            description: [
                'Developed a blockchain-based decentralized framework for secure and automated spectrum trading in 6G networks using smart contracts and finite state automata for verification.',
                'Ensured privacy and trust through Zero-Knowledge Proofs and tokenization of spectrum assets as digital NFTs.',
                'Integrated machine learning to enhance real-time trade validation, reducing latency and improving transaction success rates compared to centralized systems.',
            ],
        },

        {
            title: ' AI-Augmented Real-Time Character Animation in AR/VR Using Consumer-Grade Motion Capture and Automata-Guided Workflow',
            organizer: '(ICETDA 2025), 3rd International Conference on Emerging Trends of Design & Arts',
            institution: 'Poornima University, Jaipur, Rajasthan',
            date: 'September, 2025',
            location: 'Online Presentation',
            description: [
                'Created a deep learning and automata-driven system for real-time AR/VR character animation using affordable consumer-grade motion capture devices.',
                'Achieved high accuracy (up to 95%) and low latency (<50 ms) with superior garment alignment and robust performance across diverse applications.',
                'Awarded Best Paper at ICEIDA 2025 for scalable innovation in immersive animation.'
            ],
        },

        {
            title: 'A Bioinformatics-Inspired Machine Learning Framework for Financial Fraud Detection Using Sequence Alignment and Evolutionary Optimization',
            organizer: '(FINCON 2025), International Financial Security and Management Conference-2025',
            institution: 'National Forensic Sciences University, Gandhinagar, Gujarat',
            date: 'August, 2025',
            location: 'Online Presentation',
            description: [
                'Proposed a bioinformatics-inspired framework using sequence alignment and motif discovery for advanced financial fraud detection.',
                'Applied genetic algorithms for real-time, adaptive model tuning to boost accuracy and handle severe class imbalance.',
                'Achieved 95%+ accuracy and F1-score, outperforming traditional ML methods with better interpretability and robustness.'
            ],
        },

        {
            title: 'Harnessing Machine Learning to Detect and Prevent Credit Card Fraud',
            organizer: 'IEEE Conferences- ARRIA 2024',
            institution: 'Manipal Institute of Technology, Manipal, Karnataka',
            date: 'December, 2024',
            location: 'Online Presentation',
            description: [
                'Identified and emphasized crucial anonymized features (V17, V14, and V10) for predicting fraudulent activities, significantly enhancing model performance.',
                'Highlighted the importance of feature selection and data preprocessing in improving fraud detection systems.',
                'Demonstrated the potential for implementing machine learning models to significantly reduce financial losses and increase security in financial transactions.',
            ],
        },
    ];


    const [formData, setFormData] = useState({ // State for form data
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {  // Handle form input changes
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => { // Handle form submission
        e.preventDefault();
        console.log("Form Data:", formData);
        alert("Thankyou! Form submitted! Will reach with you within 48hrs");
        setFormData({ name: '', email: '', message: '' });
    };


    return (
        <div className={styles.homeContainer}>
            <motion.section
                id="home"
                className={styles.home}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <div className={styles.intro}>
                    <motion.img
                        src={profileImage}
                        alt="Sushil Panthi"
                        className={styles.profileImage}
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.6, type: 'spring', stiffness: 80 }}
                    />
                    <div className={styles.text}>
                        <motion.h1
                            className={styles.name}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.8, type: 'spring', stiffness: 100 }}
                        >
                            Hi, I'm{' '}
                            <ReactTyped
                                strings={['Sushil Panthi']}
                                typeSpeed={100}
                                backSpeed={50}
                                startDelay={1000}
                                backDelay={3500}
                                loop={true}
                                showCursor={false}
                            />
                        </motion.h1>

                        {/* Typing effect for "Full Stack Developer (MERN)" and "Power BI Developer" */}
                        <motion.p
                            className={styles.tagline}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 1.0, type: 'spring', stiffness: 100 }}
                        >
                            <ReactTyped
                                strings={['Full Stack Developer (MERN)', 'Power BI Developer']}
                                typeSpeed={100}
                                backSpeed={50}
                                startDelay={1000}
                                backDelay={3500}
                                loop={true}
                                showCursor={false}
                            />
                            {' '}| Open to Relocation
                        </motion.p>
                        <motion.p
                            className={styles.overview}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 1.2 }}
                        >
                            Results-driven Full Stack Developer with expertise in the MERN stack and a strong foundation in Computer Applications. Proven track record of
                            developing scalable, high-performance web applications, combining technical skills with a proactive approach to problem-solving. Committed
                            to contributing to dynamic tech environments with innovative solutions.
                        </motion.p>
                    </div>
                </div>
            </motion.section>

            <motion.section
                id="about"
                className={styles.about}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    About Me
                </motion.h2>
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <p>
                        Results-driven Full Stack Developer with expertise in the MERN stack and a strong foundation in Computer Applications. Proven track record of developing scalable, high-performance web applications, combining technical skills with a proactive approach to problem-solving.
                    </p>
                    <p>
                        Throughout my career, I have focused on creating user-centric and efficient digital solutions. My experience spans from developing dynamic user interfaces using React.js to implementing robust server-side logic with Node.js and Express.js. I am adept at database management with MongoDB and skilled in data analysis using Power BI and Microsoft Excel.
                    </p>
                    <p>
                        I am passionate about continuous learning and staying up-to-date with the latest technology trends. I thrive in collaborative environments and enjoy tackling complex challenges that require innovative solutions. My goal is to leverage my skills and passion to contribute meaningfully to impactful projects.
                    </p>
                    <p>
                        Outside of coding, I enjoy reading about technology advancements, contributing to open-source projects, and occasionally hiking to stay refreshed and inspired.
                    </p>

                    {/* Contact Details in About Section */}
                    <motion.div
                        className={styles.aboutContactDetails}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <h3>Contact Information</h3>
                        <ul className={styles.contactList}>
                            <li className={styles.contactListItem}>
                                <strong>Email:</strong> <a href="mailto:npanthi718@gmail.com">npanthi718@gmail.com</a>
                            </li>
                            <li className={styles.contactListItem}>
                                <strong>Phone:</strong> <a href='tel:+917602018437'>+91 7602018437</a>
                            </li>
                            <li className={styles.contactListItem}>
                                <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/sushilpanthi/" target="_blank" rel="noopener noreferrer">Sushil Panthi</a>
                            </li>
                            <li className={styles.contactListItem}>
                                <strong>GitHub:</strong> <a href="https://github.com/npanthi718" target="_blank" rel="noopener noreferrer">Sushil Panthi</a>
                            </li>
                        </ul>
                    </motion.div>
                </motion.div>
            </motion.section>

            <motion.section
                id="skills"
                className={styles.skills}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Skills & Expertise
                </motion.h2>
                <div className={styles.categorizedSkills}> {/* Container for categorized skills */}
                    {Object.entries(categorizedSkillsData).map(([category, skills], index) => (
                        <div key={index} className={styles.skillCategory}>
                            <h3 className={styles.skillCategoryTitle}>{category}</h3> {/* Category Title */}
                            <motion.div
                                className={styles.skillsGrid}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.1 }}
                            >
                                {skills.map((skill, skillIndex) => (
                                    <SkillCard key={skillIndex} skill={skill} />
                                ))}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </motion.section>

            <motion.section
                id="projects"
                className={styles.projects}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Projects
                </motion.h2>
                <motion.div
                    className={styles.projectsGrid}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {projectsData.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </motion.div>
            </motion.section>

            <motion.section
                id="experience"
                className={styles.experience}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Experience
                </motion.h2>
                <motion.div
                    className={styles.experienceList}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {experienceData.map((exp, index) => (
                        <motion.div
                            className={styles.experienceItem}
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <h3 className={styles.jobTitle}>{exp.title}</h3>
                            <h4 className={styles.companyName}>{exp.company}</h4>
                            <p className={styles.dateLocation}>{exp.date} | {exp.location}</p>
                            <ul className={styles.descriptionList}>
                                {exp.description.map((desc, descIndex) => (
                                    <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* Additional Experience Section */}
            <motion.section
                id="additional-experience" // Unique ID for navbar link
                className={`{styles.experience} ${styles.additionalExperience}`} // Reusing experience styles for consistency
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Additional Experience {/* Section Title */}
                </motion.h2>
                <motion.div
                    className={styles.experienceList} // Reusing experienceList styles
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {additionalExperienceData.map((exp, index) => (
                        <motion.div
                            className={styles.experienceItem} // Reusing experienceItem styles
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <h3 className={styles.jobTitle}>{exp.title}</h3> {/* Reusing jobTitle styles */}
                            <h4 className={styles.companyName}>{exp.company}</h4> {/* Reusing companyName styles */}
                            <p className={styles.dateLocation}>{exp.date} | {exp.location}</p> {/* Reusing dateLocation styles */}
                            <ul className={styles.descriptionList}> {/* Reusing descriptionList styles */}
                                {exp.description.map((desc, descIndex) => (
                                    <li key={descIndex} className={styles.descriptionItem}>{desc}</li> // Reusing descriptionItem styles
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* Education Section */}
            <motion.section
                id="education"
                className={styles.education}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Education
                </motion.h2>
                <motion.div
                    className={styles.educationList}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {educationData.map((edu, index) => (
                        <EducationCard key={index} education={edu} />
                    ))}
                </motion.div>
            </motion.section>


            {/* Achievements & Extracurricular Activities Section */}
            <motion.section
                id="achievements" // Unique ID for navbar link
                className={styles.experience} // Reusing experience styles for consistency
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Achievements & Extracurricular Activities {/* Section Title */}
                </motion.h2>
                <motion.div
                    className={styles.experienceList} // Reusing experienceList styles
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {achievementsData.map((achievement, index) => (
                        <motion.div
                            className={styles.experienceItem} // Reusing experienceItem styles
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <h3 className={styles.jobTitle}>{achievement.title}</h3> {/* Reusing jobTitle styles */}
                            <h4 className={styles.companyName}>{achievement.company}</h4> {/* Reusing companyName styles */}
                            {achievement.date && <p className={styles.dateLocation}>{achievement.date} {achievement.location ? `| ${achievement.location}` : ''}</p>} {/* Reusing dateLocation styles */}
                            <ul className={styles.descriptionList}> {/* Reusing descriptionList styles */}
                                {achievement.description.map((desc, descIndex) => (
                                    <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* Courses Section */}
            <motion.section
                id="courses" // Unique ID for navbar link
                className={styles.courses}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Courses {/* Section Title */}
                </motion.h2>
                <motion.div
                    className={styles.courseList}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {coursesData.map((course, index) => (
                        <CourseCard key={index} course={course} />
                    ))}
                </motion.div>
            </motion.section>


            {/* Research Paper Sections */}
            <motion.section
                id="Papers"
                className={styles.experience}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Research Papers
                </motion.h2>
                <motion.div
                    className={styles.PaperList}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6, staggerChildren: 0.2 }}
                >
                    {researchpapersData.map((papers, index) => (
                        <motion.div
                            className={styles.PaperItem}
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <h3 className={styles.PaperTitle}>{papers.title}</h3>
                            <h4 className={styles.OrganizerName}>{papers.organizer}</h4>
                            <h5 className={styles.PaperList}>{papers.institution}</h5>
                            <p className={styles.dateLocation}>{papers.date} | {papers.location}</p>
                            <ul className={styles.descriptionList}>
                                {papers.description.map((desc, descIndex) => (
                                    <li key={descIndex} className={styles.descriptionItem}>{desc}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>



            <motion.section
                id="contact"
                className={styles.contact}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    Contact Me
                </motion.h2>
                <motion.div
                    className={styles.contactInfo}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <p className={styles.contactText}>
                        Feel free to reach out to me for any questions or opportunities!  Or use the form below to get in touch 'Within 48 hours' .
                    </p>

                    {/* Contact Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className={styles.contactForm}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={styles.formInput}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={styles.formInput}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.formLabel}>Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                className={styles.formTextarea}
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className={styles.submitButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            Get Connected
                        </motion.button>
                    </motion.form>
                </motion.div>
                <p className={styles.contactText}>
                    You can fill the attached google form for faster response 'Within 2 hours'   <a href="https://forms.gle/ntuoEHJF9wqzBjtN9">Get in Touch with Sushil</a>
                </p>
            </motion.section>
        </div>
    );
}

export default Home;