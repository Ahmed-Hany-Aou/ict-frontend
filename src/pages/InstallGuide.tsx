import React from 'react';
import { Link } from 'react-router-dom';

const InstallGuide: React.FC = () => {
  // Get the current website URL dynamically
  const websiteUrl = window.location.origin;
  
  // Custom QR code with your logo (using QRCode API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(websiteUrl)}&logo=${encodeURIComponent(`${websiteUrl}/logo192.png`)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Install Our Learning App
          </h1>
          <p className="text-lg text-gray-600">
            Get faster access and offline learning by installing our app on your device
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Android Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">📱</span>
              <h3 className="text-xl font-semibold text-gray-900">Android</h3>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Open Chrome browser on your Android device</li>
              <li>Tap the menu button (⋮) in the top right</li>
              <li>Select "Add to Home Screen"</li>
              <li>Confirm the installation when prompted</li>
            </ol>
          </div>

          {/* iOS Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">🍎</span>
              <h3 className="text-xl font-semibold text-gray-900">iPhone/iPad</h3>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>Open Safari browser on your iOS device</li>
              <li>Tap the share icon (□ with ↑ arrow)</li>
              <li>Scroll down and select "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Scan to Install
          </h3>
          <div className="flex justify-center mb-4">
            <img 
              src={qrCodeUrl}
              alt="QR Code to install app"
              className="border-2 border-gray-200 rounded-lg"
              onError={(e) => {
                // Fallback to simple QR code if logo fails
                e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(websiteUrl)}`;
              }}
            />
          </div>
          <p className="text-gray-600 mb-6">
            Open your camera app and scan this QR code to open the installation page on your mobile device
          </p>
          <p className="text-sm text-gray-500">
            Can't scan? Visit: <span className="font-mono text-blue-600">{websiteUrl}</span>
          </p>
        </div>

        {/* Quick Install Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // Try to trigger install prompt
              if ((window as any).deferredPrompt) {
                (window as any).deferredPrompt.prompt();
              } else {
                // Copy URL to clipboard as fallback
                navigator.clipboard.writeText(websiteUrl);
                alert('Website URL copied to clipboard! Share it with your mobile device.');
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📋 Copy Website URL
          </button>
        </div>

        {/* Navigation Back */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;