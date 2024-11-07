"use client";
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import LoginGuard from '@/components/LoginGuard';
import styles from './page.module.css';

import { useEffect, useState } from 'react';
import { ethers, JsonRpcProvider } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/contracts/abi';
import { Button } from '@/components/button';
const MyCourses: React.FC = () => {
    // Example enrolled courses data
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const provider = new JsonRpcProvider("https://arb-sepolia.g.alchemy.com/v2/JFPV6F9K30KIzQBcPP4snu0JMOmU6zR5");
                const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
                // Fetch all course addresses
                const courseAddresses = await contract.getAllCourses();

                const fetchedCourses = [];
                for (const courseAddress of courseAddresses) {
                    // Fetch the course data for each address
                    const [courseThumbnail, courseDescription, contentCount] = await contract.getCourse(courseAddress);
                    fetchedCourses.push({
                        id: courseAddress,
                        title: courseDescription,
                        thumbnail: courseThumbnail, // IPFS or any storage location for the course image
                        contentCount
                    });
                }

                setCourses(fetchedCourses);
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="flex flex-col h-screen justify-center mx-auto ">
            <main className="mx-auto space-y-5">
                <LoginGuard>
                    <div className={styles.container}>
                        <section className={styles.courses}>
                            <h2>My Tutorials</h2>
                            <div className={styles.courseGrid}>
                                {courses.map(course => (
                                    <div key={course.id} className={styles.courseCard}>
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className={styles.submitButton}>
                                <Link href="/my-contents/create">Create New Course</Link>
                            </button>
                        </section>
                    </div>
                </LoginGuard>
            </main>
        </div>
    );
};

export default MyCourses;