"use client";
import { useState, useRef, FormEventHandler, ChangeEventHandler, DragEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, UploadCloud, XCircle } from 'react-feather';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert } from '@/components/Alert';
import { create } from 'zustand';
import { WorkflowError } from '@iexec/dataprotector';
import './create.module.css';
import { useToast } from '@/components/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { createProtectedData } from '@/components/createProtectedData';
import { getOrCreateCollection } from '@/components/getOrCreateCollection';
import { getDataProtectorClient } from '@/utils/externals/dataProtectorClient';
import clsx from 'clsx';
import { Button } from '@/components/button';
import Link from 'next/link';
const VITE_PROTECTED_DATA_DELIVERY_WHITELIST_ADDRESS = "0x256bcd881c33bdf9df952f2a0148f27d439f2e64"

const FILE_SIZE_LIMIT_IN_MB = 500;
const FILE_SIZE_LIMIT_IN_KB = FILE_SIZE_LIMIT_IN_MB * 1024;

type OneStatus = {
    title: string;
    isDone?: boolean;
    isError?: boolean;
    payload?: Record<string, string>;
};

type StatusState = {
    statuses: Record<
        string,
        { isDone?: boolean; isError?: boolean; payload?: Record<string, string> }
    >;
    addOrUpdateStatusToStore: (status: OneStatus) => void;
    resetStatuses: () => void;
};

const useStatusStore = create<StatusState>((set) => ({
    statuses: {},
    addOrUpdateStatusToStore: (status) =>
        set((state) => {
            const updatedStatuses = { ...state.statuses };
            updatedStatuses[status.title] = {
                isDone: status.isDone,
                isError: status.isError || false,
                payload: status.payload,
            };
            return { statuses: updatedStatuses };
        }),
    resetStatuses: () => set({ statuses: {} }),
}));

