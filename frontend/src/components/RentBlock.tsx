import { getDataProtectorClient } from '@/utils/externals/dataProtectorClient';
import { useUserStore } from '@/utils/user.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';
import { nrlcToRlc } from '@/utils/nrlcToRlc';
import { readableSecondsToDays } from '@/utils/secondsToDays';
import { Button } from './button';
import { Alert } from './Alert';
import { getWeb3mailClient } from '@/utils/externals/web3mailClient';
import { useRouter } from 'next/navigation';


export function RentBlock({
  protectedDataAddress,
  rentalParams,
  courseAddress,
}: {
  protectedDataAddress: string;
  rentalParams: { price: number; duration: number };
  courseAddress: string;
}) {
  const queryClient = useQueryClient();
  const { address: userAddress } = useUserStore();
  const router = useRouter();

  const rentProtectedDataMutation = useMutation({
    mutationKey: ['rentProtectedData'],
    mutationFn: async () => {
      const { dataProtectorSharing } = await getDataProtectorClient();
      return dataProtectorSharing.rentProtectedData({
        protectedData: protectedDataAddress,
        price: Number(rentalParams.price),
        duration: Number(rentalParams.duration),
      });
    },
    onSuccess: () => {
      console.log("success")
      queryClient.invalidateQueries({
        queryKey: ['activeRentals', userAddress],
      });

      toast({
        variant: 'success',
        title: 'You can now view this content!',
      });
      sendEmailMutation.mutate({
        message: 'You have rented a video course',
        courseAddress: courseAddress,
      });
    },
  });

  const sendEmailMutation = useMutation({
    mutationKey: ["sendEmail"],
    mutationFn: async ({
      message,
      courseAddress,
    }: {
      message: string;
      courseAddress: string;
    }) => {
      const { web3mail } = await getWeb3mailClient();
      return web3mail.sendEmail({
        senderName: "Blockchain Academy",
        contentType: "text/plain",
        emailSubject: "A user has bought your video",
        emailContent: `You have new a new user on your video course ${protectedDataAddress}`,
        protectedData: courseAddress!,
        workerpoolAddressOrEns: "prod-v8-learn.main.pools.iexec.eth",
      });
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Email sent!',
      });

      router.push(`/courses/${courseAddress}/content/${protectedDataAddress}`);
    },
    onError: (err) => {
      console.error(err);
    },
  });
  return (
    <>
      <div className="flex w-full items-start gap-2 md:gap-8">
        <div className="flex-1">
          This content is available for rental, and you can consume the content
          unlimitedly throughout the duration of the rental period.
        </div>
        <div className="-mt-0.5 text-xl font-bold text-primary">
          <div className="text-center">
            <div>{nrlcToRlc(rentalParams.price)} RLC</div>
            <div className="text-sm">
              for {readableSecondsToDays(rentalParams.duration)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-7 text-center">
        <Button
          isLoading={rentProtectedDataMutation.isPending}
          onClick={() => {
            rentProtectedDataMutation.mutate();
          }}
        >
          Rent content
        </Button>
      </div>

      {rentProtectedDataMutation.isError && (
        <Alert variant="error" className="mt-7">
          <p>Oops, something went wrong while renting this content.</p>
          <p className="mt-1 text-sm">
            {rentProtectedDataMutation.error.toString()}
          </p>
        </Alert>
      )}
    </>
  );
}
