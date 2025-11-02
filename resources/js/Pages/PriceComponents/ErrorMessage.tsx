import React from 'react';

interface ErrorMessageProps {
    paymentError: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ paymentError }) => {
    if (!paymentError) {
        return null;
    }

    return (
        <div className="mt-4 p-3 bg-[#F7F7FC] dark:bg-red-900 border border-[#E3E2FF] dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{paymentError}</p>
        </div>
    );
};

export default ErrorMessage;
