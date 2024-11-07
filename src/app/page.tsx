"use client";
import styles from "./page.module.css";
import LoginGuard from "@/components/LoginGaurd";

// Smart contract details
const Home: React.FC = () => {
  return (
    <LoginGuard>
      hello world
    </LoginGuard>
  );
};

export default Home;
