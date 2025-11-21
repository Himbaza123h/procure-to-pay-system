import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLoading = false,
  confirmDisabled = false,
  confirmClassName = 'bg-[#5B4002] hover:bg-[#4a3302]'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
        
        <div className="mb-4">
          {children}
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmDisabled || confirmLoading}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium transition ${confirmClassName} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {confirmLoading ? 'Processing...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;