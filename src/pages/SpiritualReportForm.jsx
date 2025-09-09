// src/pages/SpiritualReportForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SpiritualReportForm() {
    const [formData, setFormData] = useState({
        participantName: "",
        decisionForChrist: false,
        holyGhostBaptism: false,
        receiveCounseling: false,
        counselingDetails: "",
        eventDate: new Date().toISOString().split('T')[0]
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await addDoc(collection(db, "spiritualReports"), {
                ...formData,
                reportType: "spiritual", // Add a type for easier filtering in the dashboard
                createdAt: serverTimestamp()
            });

            setSuccess({
                participantName: formData.participantName,
                decisionForChrist: formData.decisionForChrist,
                holyGhostBaptism: formData.holyGhostBaptism,
                receiveCounseling: formData.receiveCounseling,
            });

            // Reset form
            setFormData({
                participantName: "",
                decisionForChrist: false,
                holyGhostBaptism: false,
                receiveCounseling: false,
                counselingDetails: "",
                eventDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Error submitting spiritual report:", error);
            alert("There was an error submitting the form. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="text-center mb-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl">
                    <h1 className="text-3xl font-bold mb-2">Spiritual Report Form</h1>
                    <p className="text-xl opacity-90">Record decisions for Christ, Holy Ghost baptism, and counseling</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Participant Information */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Participant Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Participant Name *
                            </label>
                            <input
                                type="text"
                                name="participantName"
                                value={formData.participantName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                required
                                placeholder="Enter participant's full name"
                            />
                        </div>
                    </div>

                    {/* Spiritual Decisions */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Spiritual Decisions</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="decisionForChrist"
                                    name="decisionForChrist"
                                    checked={formData.decisionForChrist}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="decisionForChrist" className="ml-2 block text-sm text-gray-900">
                                    Made decision for Christ
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="holyGhostBaptism"
                                    name="holyGhostBaptism"
                                    checked={formData.holyGhostBaptism}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="holyGhostBaptism" className="ml-2 block text-sm text-gray-900">
                                    Received Holy Ghost Baptism
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Counseling */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Counseling</h3>
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="receiveCounseling"
                                name="receiveCounseling"
                                checked={formData.receiveCounseling}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="receiveCounseling" className="ml-2 block text-sm text-gray-900">
                                Received counseling
                            </label>
                        </div>

                        {formData.receiveCounseling && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Counseling Details
                                </label>
                                <textarea
                                    name="counselingDetails"
                                    value={formData.counselingDetails}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="Describe the counseling session and any follow-up needed"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date *
                        </label>
                        <input
                            type="date"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            {success && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full animate-pop-in border-t-4 border-green-500">
                        <div className="mb-4">
                            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-green-100">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted!</h3>
                        <p className="mt-3 text-gray-600">
                            Spiritual report for <strong className="text-gray-800">{success.participantName}</strong> has been recorded.
                        </p>
                        {success.decisionForChrist && (<div className="my-2 p-2 bg-green-100 rounded-lg"><span className="text-green-700 font-medium">✓ Decision for Christ</span></div>)}
                        {success.holyGhostBaptism && (<div className="my-2 p-2 bg-blue-100 rounded-lg"><span className="text-blue-700 font-medium">✓ Holy Ghost Baptism</span></div>)}
                        {success.receiveCounseling && (<div className="my-2 p-2 bg-purple-100 rounded-lg"><span className="text-purple-700 font-medium">✓ Counseling Session</span></div>)}
                        <button onClick={() => setSuccess(null)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Continue</button>
                    </div>
                </div>
            )}
        </div>
    );
}