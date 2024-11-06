
type AddressForNavBarProps = {
  address: string;
};

export default function AddressChip(props: AddressForNavBarProps) {
  const { address } = props;




  const displayAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;

  return (
    <div className="flex shrink-0 items-center rounded-md bg-grey-800 px-3 py-2">
      <div className="text-sm text-primary">{displayAddress}</div>
      <button
        className="-my-0.5 -mr-0.5 ml-1.5 shrink-0 bg-grey-800 px-0.5 py-0.5"
        onClick={() => {
          navigator.clipboard.writeText(address);
        }}
      >
      </button>
    </div>
  );
}
