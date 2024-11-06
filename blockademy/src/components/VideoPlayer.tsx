import React from 'react';
import styles from './VideoPlayer.module.css'; // Create this CSS file for styling

// Define the structure of a video
interface Video {
    id: string;
    title: string;
    thumbnail: string; // Thumbnail image URL
    videoUrl?: string; // URL for the video content
    description?: string;
}

interface VideoPlayerProps {
    video: Video; // Video data
    hasAccess: boolean; // Whether the user has access to view the full video
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, hasAccess }) => {
    return (
        <div className={styles.videoPlayer}>
            {/* Video Thumbnail */}
            <div className={styles.thumbnailWrapper}>
                <img src={video.thumbnail} alt={video.title} className={styles.thumbnail} />
            </div>

            {/* Video Info */}
            <div className={styles.videoInfo}>
                <h4>{video.title}</h4>
                <p>{video.description}</p>

                {/* Conditional Rendering: Video or Locked Message */}
                {hasAccess ? (
                    <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className={styles.watchButton}>
                        Watch Video
                    </a>
                ) : (
                    <div className={styles.locked}>🔒 This video is locked</div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
