import spinnerStyles from './Spinner.module.css';

export default function Spinner() {
  return (
    <div className={spinnerStyles.container}>
      <div className={spinnerStyles.spinner}></div>
    </div>
  );
}