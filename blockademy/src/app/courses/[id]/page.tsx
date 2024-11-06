"use client";
import CourseContentList from '@/components/CourseContentList';

import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { ethers, JsonRpcProvider } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/contracts/abi';
const CoursePage = ({ params }: { params: { id: string } }) => {
    // Sample course data with content
    const [contentList, setContentList] = useState([]);
    interface Course {
        id: string;
        description: string;
        thumbnail: string;
        title?: string;
        instructor?: string;
    }

    const [course, setCourse] = useState<Course>({ id: '', description: '', thumbnail: '' });

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const provider = new JsonRpcProvider("https://arb-sepolia.g.alchemy.com/v2/JFPV6F9K30KIzQBcPP4snu0JMOmU6zR5");
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

                // Fetch the course details
                const [courseThumbnail, courseDescription, contentCount] = await contract.getCourse(params.id);
                console.log(courseThumbnail, courseDescription, contentCount)

                // Fetch the contents of the course
                const [contentAddresses, contentThumbnails, contentDescriptions] = await contract.getAllContents(params.id);



                // Set the course and its contents in state
                setCourse({
                    id: params.id,
                    description: courseDescription,
                    thumbnail: courseThumbnail,
                });

                const fetchedContents = contentAddresses.map((contentAddress: any, index: string | number) => ({
                    id: contentAddress,
                    thumbnail: contentThumbnails[index],
                    description: contentDescriptions[index],
                }));
                setContentList(fetchedContents);
            } catch (error) {
                console.error("Error fetching course details:", error);
            }
        };

        fetchCourseDetails();
    }, [params.id]);


    return (
        <div className="flex flex-col h-screen justify-center mx-auto ">
            <div className={styles.container}>
                <section className={styles.courses}>
                    <div className={styles.courseGrid}>
                        <img src={course.thumbnail} alt={course.description} />
                    </div>
                    <div className={styles.courseGrid}>
                        {course.description && <p>{course.description}</p>}
                        <CourseContentList contentList={contentList} hasAccess={true} courseId={params.id} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CoursePage;