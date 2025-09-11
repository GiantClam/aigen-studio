import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Gemini Image Editor',
  description: 'Privacy Policy for Gemini Image Editor - How we collect, use, and protect your information',
  keywords: 'privacy policy, data protection, image editor, AI, Gemini',
  openGraph: {
    title: 'Privacy Policy | Gemini Image Editor',
    description: 'Privacy Policy for Gemini Image Editor - How we collect, use, and protect your information',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">
                We may collect personal information that you voluntarily provide to us, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Email address (when you contact us)</li>
                <li>Usage data and preferences</li>
                <li>Feedback and communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Image Data</h3>
              <p className="text-gray-700 mb-4">
                When you use our image editing services, we may temporarily process:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Images you upload for editing</li>
                <li>Generated images and prompts</li>
                <li>Template usage data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Technical Information</h3>
              <p className="text-gray-700 mb-4">
                We automatically collect certain technical information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Usage patterns and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the collected information to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide and improve our image editing services</li>
                <li>Process your images using AI models</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Ensure security and prevent abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. AI Model Processing</h2>
              <p className="text-gray-700 mb-4">
                Our service uses Google&apos;s Gemini AI models for image processing. When you upload images or use our AI features:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Images are processed by Google&apos;s AI models</li>
                <li>Processing is subject to Google&apos;s privacy policies</li>
                <li>Images are not permanently stored by us</li>
                <li>Generated content may be subject to Google&apos;s terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Data Retention</h3>
              <p className="text-gray-700 mb-4">
                We retain your information only as long as necessary to provide our services and comply with legal obligations. Image data is typically processed and deleted within 24 hours.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Security Measures</h3>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encryption in transit and at rest</li>
                <li>Secure data transmission protocols</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>With service providers who assist in our operations</li>
                <li>To protect our rights and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Remember your preferences</li>
                <li>Analyze website traffic and usage</li>
                <li>Improve user experience</li>
                <li>Ensure security</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Access to your personal data</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your data</li>
                <li>Data portability</li>
                <li>Objection to processing</li>
                <li>Withdrawal of consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                Our service integrates with third-party services, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Google Gemini AI models</li>
                <li>Supabase for data storage</li>
                <li>Vercel for hosting</li>
              </ul>
              <p className="text-gray-700 mb-4">
                These services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> contact@gemini-image-edit.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
