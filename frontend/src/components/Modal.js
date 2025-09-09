// frontend/src/components/Modal.js
import React from 'react';

/**
 * A reusable Modal component for displaying forms or other content in a dialog.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function when the modal is requested to be closed.
 * @param {string} props.title - Title to display in the modal header.
 * @param {React.ReactNode} props.children - Content to be rendered inside the modal body.
 */
function Modal({ isOpen, onClose, title, children }) {
  // If modal is not open, return null to not render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 animate-scale-in">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          {/* Close button for the modal */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6">
          {children} {/* Render children content inside the modal body */}
        </div>
      </div>
    </div>
  );
}

export default Modal;
