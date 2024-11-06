import React from 'react';
import styles from './CourseContentList.module.css'; // Import the updated CSS
import Link from 'next/link';

// Define the structure of each content item (like a video or media item)
interface Content {
    id: string;
    title: string;
    thumbnail: string; // Thumbnail image URL
    description?: string;
    videoUrl?: string; // URL for the video content
}

interface CourseContentListProps {
    contentList: Content[]; // List of content items
    hasAccess: boolean; // Whether the user has access to view the full content
    courseId: string; // ID of the course
}

const CourseContentList: React.FC<CourseContentListProps> = ({ contentList, hasAccess, courseId }) => {
    return (
        <div className={styles.container}>
            <h3>Course Contents</h3>
            <ul className={styles.contentList}>
                {contentList.map((content) => (
                    <li key={content.id} className={styles.contentItem}>
                        {/* Thumbnail */}
                        <div className={styles.thumbnailWrapper}>
                            <img src={content.thumbnail} alt={content.title} className={styles.thumbnail} />
                        </div>
                        {/* Content Info */}
                        <div className={styles.contentInfo}>
                            <h4>{content.title}</h4>
                            <p>{content.description}</p>
                            {/* Check if the user has access */}
                            {hasAccess ? (
                                <Link href={`/courses/${courseId}/content/${content.id}`} passHref>
                                    View Content
                                </Link>
                            ) : (
                                <div className={styles.locked}>🔒 Content Locked</div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseContentList;
