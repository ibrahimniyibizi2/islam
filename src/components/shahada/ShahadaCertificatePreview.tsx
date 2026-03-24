import { useState } from 'react';
import { downloadShahadaCertificate, ShahadaCertificateDownload } from './ShahadaCertificateGenerator';

// Shahada Certificate Preview Component
export const ShahadaCertificatePreview = () => {
  const [certificateData, setCertificateData] = useState({
    fullName: 'Ibrahim Niyibizi',
    formerName: 'Jean Pierre',
    dateOfBirth: '1990-05-15',
    nationality: 'Rwandan',
    idNumber: '1199071234567890',
    shahadaDate: '2024-03-17',
    location: 'Kigali Islamic Cultural Center',
    witnessName: 'Sheikh Muhammad Al-Hassan',
    witnessTitle: 'Senior Imam',
    certificateId: 'SHA-RWA-2024-001',
    issueDate: '2024-03-17',
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Shahada Certificate Preview</h2>
        
        {/* Certificate Preview Card */}
        <div className="border-2 border-green-800 rounded-lg p-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-800 rounded-full mb-4">
              <span className="text-white text-2xl">☪</span>
            </div>
            <h3 className="text-xl font-bold text-green-800">SHAHADA CERTIFICATE</h3>
            <p className="text-sm text-gray-600">Islamic Conversion Certificate</p>
            <p className="text-xs text-gray-500 mt-2">REPUBLIC OF RWANDA - MINISTRY OF ISLAMIC AFFAIRS</p>
          </div>

          {/* Arabic Section */}
          <div className="text-center mb-6 py-4 border-y border-green-200">
            <p className="text-lg font-bold text-green-800 mb-2">شهادة الشهادة</p>
            <p className="text-sm text-green-600">بسم الله الرحمن الرحيم</p>
          </div>

          {/* Personal Information */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-medium">Full Name:</span> <span className="text-green-700">{certificateData.fullName}</span></div>
              <div><span className="font-medium">Date of Birth:</span> <span className="text-green-700">{certificateData.dateOfBirth}</span></div>
              <div><span className="font-medium">Nationality:</span> <span className="text-green-700">{certificateData.nationality}</span></div>
              <div><span className="font-medium">ID Number:</span> <span className="text-green-700">{certificateData.idNumber}</span></div>
            </div>
          </div>

          {/* Declaration Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Declaration of Faith</h4>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <p className="text-gray-700 italic mb-4">"I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and Messenger."</p>
              <p className="text-lg font-bold text-green-800 mb-4">أشهد أن لا إله إلا الله وأشهد أن محمداً رسول الله</p>
            </div>
          </div>

          {/* Ceremony Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Ceremony Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Date:</span> 
                <span className="text-green-700">{certificateData.shahadaDate}</span>
              </div>
              <div>
                <span className="font-medium">Location:</span> 
                <span className="text-green-700">{certificateData.location}</span>
              </div>
              <div>
                <span className="font-medium">Witness:</span> 
                <span className="text-green-700">{certificateData.witnessName}</span>
              </div>
              <div>
                <span className="font-medium">Title:</span> 
                <span className="text-green-700">{certificateData.witnessTitle}</span>
              </div>
            </div>
          </div>

          {/* Certificate Info */}
          <div className="text-center text-sm text-gray-600">
            <p>Certificate ID: <span className="font-mono text-green-700">{certificateData.certificateId}</span></p>
            <p>Issue Date: <span className="font-mono text-green-700">{certificateData.issueDate}</span></p>
          </div>
        </div>

        {/* Editable Form */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customize Certificate</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={certificateData.fullName}
                onChange={(e) => setCertificateData({...certificateData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={certificateData.dateOfBirth}
                onChange={(e) => setCertificateData({...certificateData, dateOfBirth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <input
                type="text"
                value={certificateData.nationality}
                onChange={(e) => setCertificateData({...certificateData, nationality: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input
                type="text"
                value={certificateData.idNumber}
                onChange={(e) => setCertificateData({...certificateData, idNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shahada Date</label>
              <input
                type="date"
                value={certificateData.shahadaDate}
                onChange={(e) => setCertificateData({...certificateData, shahadaDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={certificateData.location}
                onChange={(e) => setCertificateData({...certificateData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Witness Name</label>
              <input
                type="text"
                value={certificateData.witnessName}
                onChange={(e) => setCertificateData({...certificateData, witnessName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Witness Title</label>
              <input
                type="text"
                value={certificateData.witnessTitle}
                onChange={(e) => setCertificateData({...certificateData, witnessTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Download Button */}
        <ShahadaCertificateDownload 
          certificateData={certificateData} 
          buttonText="Download Certificate" 
        />
      </div>
    </div>
  );
};
