import { Check, X, AlertTriangle } from "lucide-react";

/**
 * Reusable dialog for success / error / info / confirm messages.
 */
const Modal = ({
  open,
  title,
  message,
  variant = "info", // success | error | info | confirm
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  const isConfirm = variant === "confirm";

  const iconWrap =
    variant === "success"
      ? "bg-green-100"
      : variant === "error"
        ? "bg-red-100"
        : variant === "confirm"
          ? "bg-amber-100"
          : "bg-stone-100";

  const iconBg =
    variant === "success"
      ? "bg-green-500"
      : variant === "error"
        ? "bg-red-500"
        : variant === "confirm"
          ? "bg-amber-500"
          : "bg-gray-500";

  const Icon =
    variant === "success"
      ? Check
      : variant === "error" || variant === "confirm"
        ? AlertTriangle
        : Check;

  const handleBackdrop = () => {
    if (!isConfirm) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-5">
          <div className={`${iconWrap} p-3 rounded-full`}>
            <div className={`${iconBg} rounded-full p-2`}>
              {variant === "error" ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Icon className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>

        {title && (
          <h2
            id="app-modal-title"
            className="text-center text-xl font-semibold text-gray-800 mb-2"
          >
            {title}
          </h2>
        )}
        {message && (
          <p className="text-center text-gray-500 text-sm mb-6 whitespace-pre-line">
            {message}
          </p>
        )}

        <div className={`flex gap-3 ${isConfirm ? "flex-col sm:flex-row" : ""}`}>
          {isConfirm && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              if (!isConfirm) onClose?.();
            }}
            className={`flex-1 px-4 py-2.5 rounded-md text-white transition-colors ${
              variant === "error"
                ? "bg-red-500 hover:bg-red-600"
                : variant === "confirm"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-primary hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