const SubmitNewContent = ({ courseId }: { courseId: string }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File>();
    const [fileName, setFileName] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [createdProtectedDataAddress, setCreatedProtectedDataAddress] = useState<string>();
    const [addToCollectionError, setAddToCollectionError] = useState();
    const [addToCollectionSuccess, setAddToCollectionSuccess] = useState(false);

    const inputTypeFileRef = useRef<HTMLInputElement>(null);

    const { statuses, addOrUpdateStatusToStore, resetStatuses } = useStatusStore();

    const dropZone = useRef(null);

    const onFileSelected: ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        const selectedFile = event?.target?.files?.[0];

        if (!selectedFile) {
            return;
        }

        setFileName(selectedFile.name);
        setFile(selectedFile);
    };

    const handleDrag: DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === 'dragenter' || event.type === 'dragover') {
            setDragActive(true);
        } else if (event.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const onFileDrop: DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const droppedFile = event?.dataTransfer?.files?.[0];

        setFileName(droppedFile.name);
        setFile(droppedFile);
    };

    const onSubmitFileForm: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        if (!file) {
            toast({
                variant: 'danger',
                title: 'Please upload a video file.',
            });
            return;
        }

        const fileSizeInKb = file.size / 1024;
        if (fileSizeInKb > FILE_SIZE_LIMIT_IN_KB) {
            toast({
                variant: 'danger',
                title: 'File is too large',
                description: `Your video file is ${Math.round(fileSizeInKb / 1024)} MB, the limit is ${FILE_SIZE_LIMIT_IN_MB} MB.`,
            });
            return;
        }

        setLoading(true);
        await handleFile();
        setLoading(false);
    };

    async function handleFile() {
        cleanErrors();

        try {
            // 1- Create protected data
            const { address } = await createProtectedData({
                file: file!,
                onStatusUpdate: addOrUpdateStatusToStore,
            });
            setCreatedProtectedDataAddress(address);

            // 2- Get or create collection
            const collectionId = await getOrCreateCollection({
                onStatusUpdate: addOrUpdateStatusToStore,
            });

            // 3- Add to collection
            const dataProtector = await getDataProtectorClient();
            await dataProtector.dataProtectorSharing.addToCollection({
                protectedData: address,
                collectionId,
                addOnlyAppWhitelist: VITE_PROTECTED_DATA_DELIVERY_WHITELIST_ADDRESS,
                onStatusUpdate: (status) => {
                    if (status.title === 'APPROVE_COLLECTION_CONTRACT') {
                        const title = 'Approve DataProtector Sharing smart-contract to manage this protected data';
                        if (!status.isDone) {
                            addOrUpdateStatusToStore({ title, isDone: false });
                        } else {
                            addOrUpdateStatusToStore({ title, isDone: true });
                        }
                    } else if (status.title === 'ADD_PROTECTED_DATA_TO_COLLECTION') {
                        const title = 'Add protected data to your collection';
                        if (!status.isDone) {
                            addOrUpdateStatusToStore({ title, isDone: false });
                        } else {
                            addOrUpdateStatusToStore({ title, isDone: true });
                        }
                    }
                },
            });

            setAddToCollectionSuccess(true);

            queryClient.invalidateQueries({ queryKey: ['myCollections'] });

            resetUploadForm();
        } catch (err: any) {
            resetStatuses();
            setAddToCollectionError(err?.message);

            if (err instanceof WorkflowError) {
                console.error(`[Upload new content] ERROR ${err.cause}`, err);
                return;
            }
            console.error('[Upload new content] ERROR', err, err.data && err.data);
        }
    }

    function cleanErrors() {
        resetStatuses();
        setAddToCollectionError(undefined);
    }

    function resetUploadForm() {
        setFile(undefined);
        setFileName('');
        inputTypeFileRef.current?.value && (inputTypeFileRef.current.value = '');
    }

    return (
        <div className="flex gap-x-8">
            <div className="w-full">
                <form noValidate className="flex w-full flex-col items-center" onSubmit={onSubmitFileForm}>
                    <div className="w-full max-w-[550px] mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="w-full max-w-[550px] mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <label className="flex w-full max-w-[550px] items-center justify-center hover:cursor-pointer">
                        <input
                            ref={inputTypeFileRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={onFileSelected}
                        />
                        <div
                            ref={dropZone}
                            className={clsx(
                                dragActive && 'ring ring-primary',
                                'relative flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-3xl border border-grey-700 bg-grey-800 text-xl text-white'
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={onFileDrop}
                        >
                            <UploadCloud size="58" strokeWidth="1px" className="pointer-events-none" />
                            <span className="pointer-events-none mt-2 text-lg">Upload video</span>
                            {!fileName && (
                                <>
                                    <span className="pointer-events-none mt-8 text-xs">Drag and drop a video file here</span>
                                    <span className="pointer-events-none mt-3 text-xs text-grey-500">
                                        File size should be less than {FILE_SIZE_LIMIT_IN_MB} MB
                                    </span>
                                </>
                            )}
                            {fileName && (
                                <>
                                    <div className="mt-8 flex w-11/12 items-center justify-center gap-x-1.5">
                                        <span className="text-sm">{fileName}</span>
                                        {!isLoading && (
                                            <button
                                                type="button"
                                                className="p-1 text-sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    resetUploadForm();
                                                }}
                                            >
                                                <XCircle size="18" />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </label>
                    <div className="mt-6 text-center">
                        <Button type="submit" isLoading={isLoading}>
                            Submit Content
                        </Button>
                        <div className="mt-2 text-xs">Expect it to take total ~1min</div>
                    </div>

                    <div className="ml-1 mt-3 flex w-full max-w-[550px] flex-col gap-y-0.5 text-sm">
                        {Object.keys(statuses).length > 0 && (
                            <div className="mt-6">
                                {Object.entries(statuses).map(([message, { isDone, isError }]) => (
                                    <div
                                        key={message}
                                        className={`ml-2 mt-2 flex items-center gap-x-2 px-2 text-left ${isDone ? 'text-grey-500' : isError ? 'text-red-500' : 'text-white'}`}
                                    >
                                        {isError ? (
                                            <XCircle size="20" />
                                        ) : isDone ? (
                                            <CheckCircle size="20" className="text-primary" />
                                        ) : (
                                            <LoadingSpinner className="size-5 text-primary" />
                                        )}
                                        {message}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {addToCollectionError && (
                        <Alert variant="error" className="mt-8 max-w-[580px]">
                            <p>Oops, something went wrong.</p>
                            <p className="mt-1 max-w-[500px] overflow-auto text-sm">{addToCollectionError}</p>
                        </Alert>
                    )}

                    {addToCollectionSuccess && (
                        <>
                            <Button asChild className="mt-6">
                                <Link
                                    href={`/my-contents/${courseId}/contents/${createdProtectedDataAddress}/monetization`}>
                                    Set The Price
                                    <ArrowRight size="18" className="-mr-0.5 ml-1.5" />
                                </Link>
                            </Button>

                            <Button asChild className="mt-6">
                                <Link href={`/my-contents/${courseId}`}>
                                    Go to Content
                                    <ArrowRight size="18" className="-mr-0.5 ml-1.5" />
                                </Link>
                            </Button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

const CreateContentPage = ({ params }: { params: { id: string } }) => {
    return <SubmitNewContent courseId={params.id} />;
};

export default CreateContentPage;