"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
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
import { Address } from '@/utils/types';

const VITE_PROTECTED_DATA_DELIVERY_DAPP_ADDRESS = "0x1cb7D4F3FFa203F211e57357D759321C6CE49921";
const VITE_WORKERPOOL_ADDRESS = "prod-v8-learn.main.pools.iexec.eth";

const ContentPage = ({ params }: { params: { contentId: string } }) => {
    const [contentAsObjectURL, setContentAsObjectURL] = useState<string>('');
    const [isImageVisible, setImageVisible] = useState(false);
    const [statusMessages, setStatusMessages] = useState<Record<string, boolean>>({});
    const { content: cachedContent, addContentToCache } = useContentStore();
    const { address: userAddress } = useUserStore();
    const { connector } = useUserStore();
    const router = useRouter();
    const dataAddress = params.contentId;

    useEffect(() => {
        setImageVisible(false);
        if (cachedContent[params.contentId]) {
            showContent(cachedContent[params.contentId]);
        }
    }, [params.contentId]);

    const consumeContentMutation = useMutation({
        mutationKey: ['consumeOrGetResult'],
        mutationFn: async () => {
            setStatusMessages({});
            await initDataProtectorSDK({ connector, useDefaultOptions: true });
            const { dataProtectorSharing } = await getDataProtectorClient();
            if (!dataProtectorSharing) {
                console.log("shit")
                throw new Error('iExecDataProtector is not initialized');
            }


            if (cachedContent[params.contentId]) {
                showContent(cachedContent[params.contentId]);
                return;
            }

            const completedTaskId = getCompletedTaskId({
                walletId: "",
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
        if (status.title === 'FETCH_WORKERPOOL_ORDERBOOK' && !status.isDone) {
            setStatusMessages({ 'Check for iExec workers availability': false });
        }
        if (status.title === 'PUSH_ENCRYPTION_KEY' && !status.isDone) {
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Check for iExec workers availability': true,
                'Push encryption key to iExec Secret Management Service': false,
            }));
        }
        if (status.title === 'CONSUME_ORDER_REQUESTED' && !status.isDone) {
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Push encryption key to iExec Secret Management Service': true,
                'Request to access this content': false,
            }));
        }
        if (status.title === 'CONSUME_TASK' && !status.isDone && status.payload?.taskId) {
            saveCompletedTaskId({
                walletId: userAddress as Address,
                protectedDataAddress: dataAddress,
                completedTaskId: status.payload.taskId,
            });
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Request to access this content': true,
                'Content now being handled by an iExec worker (1-2min)': false,
            }));
        }
        if (status.title === 'CONSUME_TASK' && status.isDone) {
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Content now being handled by an iExec worker (1-2min)': true,
            }));
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Download result from IPFS': false,
            }));
        }
        if (status.title === 'CONSUME_RESULT_DOWNLOAD' && status.isDone) {
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Download result from IPFS': true,
                'Decrypt result': false,
            }));
        }
        if (status.title === 'CONSUME_RESULT_DECRYPT' && status.isDone) {
            setStatusMessages((currentMessages) => ({
                ...currentMessages,
                'Decrypt result': true,
            }));
        }
    }

    function showContent(objectURL: string) {
        setContentAsObjectURL(objectURL);
        setTimeout(() => {
            setImageVisible(true);
        }, 200);
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
            <div className={styles.videoWrapper}>
                {contentAsObjectURL ? (
                    <div className={isImageVisible ? 'opacity-100 transition-opacity duration-700 ease-in' : 'opacity-0'}>
                        {isVideo(params.contentId) && (
                            <video controls muted className="w-full">
                                <source src={contentAsObjectURL} type="video/mp4" />
                            </video>
                        )}
                        {isImage(params.contentId) && (
                            <ImageZoom
                                src={contentAsObjectURL}
                                alt="Visible content"
                                className="w-full"
                            />
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

            {Object.keys(statusMessages).length > 0 && (
                <div className="mb-6 ml-1.5 mt-6">
                    {Object.entries(statusMessages).map(([message, isDone]) => (
                        <div key={message} className={`ml-2 mt-2 flex items-center gap-x-2 px-2 text-left ${isDone ? 'text-grey-500' : 'text-white'}`}>
                            {isDone ? (
                                <CheckCircle size="20" className="text-primary" />
                            ) : consumeContentMutation.isError ? (
                                <AlertOctagon className="size-5" />
                            ) : (
                                <LoadingSpinner className="size-5 text-primary" />
                            )}
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