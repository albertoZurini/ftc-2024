"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, DownloadCloud, Lock, AlertOctagon } from 'react-feather';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert } from '@/components/Alert';
import styles from './content.module.css';
import { getDataProtectorClient, initDataProtectorSDK } from '@/utils/externals/dataProtectorClient';
import { useContentStore } from '@/utils/content.store';
import { isImage, isVideo } from '@/utils/fileTypes';
import { WorkflowError } from '@iexec/dataprotector';
import { Button } from '@/components/button';
import { getCompletedTaskId, saveCompletedTaskId } from '@/components/localStorageContentMap';
import { useUserStore } from '@/utils/user.store';
import { ImageZoom } from '@/components/ImageZoom';
import { activeRentalsQuery } from '@/utils/activeRentals.query';
import { activeSubscriptionsQuery } from '@/utils/activeSubscriptions.query';
import { Address } from '@/utils/types';
import { RentBlock } from '@/components/RentBlock'; // Import RentBlock

const VITE_PROTECTED_DATA_DELIVERY_DAPP_ADDRESS = "0x1cb7D4F3FFa203F211e57357D759321C6CE49921";
const VITE_WORKERPOOL_ADDRESS = "prod-v8-learn.main.pools.iexec.eth";

const ContentPage = ({ params }: { params: { id: string, contentId: string } }) => {
    const [contentAsObjectURL, setContentAsObjectURL] = useState<string>('');
    const [isImageVisible, setImageVisible] = useState(false);
    const [statusMessages, setStatusMessages] = useState<Record<string, boolean>>({});
    const { content: cachedContent, addContentToCache } = useContentStore();
    const { connector } = useUserStore();
    const { address: userAddress } = useUserStore();
    const router = useRouter();
    const dataAddress = params.contentId;

    useEffect(() => {
        setImageVisible(false);
        if (cachedContent[params.contentId]) {
            showContent(cachedContent[params.contentId]);
        }
        console.log(dataAddress)
        console.log(userAddress)
    }, [params.contentId]);

    const {
        isLoading: isRentalLoading,
        data: activeRental,
    } = useQuery({
        ...activeRentalsQuery({ userAddress: userAddress as Address }),
        select: (userRentals) => userRentals.find((rental) => rental.protectedData.id === dataAddress),
    });

    const {
        data: hasActiveSubscriptionToCollectionOwner,
    } = useQuery({
        ...activeSubscriptionsQuery({ userAddress: userAddress as Address }),
        select: (userSubscriptions) =>
            userSubscriptions.some((subscription) => subscription.collection.owner.id === dataAddress),
        enabled: !!dataAddress,
    });

    const {
        isLoading,
        isSuccess,
        data: protectedData,
        isError,
        error,
    } = useQuery({
        queryKey: ['protectedData', dataAddress],
        queryFn: async () => {
            const { dataProtectorSharing } = await getDataProtectorClient();
            const protectedDatas =
                await dataProtectorSharing.getProtectedDataInCollections({
                    protectedData: dataAddress,
                });
            if (!protectedDatas.protectedDataInCollection.length) {
                return null;
            }
            return protectedDatas.protectedDataInCollection[0];
        },
    });

    // Check if the user has access to the content
    const hasAccessToContent = Boolean(activeRental) ||
        Boolean(hasActiveSubscriptionToCollectionOwner) ||
        (protectedData?.rentals?.some(rental => rental.renter.toLowerCase() === userAddress?.toLowerCase()));


    const consumeContentMutation = useMutation({
        mutationKey: ['consumeOrGetResult'],
        mutationFn: async () => {
            setStatusMessages({});
            await initDataProtectorSDK({ connector, useDefaultOptions: true });
            const { dataProtectorSharing } = await getDataProtectorClient();
            if (!dataProtectorSharing) {
                throw new Error('iExecDataProtector is not initialized');
            }

            if (cachedContent[params.contentId]) {
                showContent(cachedContent[params.contentId]);
                return;
            }

            const completedTaskId = getCompletedTaskId({
                walletId: userAddress as Address,
                protectedDataAddress: params.contentId,
            });
            if (completedTaskId) {
                try {
                    const { result } = await dataProtectorSharing.getResultFromCompletedTask({
                        taskId: completedTaskId,
                        path: 'content',
                    });
                    const fileAsBlob = new Blob([result]);
                    const fileAsObjectURL = URL.createObjectURL(fileAsBlob);
                    showContent(fileAsObjectURL);
                    return;
                } catch (err) {
                    console.error(`Failed to get result from existing completed task: ${completedTaskId}`, err);
                    return;
                }
            }

            console.log(VITE_PROTECTED_DATA_DELIVERY_DAPP_ADDRESS)
            console.log(VITE_WORKERPOOL_ADDRESS)
            console.log(dataAddress)
            console.log(userAddress)
            const { taskId, result } = await dataProtectorSharing.consumeProtectedData({
                app: VITE_PROTECTED_DATA_DELIVERY_DAPP_ADDRESS,
                protectedData: dataAddress,
                path: 'content',
                workerpool: VITE_WORKERPOOL_ADDRESS,
                onStatusUpdate: (status) => {
                    handleConsumeStatuses(status);
                },
            });

            saveCompletedTaskId({
                walletId: userAddress as Address,
                protectedDataAddress: dataAddress,
                completedTaskId: taskId,
            });

            const fileAsBlob = new Blob([result]);
            const fileAsObjectURL = URL.createObjectURL(fileAsBlob);
            showContent(fileAsObjectURL);
        },
    });

    function handleConsumeStatuses(status: { title: string; isDone: boolean; payload?: Record<string, any> }) {
        const newStatus = { [status.title]: status.isDone };
        setStatusMessages((currentMessages) => ({ ...currentMessages, ...newStatus }));
    }

    function showContent(objectURL: string) {
        setContentAsObjectURL(objectURL);
        setTimeout(() => setImageVisible(true), 200);
        addContentToCache(params.contentId, objectURL);
    }

    function downloadFile() {
        const link = document.createElement('a');
        link.download = params.contentId;
        link.href = contentAsObjectURL;
        link.click();
    }

    return (
        <div className={styles.contentContainer}>
            <h1>Content Viewer</h1>

            {hasAccessToContent ? (
                <div className={styles.videoWrapper}>
                    {contentAsObjectURL ? (
                        <div className={isImageVisible ? 'opacity-100 transition-opacity duration-700 ease-in' : 'opacity-0'}>
                            {isVideo(protectedData?.name!) && (
                                <video controls muted className="w-full">
                                    <source src={contentAsObjectURL} type="video/mp4" />
                                </video>
                            )}
                            {isImage(protectedData?.name!) && (
                                <ImageZoom src={contentAsObjectURL} alt="Visible content" className="w-full" />
                            )}
                            <Button variant="text" className="absolute -right-1 top-0" onClick={downloadFile}>
                                <DownloadCloud size="18" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.placeholder}></div>
                            <Button className="absolute" isLoading={consumeContentMutation.isPending} onClick={() => consumeContentMutation.mutate()}>
                                View or download
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <div className="mt-6">
                    {/* Show the RentBlock when the user does not have access */}
                    <button onClick={() => { console.log(protectedData), console.log(hasActiveSubscriptionToCollectionOwner), console.log(activeRental), console.log(hasAccessToContent) }}>log</button>
                    {protectedData?.isRentable && (
                        <RentBlock protectedDataAddress={dataAddress} rentalParams={protectedData.rentalParams!} courseAddress={params.id} />
                    )}
                    {!protectedData?.isRentable && (
                        <div className="text-center mt-4">
                            <Lock size="20" />
                            <p>This content is not available for rent or subscription.</p>
                        </div>
                    )}
                </div>
            )}

            {Object.keys(statusMessages).length > 0 && (
                <div className="mb-6 ml-1.5 mt-6">
                    {Object.entries(statusMessages).map(([message, isDone]) => (
                        <div key={message} className={`ml-2 mt-2 flex items-center gap-x-2 px-2 text-left ${isDone ? 'text-grey-500' : 'text-white'}`}>
                            {isDone ? <CheckCircle size="20" className="text-primary" /> : consumeContentMutation.isError ? <AlertOctagon className="size-5" /> : <LoadingSpinner className="size-5 text-primary" />}
                            {message}
                        </div>
                    ))}
                </div>
            )}

            {consumeContentMutation.isError && (
                <Alert variant="error" className="mt-4 overflow-auto">
                    <p>Oops, something went wrong.</p>
                    <p className="mt-1 text-sm">
                        {consumeContentMutation.error.toString()}
                        <br />
                        {(consumeContentMutation.error as WorkflowError)?.message}
                    </p>
                </Alert>
            )}
        </div>
    );
};

export default ContentPage;
