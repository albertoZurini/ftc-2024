import { FC } from 'react';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import styles from '@/app/page.module.css';

export const EOA: FC = () => {
    const { address } = useAccount();

    const { data: name } = useEnsName({ address, chainId: 1 });
    const { data: avatar } = useEnsAvatar({ name: name as string | undefined, chainId: 1 });

    function formatAddress(address: `0x${string}` | undefined) {
        return address ? address.substring(0, 4) + '...' + address.substring(address.length - 4, address.length) : '';
    }

    return (
        <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap2}`}>
            <img
                src={avatar || 'https://docs.ens.domains/fallback.svg'}
                className={`${styles.w8} ${styles.h8} ${styles.roundedFull}`}
                alt="ENS Avatar"
            />
            {name && (
                <>
                    <div className={`${styles.flex} ${styles.flexCol} ${styles.gap0} ${styles.leading3} ${styles.pr10}`}>
                        <span className={styles.fontBold}>{name}</span>
                    </div>
                    <div className={`${styles.flex} ${styles.flexCol} ${styles.gap0} ${styles.leading3} ${styles.pr10}`}>
                        |
                    </div>
                </>
            )}
            <div className={`${styles.flex} ${styles.flexCol} ${styles.gap0} ${styles.leading3} ${styles.pr10}`}>
                <span>{formatAddress(address)}</span>
            </div>
        </div>
    );
};