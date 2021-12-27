import { useRouter } from 'next/router';
import { FC } from 'react';
import styles from './header.module.scss';

const Header: FC = () => {
  const route = useRouter();

  return (
    <header className={styles.container}>
      <button
        type="button"
        onClick={() => {
          route.push('/', '/', {});
        }}
      >
        <img src="/Logo.svg" alt="logo" />
      </button>
    </header>
  );
};

export default Header;
