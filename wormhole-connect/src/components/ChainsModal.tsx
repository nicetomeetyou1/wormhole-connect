import React, { ChangeEvent, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { ChainConfig } from 'sdklegacy';
import config from 'config';
import { CENTER, joinClass } from 'utils/style';

import Header from './Header';
import Modal from './Modal';
import Spacer from './Spacer';
import Search from './Search';
import Scroll from './Scroll';
import TokenIcon from 'icons/TokenIcons';
import MoreNetworkIcon from 'icons/MoreNetworkIcon';
import { Chain } from '@wormhole-foundation/sdk';

const useStyles = makeStyles()((theme: any) => ({
  chainsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 150px)',
    justifyContent: 'space-between',
  },
  noResults: {
    ...CENTER,
    minHeight: '130px',
  },
  chainTile: {
    width: '117px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    margin: '12px 4px',
    padding: '16px',
    transition: 'background-color 0.4s',
    cursor: 'pointer',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: theme.palette.options.select,
    },
  },
  extraChainTile: {
    textDecoration: 'none',
    color: 'inherit',
  },
  chainIcon: {
    width: '48px',
    height: '48px',
  },
  chainText: {
    fontSize: '14px',
    marginTop: '16px',
  },
  disabled: {
    opacity: '40%',
    cursor: 'not-allowed',
    clickEvent: 'none',
  },
  subtitle: {
    opacity: '60%',
  },
}));

export enum ModalType {
  FROM = 1,
  TO = 2,
}

type Props = {
  title: string;
  open: boolean;
  chains?: ChainConfig[];
  isDisabled?: (chain: Chain) => boolean;
  onClose: () => any;
  onSelect: (chain: Chain) => any;
  onMoreNetworkSelect?: (
    href: string,
    chainName: string,
    target?: string,
  ) => any;
};

function ChainsModal(props: Props) {
  const { classes } = useStyles();
  const theme: any = useTheme();

  const chains = props.chains || config.chainsArr;
  const [search, setSearch] = useState<string | undefined>();
  const handleExtraNetwork = (
    href: string,
    chainName: string,
    target?: string,
  ) => {
    if (href) {
      props.onMoreNetworkSelect?.(href, chainName, target);
    } else {
      props.onMoreNetworkSelect?.(config.moreNetworks!.href, chainName, target);
    }
  };
  const supportedChains = useMemo(() => {
    const supported = config.routes.allSupportedChains();
    return chains.filter((chain) => {
      return supported.includes(chain.key);
    });
  }, [chains]);

  const searchChains = (
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | undefined,
  ) => {
    setSearch(e?.target.value.toLowerCase());
  };

  const showChain = (chain: Chain) => {
    if (chain === 'Wormchain') return false;
    if (!search) return true;
    const chainConfig = config.chains[chain]!;
    const name = chainConfig.displayName.toLowerCase();
    return name.includes(search);
  };

  const handleClose = () => {
    setTimeout(() => setSearch(undefined), 500);
    props.onClose();
  };

  const handleSelect = (chain: Chain) => {
    props.onSelect(chain);
    handleClose();
  };

  return (
    <Modal
      open={props.open}
      closable
      width={config.chainsArr.length > 6 ? 650 : 500}
      onClose={handleClose}
    >
      <Header text={props.title} size={28} />
      <div className={classes.subtitle}>Select Network</div>
      <Spacer height={16} />
      <Search placeholder="Search networks" onChange={searchChains} />
      <Spacer height={16} />
      <Scroll
        height="calc(100vh - 300px)"
        blendColor={theme.palette.modal.background}
      >
        {supportedChains.length > 0 ? (
          <div className={classes.chainsContainer}>
            {supportedChains.map((chain: any, i) => {
              const disabled = props.isDisabled
                ? props.isDisabled(chain.key)
                : false;
              return (
                showChain(chain.key) && (
                  <div
                    key={i}
                    className={joinClass([
                      classes.chainTile,
                      !!disabled && classes.disabled,
                    ])}
                    onClick={() => handleSelect(chain.key)}
                  >
                    <TokenIcon icon={chain.icon} height={48} />
                    <div className={classes.chainText}>{chain.displayName}</div>
                  </div>
                )
              );
            })}
            {config.moreNetworks?.networks.map((chain, i) => {
              return (
                <div
                  key={i}
                  className={joinClass([
                    classes.chainTile,
                    classes.extraChainTile,
                  ])}
                  onClick={() =>
                    handleExtraNetwork(
                      chain.href || config.moreNetworks!.href,
                      chain.name ||
                        chain.label.toLocaleLowerCase().split(' ').join('_'),
                      chain.target || config.moreNetworks?.target,
                    )
                  }
                >
                  <MoreNetworkIcon
                    icon={chain.icon}
                    alt={chain.label}
                    height={48}
                    showOpenInNewIcon={chain.showOpenInNewIcon}
                    description={
                      chain.description || config.moreNetworks?.description
                    }
                  />
                  <div className={classes.chainText}>{chain.label}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={classes.noResults}>No results</div>
        )}
      </Scroll>
    </Modal>
  );
}

export default ChainsModal;
