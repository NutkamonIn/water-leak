import styles from './SensorChart.module.css';

interface SensorChartProps {
  currentValue: number;
  threshold: number;
}

export default function SensorChart({ currentValue, threshold }: SensorChartProps) {
  // A simple visual bar representation for MVP instead of a full D3/Chartjs graph
  const isLeak = currentValue >= threshold;
  
  return (
    <div className={styles.chartContainer}>
      <div className={styles.info}>
        <div className={styles.metric}>
          <span className={styles.label}>Current Water Level</span>
          <span className={`${styles.value} ${isLeak ? styles.dangerText : styles.safeText}`}>
            {currentValue}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Threshold</span>
          <span className={styles.value}>{threshold}</span>
        </div>
      </div>
      
      <div className={styles.barBackground}>
        <div 
          className={`${styles.barFill} ${isLeak ? styles.dangerBg : styles.safeBg}`} 
          style={{ width: `${Math.min(currentValue, 100)}%` }} 
        />
        <div 
          className={styles.thresholdMarker} 
          style={{ left: `${threshold}%` }}
        />
      </div>
    </div>
  );
}
