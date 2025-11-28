import React, { useState } from 'react';
import { MessageSquare, X, Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

type IssueType = 'bug' | 'feature' | 'other';

const FeedbackWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [issueType, setIssueType] = useState<IssueType>('bug');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage('');

        try {
            await api.post('/support/feedback/', {
                issue_type: issueType,
                description: description
            });
            setSubmitStatus('success');
            setDescription('');
            setTimeout(() => {
                setIsOpen(false);
                setSubmitStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Feedback submission failed:', error);
            setSubmitStatus('error');
            setErrorMessage('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary hover:bg-primary-hover text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center group"
                    aria-label="Send Feedback"
                >
                    <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}

            {/* Feedback Form Modal */}
            {isOpen && (
                <div className="bg-white rounded-xl shadow-2xl w-80 sm:w-96 overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center justify-between text-white">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Send Feedback
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        {submitStatus === 'success' ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h4 className="font-medium text-slate-800">Thank You!</h4>
                                <p className="text-sm text-slate-500 mt-1">Your feedback has been submitted successfully.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {submitStatus === 'error' && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <p>{errorMessage}</p>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="issueType" className="block text-sm font-medium text-slate-700 mb-1">
                                        Feedback Type
                                    </label>
                                    <select
                                        id="issueType"
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value as IssueType)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50"
                                    >
                                        <option value="bug">Report a Bug</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Please describe the issue or idea..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !description.trim()}
                                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackWidget;
