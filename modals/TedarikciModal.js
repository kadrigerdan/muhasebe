'use client';
import { useEffect } from 'react';
import TedarikciForm from '@/components/tedarikci/TedarikciForm';

export default function TedarikciModal({ open, onClose, initial }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {initial ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                <TedarikciForm initial={initial} onSuccess={onClose} />
            </div>
        </div>
    );
}