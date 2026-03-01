import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQProps {
 isHome?: boolean;
  heading?: string;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
}

const FAQ: React.FC<FAQProps> = ({
  heading = "Common Questions About UI Animation",
  faqItems = [],
  isHome
}) => {
  const [openId, setOpenId] = useState<number | null>(null);

  const defaultFaqData: FAQItem[] = [
    {
      id: 1,
      question: "What is UI animation?",
      answer: "UI animation refers to motion within a digital interface that helps users understand interactions, receive feedback, and navigate smoothly. This can include button feedback, loading states, page transitions, hover effects, and micro-interactions. When used thoughtfully, UI animation improves clarity, usability, and overall user experience across web, mobile, smartwatch, and emerging platforms like AR/VR."
    },
    {
      id: 2,
      question: "Why is UI animation important in UX design?",
      answer: "UI animation improves communication between the interface and the user. It provides visual feedback, reduces confusion, and guides attention during interactions. Subtle motion can indicate system status, confirm actions, or highlight important changes. When designed correctly, animation enhances usability without becoming distracting."
    },
    {
      id: 3,
      question: "What are micro-interactions in UI design?",
      answer: "Micro-interactions are small animated responses that occur when users perform an action. Examples include a button changing state, a toggle switch sliding, or a loading spinner appearing. These small moments improve engagement and make interfaces feel more responsive and intuitive."
    },
    {
      id: 4,
      question: "How can I learn from real UI animation examples?",
      answer: "Studying real UI animation examples from production apps helps designers understand how motion is applied in real-world contexts. By analyzing patterns across industries and platforms, you can identify effective interaction design techniques and apply them to your own projects."
    },
    {
      id: 5,
      question: "Where do the animations on Ripplix come from?",
      answer: "Ripplix curates UI animations from real digital products across multiple industries. Each example is categorized by interaction type, element, platform, and app, making it easier to explore how motion is used in different contexts."
    },
    {
      id: 6,
      question: "Is Ripplix free to use?",
      answer: "Ripplix offers limited access for exploration, with premium features available for deeper research and organization. You can browse examples and upgrade if you need advanced filtering, boards, and collaboration features."
    }
  ];

  const faqData: FAQItem[] = (faqItems.length > 0
    ? faqItems.map((item, index) => ({
        id: index + 1,
        question: item.question,
        answer: item.answer,
      }))
    : defaultFaqData
  );

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="max-w-[700px] text-center py-8 md:py-12 px-4">
            <h2 className="font-sora text-3xl sm:text-4xl md:text-5xl !leading-tight !font-bold text-[#251C64] text-center mb-4 sm:mb-5 lg:mb-6">
                {heading}
            </h2>
            {isHome && (
            <p className="font-poppins text-[#828287] text-sm sm:text-base md:text-lg max-w-[580px] mx-auto px-4">
                Find clear answers about UI animation, micro-interactions and motion in digital interfaces, including best practices and real-world examples.
            </p>
            )}
        </div>

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
