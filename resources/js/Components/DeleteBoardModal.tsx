import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Board {
  id: number;
  name: string;
}

interface DeleteBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board | null;
}

const DeleteBoardModal: React.FC<DeleteBoardModalProps> = ({
  isOpen,
  onClose,
  board,
}) => {
  const handleDelete = () => {
    if (board) {
      router.delete(`/boards/${board.id}`);
      onClose();
    }
  };

  if (!isOpen || !board) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sora">
      <div
        className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-0"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-[#2B235A] mb-2">
            Delete Board?
          </h3>
          <p className="text-sm text-[#8787A8]">
            Are you sure you want to delete "<span className="font-semibold text-[#2B235A]">{board.name}</span>"? <br/>This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[#2B235A] bg-[#F5F5FA] border border-[#E3E2FF] rounded-md hover:bg-[#E3E2FF] transition-colors duration-500 focus:outline-none focus:ring-0"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-500 focus:outline-none focus:ring-0"
          >
            Delete Board
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteBoardModal;
