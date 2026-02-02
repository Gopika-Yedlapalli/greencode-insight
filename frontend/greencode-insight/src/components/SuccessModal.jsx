export default function SuccessModal({
  open,
  title,
  message,
  buttonText = "OK",
  secondaryButtonText,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {onClose && (
          <button
            type="button"
            className="card-close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        )}

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          {secondaryButtonText && (
            <button className="btn" onClick={onClose}>
              {secondaryButtonText}
            </button>
          )}

          <button className="btn primary" onClick={onConfirm || onClose}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
