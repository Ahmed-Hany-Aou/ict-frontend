import React from 'react';
import Sidebar from '../components/Sidebar';
import { Mail, MessageSquare, Send, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  const email = 'hanyedu.ict@gmail.com';
  const subject = 'ICT Platform - Contact Request';
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
            <p className="text-gray-600 mt-1">Get in touch with us for any questions or support</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Get In Touch</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href={mailtoLink}
                      className="text-blue-600 hover:text-blue-700 hover:underline break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Support Hours</h3>
                  <p className="text-gray-600 text-sm">
                    We typically respond within 24-48 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Action Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 md:p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Send className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-bold">Send Us an Email</h2>
              </div>

              <p className="text-blue-50 mb-6">
                Have a question, feedback, or need support? Click the button below to send us an email directly from your email client.
              </p>

              <a
                href={mailtoLink}
                className="block w-full bg-white text-blue-600 font-bold py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg"
              >
                <Mail size={20} />
                <span>Open Email Client</span>
              </a>

              <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-blue-50">
                  <strong>Tip:</strong> Include as much detail as possible in your email to help us assist you better!
                </p>
              </div>
            </div>
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Technical Support</h3>
                <p className="text-sm text-gray-600">
                  Issues with accessing content, login problems, or technical errors
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Premium Membership</h3>
                <p className="text-sm text-gray-600">
                  Questions about premium features, payments, or subscription
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Course Content</h3>
                <p className="text-sm text-gray-600">
                  Questions about chapters, quizzes, or learning materials
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">General Inquiries</h3>
                <p className="text-sm text-gray-600">
                  Feedback, suggestions, or any other questions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
