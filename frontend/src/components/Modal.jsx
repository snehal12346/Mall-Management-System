import React, { useEffect } from 'react';
import { IconX } from './Icons';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 600 }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content animate-fade-in"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="card-title">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <IconX size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'} maxWidth={450}>
      <div className="modal-body">
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {message || 'Are you sure you want to proceed with this action? This operation cannot be undone.'}
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;
