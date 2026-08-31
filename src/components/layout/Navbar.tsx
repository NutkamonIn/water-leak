import Link from 'next/link';
import styles from './Navbar.module.css';

interface NavbarProps {
  role?: 'engineer' | 'resident';
  onLogout?: () => void;
}

export default function Navbar({ role, onLogout }: NavbarProps) {
  return (
    <nav className={`glass-panel ${styles.navbar}`}>
      <div className={styles.brand}>
        <span className={styles.title}>Water Leak System</span>
      </div>

      {role && (
        <div className={styles.actions}>
          <span className={styles.roleBadge}>
            {role === 'engineer' ? 'Engineer' : 'Resident'}
          </span>
          <button onClick={onLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
