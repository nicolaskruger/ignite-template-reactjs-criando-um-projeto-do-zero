import { FC } from 'react';
import styles from './header.module.scss';

const Header: FC = () => {
  return (
    <header className={styles.container}>
      <img src="/Logo.svg" alt="" />
    </header>
  );
};

export default Header;
