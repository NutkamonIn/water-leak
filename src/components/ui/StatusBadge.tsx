import styles from './StatusBadge.module.css';

type Status = 'normal' | 'warning' | 'leak' | 'offline';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<Status, { label: string }> = {
  normal: { label: 'Normal' },
  warning: { label: 'Warning' },
  leak: { label: 'LEAK DETECTED' },
  offline: { label: 'Offline' }
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <div className={`${styles.badge} ${styles[status]} ${styles[size]}`}>
      <span className={styles.dot}></span>
      <span className={styles.label}>{config.label}</span>
    </div>
  );
}
