"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { JsonRpcProvider } from 'ethers';
import LoginGuard from "@/components/LoginGuard";
import styles from './page.module.css';
import Courses from "./courses/page";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/contracts/abi";

// Smart contract details
const Home: React.FC = () => {

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
          

          

        </LoginGuard>
      </main>
    </div>
  );
};

export default Home;
