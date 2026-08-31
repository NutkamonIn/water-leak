import Link from 'next/link';
import { Droplets } from 'lucide-react';
import styles from './Navbar.module.css';

interface NavbarProps {
  role?: 'engineer' | 'resident';
  onLogout?: () => void;
}

export default function Navbar({ role, onLogout }: NavbarProps) {
  return (
    <nav className={`glass-panel ${styles.navbar}`}>
      <div className={styles.brand}>
        <Droplets size={22} color="#38bdf8" style={{ marginRight: '8px' }} />
        <span className={styles.title}>Water Leak System</span>
      </div>

      {role && (
        <div className={styles.actions}>
          <span className={styles.roleBadge}>
            Role: {role === 'engineer' ? 'Engineer' : 'Resident'}
          </span>
          <button onClick={onLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
