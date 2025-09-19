import { useState } from 'react';
import { Copy as CopyIcon, Check } from 'lucide-react';
import './CopyCard.css';



export default function CopyCard() {
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="copy-card">
      <div className="copy-card-content">
        <p className="copy-card-title">Meeting url</p>
        <p className="copy-card-link">{currentUrl}</p>
      </div>
      <button
        className={`copy-card-button ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {copied ? <Check size={18} /> : <CopyIcon size={18} />}
      </button>
    </div>
  );
}