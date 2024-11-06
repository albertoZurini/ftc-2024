"use client";
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import LoginGuard from '@/components/LoginGuard';
import styles from './page.module.css';

type Course = {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
};
type CoursesProps = {
    courses: Course[];
};

const Courses: React.FC<CoursesProps> = ({ courses }) => {

    return (
        <div className="flex flex-col h-screen justify-center mx-auto ">
            <div className={styles.container}>
                <section className={styles.courses}>
                    <h2>Popular Courses</h2>
                    <div className={styles.courseGrid}>
                        {courses.map(course => (
                            <div key={course.id} className={styles.courseCard}>
                                <CourseCard course={course} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Courses;