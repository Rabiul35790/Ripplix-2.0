import React, { useState, useEffect } from 'react';

interface SimpleCaptchaProps {
  onValidationChange: (isValid: boolean) => void;
  error?: string;
}

const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({ onValidationChange, error }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Generate random numbers
  useEffect(() => {
    generateNewProblem();
  }, []);

  const generateNewProblem = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsValid(false);
    onValidationChange(false);
  };

  const handleAnswerChange = (value: string) => {
    setUserAnswer(value);
    const correctAnswer = num1 + num2;
    const valid = parseInt(value) === correctAnswer;
    setIsValid(valid);
    onValidationChange(valid);
  };

  return (
    <div>
      {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Anti-Robot Verification *
      </label> */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-lg font-sora bg-[#FAFAFA] dark:bg-gray-700 px-3 py-2 rounded">
          <span className="text-[#2B235A] dark:text-white">{num1}</span>
          <span className="text-[#2B235A] dark:text-gray-400">+</span>
          <span className="text-[#2B235A] dark:text-white">{num2}</span>
          <span className="text-[#2B235A] dark:text-gray-400">=</span>
        </div>
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          className={`w-20 px-3 py-2 bg-[#FAFAFC] border border-[#E3E2FF] rounded-lg focus:ring-2 focus:ring-[#E3E2FF] focus:border-transparent transition-colors ${
            error
              ? ' dark:bg-red-900/20 dark:border-red-600'
              : isValid
              ? ' dark:bg-green-900/20 dark:border-green-600'
              : ' dark:border-gray-600 dark:bg-gray-700'
          } text-gray-900 dark:text-white`}
          placeholder="?"
        />
        <button
          type="button"
          onClick={generateNewProblem}
          className="px-3 py-2 text-sm text-[#2B235A] hover:opacity-90 dark:text-blue-400 dark:hover:text-blue-200 focus:outline-none focus:ring-0"
        >
          ↻ New
        </button>
        {isValid && (
          <span className="text-green-600 dark:text-green-400 text-sm">✓ Verified</span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default SimpleCaptcha;
