import Link from 'next/link';
import styles from './CourseCard.module.css';

interface Course {
    id: string;
    thumbnail: string;
    title: string;
    instructor: string;
    description?: string; // Optional description for the single course page
}

const CourseCard = ({ course }: { course: Course }) => {
    return (
        <div className={styles.card}>
            <img src={course.thumbnail} alt={course.title} />
            <h3>{course.title}</h3>
            <p>{course.instructor}</p>
            {course.description && <p>{course.description}</p>}
            <Link href={`/courses/${course.id}`}>View Course</Link>
        </div>
    );
};

export default CourseCard;