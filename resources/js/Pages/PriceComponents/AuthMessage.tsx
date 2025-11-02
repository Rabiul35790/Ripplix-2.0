import React from 'react';
import { Zap } from 'lucide-react';

interface AuthMessageProps {
    isAuthenticated: boolean;
}

const AuthMessage: React.FC<AuthMessageProps> = ({ isAuthenticated }) => {
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="mb-6 p-4 bg-[#F7F7FC] dark:bg-yellow-900 rounded-lg border border-[#E3E2FF] dark:border-yellow-700">
            <div className="flex items-center">
                <Zap className="w-5 h-5 text-[#2B235A] dark:text-yellow-400 mr-2" />
                <p className="text-[#2B235A] dark:text-yellow-200 text-sm">
                    Sign in to purchase a plan and unlock premium features
                </p>
            </div>
        </div>
    );
};

export default AuthMessage;
