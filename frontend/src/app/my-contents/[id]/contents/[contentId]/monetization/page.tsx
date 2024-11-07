"use client";
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEventHandler, useState } from 'react';
import { AlertCircle, File } from 'react-feather';
import { Alert } from '@/components/Alert';
import styles from './monetize.module.css';
import { useToast } from '@/components/use-toast';
import { getDataProtectorClient } from '@/utils/externals/dataProtectorClient';
import { secondsToDays } from '@/utils/secondsToDays';
import { CircularLoader } from '@/components/CircularLoader';
import { RadioGroup } from '@radix-ui/react-radio-group';
import { nrlcToRlc } from '@/utils/nrlcToRlc';
import { RadioGroupItem } from '@/components/radio-group';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Input } from '@/components/input';
import { useSetToRentMutation } from '@/utils/monetization/useSetToRentMutation';
import { useSetForSaleMutation } from '@/utils/monetization/useSetForSaleMutation';
import { AddressOrENS } from '@iexec/dataprotector';

const MonetizeContentPage = ({ params }: { params: { id: string; contentId: string } }) => {
    const { id: courseId, contentId: contentAddress } = params;
    const { toast } = useToast();
    const router = useRouter();

    const [monetizationChoice, setMonetizationChoice] = useState<'free' | 'rent' | 'sell'>();
    const [isMonetizationAlreadySet, setMonetizationAlreadySet] = useState(false);

    const [isForRent, setForRent] = useState(true);
    const [isInSubscription, setInSubscription] = useState(false);

    const [rentPriceInRLC, setRentPriceInRLC] = useState('');
    const [rentDurationInDays, setRentDurationInDays] = useState('');
    const [sellPriceInRLC, setSellPriceInRLC] = useState('');

    const { onSubmitChoiceRent, setToRentMutation } = useSetToRentMutation({
        protectedDataAddress: contentAddress,
        courseAddress: params.id
    });
    const { setForSaleMutation } = useSetForSaleMutation({
        protectedDataAddress: contentAddress,
    });

    const {
        isLoading,
        isSuccess,
        data: protectedData,
        isError,
        error,
    } = useQuery({
        queryKey: ['protectedData', contentAddress],
        queryFn: async () => {
            const { dataProtectorSharing } = await getDataProtectorClient();
            const protectedDatas = await dataProtectorSharing.getProtectedDataInCollections({
                protectedData: contentAddress,
            });
            const protectedData = protectedDatas.protectedDataInCollection[0];
            if (!protectedData) {
                return undefined;
            }

            setMonetizationAlreadySet(
                protectedData.isRentable ||
                protectedData.isIncludedInSubscription ||
                protectedData.isForSale
            );

            if (protectedData.isRentable) {
                if (Number(protectedData.rentalParams?.price) === 0) {
                    setMonetizationChoice('free');
                    setRentPriceInRLC('0');
                } else {
                    setMonetizationChoice('rent');
                    setRentPriceInRLC(String(nrlcToRlc(protectedData.rentalParams?.price)));
                }
                setRentDurationInDays(String(secondsToDays(protectedData.rentalParams?.duration)));
            }
            if (protectedData.isForSale) {
                setMonetizationChoice('sell');
                setSellPriceInRLC(String(nrlcToRlc(protectedData.saleParams?.price)));
            }

            return protectedData;
        },
    });

    const onConfirmMonetization: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();

        setToRentMutation.reset();
        setForSaleMutation.reset();

        if (!monetizationChoice) {
            toast({
                variant: 'danger',
                title: 'Please select an option.',
            });
            return;
        }

        if (monetizationChoice === 'free') {
            setToRentMutation.mutate({
                priceInRLC: 0,
                durationInDays: 30,
            });
        }

        if (monetizationChoice === 'rent') {
            onSubmitChoiceRent({
                isForRent,
                rentPriceInRLC,
                rentDurationInDays,
                isInSubscription,
            });
        }

        if (monetizationChoice === 'sell') {
            if (!sellPriceInRLC) {
                toast({
                    variant: 'danger',
                    title: 'Please enter your price.',
                });
                return;
            }

            setForSaleMutation.mutate({
                priceInRLC: Number(sellPriceInRLC),
            });
        }
    };

    const isConfirmLoading = setToRentMutation.isPending || setForSaleMutation.isPending;

    return (
        <>
            {isLoading && (
                <div className="mt-4 flex flex-col items-center gap-y-4">
                    <CircularLoader />
                </div>
            )}

            {isError && (
                <Alert variant="error" className="mt-4">
                    <p>Oops, something went wrong while fetching your content.</p>
                    <p className="mt-1 text-sm">{error.toString()}</p>
                </Alert>
            )}

            {isSuccess && protectedData && (
                <div className="page">
                    <div className="text-xl font-extrabold">
                        Choose a monetization for your content
                    </div>
                    <div className="mt-2 inline-flex shrink-0 items-center rounded-[30px] bg-grey-800 px-3 py-1.5 text-sm font-medium">
                        <File size="16" className="mr-1" />
                        {protectedData.name}
                    </div>

                    <form
                        noValidate
                        onSubmit={(event) => {
                            onConfirmMonetization(event);
                        }}
                    >
                        <RadioGroup
                            defaultValue={monetizationChoice}
                            disabled={isMonetizationAlreadySet || isConfirmLoading}
                            className="mt-10 gap-0"
                            onValueChange={(event) => {
                                setMonetizationChoice(event as 'free' | 'rent' | 'sell');
                            }}
                        >
                            <div className="flex items-center space-x-3.5">
                                <RadioGroupItem value="free" id="free" />
                                Free visualization
                            </div>

                            <div className="mt-7 flex items-center space-x-3.5">
                                <RadioGroupItem value="rent" id="rent" />
                                Rent content
                            </div>

                            <div className="mt-7 flex items-center space-x-3.5">
                                <RadioGroupItem value="sell" id="sell" />
                                Sell content
                            </div>
                        </RadioGroup>

                        {isMonetizationAlreadySet && (
                            <>
                                <p className="mt-10">
                                    <AlertCircle
                                        size="16"
                                        className="-mt-0.5 mr-0.5 inline-block"
                                    />{' '}
                                    You have already chosen how to monetize this content.
                                </p>
                            </>
                        )}

                        {!isMonetizationAlreadySet && (
                            <div className="mt-10">
                                <Button type="submit" isLoading={isConfirmLoading}>
                                    Confirm
                                </Button>
                            </div>
                        )}

                        {setToRentMutation.isError && (
                            <Alert variant="error" className="mt-6">
                                <p>
                                    Oops, something went wrong while setting the monetization
                                    options of your content.
                                </p>
                                <p className="mt-1 text-sm">
                                    {setToRentMutation.error.toString()}
                                </p>
                            </Alert>
                        )}

                        {setForSaleMutation.isError && (
                            <Alert variant="error" className="mt-6">
                                <p>
                                    Oops, something went wrong while setting the monetization
                                    options of your content.
                                </p>
                                <p className="mt-1 text-sm">
                                    {setForSaleMutation.error.toString()}
                                </p>
                            </Alert>
                        )}


                    </form>
                </div>
            )}
        </>
    );
};

