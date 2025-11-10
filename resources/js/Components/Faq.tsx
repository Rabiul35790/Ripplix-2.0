import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQProps {
  heading?: string;
}

const FAQ: React.FC<FAQProps> = ({
  heading = "Your Questions Answered"
}) => {
  const [openId, setOpenId] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "What is Ripplix?",
      answer: "Ripplix is a curated platform showcasing real UI motion and microinteractions from top digital products. It helps designers discover, study, and save animation patterns for inspiration or team reference."
    },
    {
      id: 2,
      question: "Is Ripplix free to use?",
      answer: "Yes! You can browse and explore animations for free, but with limited access. Signing up lets you create boards, save your favorite interactions, and share collections with others."
    },
    {
      id: 3,
      question: "How often are new animations added?",
      answer: "New interactions are added weekly — featuring trending motion designs across web, mobile, and emerging platforms like AR/VR."
    },
    {
      id: 4,
      question: "Can I share boards with my team or clients?",
      answer: "Absolutely. Ripplix lets you create custom boards and share them via a link, perfect for presenting inspiration or alignment during projects."
    },
    {
      id: 5,
      question: "Where do the animations come from?",
      answer: "All animations are handpicked from real apps and products. Our team curates and categorizes them to ensure quality and context."
    }
  ];

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl !font-bold text-[#251C64] text-center mb-8 sm:mb-10 lg:mb-12">
          {heading}
        </h2>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-[#F5F5FF] rounded-xl sm:rounded-2xl overflow-hidden border border-[#E3E2FF] transition-colors"
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none focus:ring-0"
                  aria-expanded={isOpen}
                >
                  <span className="font-sora !font-semibold text-[#150F32] text-lg sm:text-lg pr-4">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 text-[#2B235A] transition-transform duration-300">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className={`px-5 sm:px-6 pb-5 sm:pb-6 transition-opacity duration-[600ms] ${
                      isOpen ? 'opacity-100 delay-150' : 'opacity-0'
                    }`}>
                      <p className="font-poppins text-[#150F32] text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
