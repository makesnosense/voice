import styles from './DisplayName.module.css';

interface DisplayNameProps {
  name: string;
}

export default function DisplayName({ name }: DisplayNameProps) {
  return <span className={styles.displayName}>{name}</span>;
}
