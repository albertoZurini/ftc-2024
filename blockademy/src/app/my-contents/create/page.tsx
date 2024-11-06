"use client";
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import styles from './create.module.css';
import { getDataProtectorClient, initDataProtectorSDK } from '@/utils/externals/dataProtectorClient';
import { useUserStore } from '@/utils/user.store';
const WEB3MAIL_IDAPPS_WHITELIST_SC = "0x781482c39cce25546583eac4957fb7bf04c277d2"

const CreateCourse: React.FC = () => {
    const [name, setName] = useState(''); // Name of the course
    const [email, setEmail] = useState(''); // Email for notifications
    const [error, setError] = useState<string | null>(null);

    const router = useRouter(); // Use next/navigation's useRouter for navigation
    const { connector } = useUserStore();

    // Mutation for creating protected data using the name and email
    const createProtectedDataMutation = useMutation({
        mutationKey: ['protectData'],
        mutationFn: async ({ name, email }: { name: string; email: string }) => {
            try {
                // Initialize Data Protector SDK
                await initDataProtectorSDK({ connector });
                const { dataProtector } = await getDataProtectorClient();

                // Call the protectData function with the name and email
                const result = await dataProtector.protectData({
                    name,
                    data: { email }, // Protecting the email only
                });
                return result; // Return the result (which contains the courseId/hash)
            } catch (error) {
                console.error('Error protecting data:', error);
                throw error;
            }
        },
        onSuccess: (data) => {
            // Invalidate the query to refresh the list of protected data (if needed)

            // Extract the courseId (hash) from the returned data
            const courseId = data.address; // Assuming the hash is returned from the mutation result

            // Automatically grant access after creating the protected data
            grantNewAccessMutation.mutate({
                protectedData: courseId,
                ethAddress: '0x0000000000000000000000000000000000000000', // Authorize any user
            });

            router.push(`/my-contents/${courseId}`);
        },
        onError: (error) => {
            setError('Failed to create protected data. Please try again.');
            console.log(error);
        },
    });

    // Mutation to grant new access to the protected data for any user
    const grantNewAccessMutation = useMutation({
        mutationKey: ['grantAccess'],
        mutationFn: async ({ protectedData, ethAddress }: { protectedData: string, ethAddress: string }) => {
            const { dataProtector } = await getDataProtectorClient();
            return dataProtector.grantAccess({
                protectedData,
                authorizedApp: WEB3MAIL_IDAPPS_WHITELIST_SC, // Assuming this is constant
                authorizedUser: ethAddress, // Authorize any user
                numberOfAccess: 9999,
            });
        },
        onSuccess: () => {
            console.log('Access granted successfully');
        },
        onError: (error) => {
            console.log('Error granting access:', error);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Call the mutation to protect the data
        createProtectedDataMutation.mutate({ name, email });
    };

    return (
        <div className={styles.container}>
            <h1>Create a Protected Course</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.formGroup}>
                    <label htmlFor="name">Course Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Notification Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    Create Protected Course
                </button>
            </form>
        </div>
    );
};

export default CreateCourse;
