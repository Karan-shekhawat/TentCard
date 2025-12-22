import React, { useState, useEffect } from 'react';
import { ChevronRight, HelpCircle, X } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStepChange: (stepIndex: number) => void;
}

const STEPS = [
    {
        id: 'welcome',
        targetId: null,
        title: 'Welcome to Tent Card Generator',
        text: 'Create printable name plates adjsut size accroding to your actual name plate holder. Use Ruler to measure size of plate holder.',
        subtext: 'Developed by Karan Shekhawat',
        position: 'center'
    },
    {
        id: 'manual',
        targetId: 'tour-manual-input',
        title: 'Add Name and Designation',
        text: 'Manually add full name and designation in the fields, then click "Add Plate" to create a name plate.',
        position: 'right'
    },
    {
        id: 'bulk',
        targetId: 'tour-bulk-mode',
        title: 'Adding Name Plates in Bulk',
        text: 'Switch to "Bulk Text" to paste a list of names.',
        tip: 'Tip: Use a comma or new line to separate the name and designation.',
        position: 'right'
    },
    {
        id: 'delete',
        targetId: 'tour-names-list',
        arrowSelector: '.delete-btn',
        title: 'Delete Name Plates',
        text: 'Remove any unwanted name plates using the trash icon on the card.',
        position: 'right'
    },
    {
        id: 'zoom',
        targetId: 'tour-names-list',
        arrowSelector: '.onboarding-zoom-btn',
        title: 'Adjust Zoom of Individual Name',
        text: 'Adjust the font size for specific long names using the + / - buttons on each card.',
        position: 'right'
    },
    {
        id: 'dimensions',
        targetId: 'tour-dimensions',
        title: 'Plate Dimensions',
        text: 'Adjust width and height here.',
        tip: 'Tip: Measure your actual physical name plate holder and set the exact same size here.',
        position: 'right'
    },
    {
        id: 'print',
        targetId: 'tour-print',
        title: 'Ready to Print',
        text: 'Click the Print button when you are ready.',
        tip: 'Tip: We recommend printing just ONE name plate first to test the alignment.',
        position: 'top'
    }
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
    const [arrowStyles, setArrowStyles] = useState<React.CSSProperties[]>([]);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            onStepChange(0);
        }
    }, [isOpen]);

    // Handle step change
    useEffect(() => {
        if (isOpen) {
            onStepChange(currentStep);
        }
    }, [currentStep, isOpen, onStepChange]);

    // Update spotlight position
    useEffect(() => {
        if (!isOpen) return;

        // Small delay to allow UI to update (tabs switching, etc)
        const timer = setTimeout(() => {
            const step = STEPS[currentStep];

            if (!step.targetId) {
                // Center position (Welcome step)
                setSpotlightStyle({ opacity: 0 });
                setArrowStyles([]);
                setPopoverStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '500px'
                });
                return;
            }

            const target = document.getElementById(step.targetId);
            if (target) {
                const rect = target.getBoundingClientRect();

                // Spotlight style
                setSpotlightStyle({
                    opacity: 1,
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
                    borderRadius: '8px'
                });

                // Calculate Hand Positions (Pointing UP at the element from below)
                if (step.arrowSelector) {
                    const arrowTargets = target.querySelectorAll(step.arrowSelector);
                    if (arrowTargets.length > 0) {
                        const styles: React.CSSProperties[] = [];

                        // Limit to first 2 to avoid clutter if many items match (e.g. list)
                        // Actually, for delete step (.delete-btn), we really only want to point to the FIRST one
                        // But for Zoom step (.onboarding-zoom-btn), we want BOTH buttons of the FIRST card.
                        // So logic: Find all matches inside the spotlight.
                        // Filter to only match elements inside the first "card" if possible?
                        // Simple heuristic: Take the first 2 matches if many.

                        // For Delete step, we only want 1.
                        // For Zoom step, we want 2.

                        const maxCount = step.id === 'zoom' ? 2 : 1;

                        Array.from(arrowTargets).slice(0, maxCount).forEach(t => {
                            const arrowRect = t.getBoundingClientRect();
                            styles.push({
                                display: 'block',
                                top: arrowRect.bottom + 2, // Position immediately below
                                left: arrowRect.left + (arrowRect.width / 2) - 18, // Center horizontally (36px width -> 18px offset)
                            });
                        });
                        setArrowStyles(styles);
                    } else {
                        setArrowStyles([]);
                    }
                } else {
                    setArrowStyles([]);
                }

                // Popover position calculation
                const PAD = 20;
                let popTop = rect.top;
                let popLeft = rect.right + PAD;

                if (step.position === 'top') {
                    popTop = rect.top - 200; // rough estimate
                    popLeft = rect.left;
                }

                // Basic clamping
                if (popTop < 20) popTop = 20;
                if (popLeft > window.innerWidth - 320) popLeft = window.innerWidth - 340;

                setPopoverStyle({
                    top: popTop,
                    left: popLeft,
                    transform: step.position === 'top' ? 'translateY(-100%)' : 'translateY(0)',
                    maxWidth: '300px'
                });
            } else {
                // Fallback
                setSpotlightStyle({ opacity: 0 });
                setArrowStyles([]);
                setPopoverStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                });
            }
        }, 100); // 100ms delay for tab switching

        return () => clearTimeout(timer);
    }, [isOpen, currentStep]);

    if (!isOpen) return null;

    const step = STEPS[currentStep];
    const isLast = currentStep === STEPS.length - 1;

    const handleNext = () => {
        if (isLast) onClose();
        else setCurrentStep(c => c + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    return (
        <div className="fixed inset-0 z-[60] overflow-hidden" aria-live="polite">

            {/* Target Spotlight Overlay */}
            <div
                className="absolute transition-all duration-300 ease-in-out pointer-events-none z-40"
                style={{
                    ...spotlightStyle,
                    position: 'absolute'
                }}
            />

            {/* Hands Pointer (Pointing UP) */}
            {step.arrowSelector && arrowStyles.map((style, idx) => (
                <div
                    key={idx}
                    className="fixed z-50 pointer-events-none animate-bounce"
                    style={style}
                >
                    {/* User Provided Hand Icon */}
                    <svg fill="none" height="36" width="36" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}>
                        <path clipRule="evenodd" d="m27 2c-4.4183 0-8 3.58172-8 8v20.5968l-1.9387-.517c-5.0788-1.3543-10.0613 2.4736-10.0613 7.7299v2.1903c0 .6687.3342 1.2932.8906 1.6641l10.9923 7.3282c.2277.1518.4647.2873.7091.4059-.3794.787-.592 1.6696-.592 2.6018v4c0 3.3137 2.6863 6 6 6h26c3.3137 0 6-2.6863 6-6v-4c0-1.5367-.5777-2.9385-1.5278-4 .9501-1.0615 1.5278-2.4633 1.5278-4v-12.9111c0-5.0575-3.776-9.3188-8.7967-9.9274l-13.2033-1.6004v-9.5611c0-4.41828-3.5817-8-8-8zm24 44c1.1046 0 2-.8954 2-2v-12.9111c0-3.0345-2.2656-5.5913-5.278-5.9564l-14.9627-1.8137c-1.0041-.1217-1.7593-.974-1.7593-1.9855v-11.3333c0-2.20914-1.7909-4-4-4s-4 1.79086-4 4v23.2c0 .6214-.2888 1.2074-.7815 1.586-.4928.3785-1.1334.5066-1.7338.3465l-4.454-1.1878c-2.5394-.6771-5.0307 1.2368-5.0307 3.865v1.1199l10.1017 6.7345c.3285.219.7146.3359 1.1094.3359zm-26 4c-1.1046 0-2 .8954-2 2v4c0 1.1046.8954 2 2 2h26c1.1046 0 2-.8954 2-2v-4c0-1.1046-.8954-2-2-2z" fill="#000" fillRule="evenodd" />
                        <g fill="#fa1228">
                            <path d="m53 44c0 1.1046-.8954 2-2 2h-28.7889c-.3948 0-.7809-.1169-1.1094-.3359l-10.1017-6.7345v-1.1199c0-2.6282 2.4913-4.5421 5.0307-3.865l4.454 1.1878c.6004.1601 1.241.032 1.7338-.3465.4927-.3786.7815-.9646.7815-1.586v-23.2c0-2.20914 1.7909-4 4-4s4 1.79086 4 4v11.3333c0 1.0115.7552 1.8638 1.7593 1.9855l14.9627 1.8137c3.0124.3651 5.278 2.9219 5.278 5.9564z" />
                            <path d="m23 52c0-1.1046.8954-2 2-2h26c1.1046 0 2 .8954 2 2v4c0 1.1046-.8954 2-2 2h-26c-1.1046 0-2-.8954-2-2z" />
                        </g>
                    </svg>
                </div>
            ))}

            {/* Background for "No Target" steps */}
            {
                !step.targetId && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 animate-fade-in" />
                )
            }

            {/* Popover Card */}
            <div
                className="fixed z-50 bg-white rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300"
                style={popoverStyle}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {step.title}
                        </h3>
                        {step.subtext && (
                            <p className="text-sm text-blue-600 font-medium mt-1">
                                {step.subtext}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                        title="Close Tour"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="text-gray-600 text-sm leading-relaxed">
                    {step.text}
                </div>

                {step.tip && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 font-medium italic">
                            {step.tip}
                        </p>
                    </div>
                )}

                {/* Footer / Controls */}
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                        >
                            {isLast ? 'Get Started' : 'Next'}
                            {!isLast && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default OnboardingModal;