function RentParams({
    isForRent,
    setForRent,
    rentPriceInRLC,
    setRentPriceInRLC,
    rentDurationInDays,
    setRentDurationInDays,
    isInSubscription,
    setInSubscription,
    isDisabled,
}: {
    isForRent: boolean;
    setForRent: (value: boolean) => void;
    rentPriceInRLC: string;
    setRentPriceInRLC: (value: string) => void;
    rentDurationInDays: string;
    setRentDurationInDays: (value: string) => void;
    isInSubscription: boolean;
    setInSubscription: (value: boolean) => void;
    isDisabled: boolean;
}) {
    return (
        <>
            <div className="ml-12 mt-2 flex items-center space-x-4">
                <Checkbox
                    id="for-rent"
                    checked={isForRent}
                    disabled={isDisabled}
                    onCheckedChange={(checked: boolean) => {
                        setForRent(checked);
                    }}
                />
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="for-rent"
                        className="text-md cursor-pointer text-base font-medium leading-10 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        <div className="mr-2 inline-block">
                            Price for watch:
                            <div className="relative inline-block">
                                <Input
                                    type="number"
                                    value={rentPriceInRLC}
                                    placeholder="Price"
                                    disabled={isDisabled}
                                    className="ml-3 inline-block w-[150px]"
                                    onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
                                        setRentPriceInRLC(event.target.value)
                                    }
                                />
                                <span className="absolute right-2.5 top-px cursor-auto">
                                    RLC
                                </span>
                            </div>
                        </div>
                        <div className="inline-block">
                            <span>and available period:</span>
                            <div className="relative inline-block">
                                <Input
                                    type="number"
                                    value={rentDurationInDays}
                                    placeholder="Duration"
                                    disabled={isDisabled}
                                    className="ml-3 inline-block w-[170px]"
                                    onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
                                        setRentDurationInDays(event.target.value)
                                    }
                                />
                                <span className="absolute right-2.5 top-px cursor-auto">
                                    day(s)
                                </span>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            <div className="ml-12 mt-6 flex items-center space-x-4">
                <Checkbox
                    id="in-subscription"
                    checked={isInSubscription}
                    disabled={isDisabled}
                    onCheckedChange={(checked: boolean) => {
                        setInSubscription(checked);
                    }}
                />
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="in-subscription"
                        className="cursor-pointer text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Subscription
                    </label>
                </div>
            </div>
        </>
    );
}

function SellParams({
    sellPriceInRLC,
    setSellPriceInRLC,
    isDisabled,
}: {
    sellPriceInRLC: string;
    setSellPriceInRLC: (value: string) => void;
    isDisabled: boolean;
}) {
    return (
        <div className="relative ml-6 mt-2 w-[150px]">
            <Input
                type="number"
                value={sellPriceInRLC}
                disabled={isDisabled}
                placeholder="Price"
                className="rounded-xl pr-12"
                onInput={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setSellPriceInRLC(event.target.value)
                }
            />
            <span className="absolute right-3 top-2 text-sm">RLC</span>
        </div>
    );
}

export default MonetizeContentPage;