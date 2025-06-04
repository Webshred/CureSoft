import React from 'react';
import PageLayout from '../components/layout/PageLayout';

const HelpPage = () => {
  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Help</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">RWS Help Center</h2>
          <p className="mb-4">
            Welcome to the RWS Help Center. This video will help you how to use our application effectively.
          </p>

          {/* Embed YouTube Video */}
          <div className="mb-6">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/PejQbGZraqg?si=bMZ-fB0d0twqnk1b"
              title="KRSNA - No Cap (Official Video)"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg shadow-md"
            ></iframe>
          </div>

          <div className="space-y-6">
           

            <div>
              <h3 className="text-lg font-medium mb-2">Need more help?</h3>
              <p className="text-gray-600">
                If you have any questions or encounter any problems, please do not hesitate to contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HelpPage;
