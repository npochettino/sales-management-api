import Link from "next/link"
import { ArrowRight, BarChart3, Clock, DollarSign, ShieldCheck, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">SalesManager</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Log in
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Streamline Your Sales Operations</h1>
              <p className="text-xl mb-8 text-blue-100">
                A complete solution for managing inventory, clients, and sales in one place. Boost efficiency and grow
                your business with real-time insights.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/login"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-md text-base font-medium inline-flex items-center justify-center"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-blue-500 text-white hover:bg-blue-400 px-6 py-3 rounded-md text-base font-medium inline-flex items-center justify-center"
                >
                  View Demo
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-md flex items-center justify-center">
                  <BarChart3 className="h-32 w-32 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Manage Your Business</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to track inventory, manage clients, and process
              sales efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory Management</h3>
              <p className="text-gray-600">
                Track stock levels, set alerts for low inventory, and manage product information all in one place.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Management</h3>
              <p className="text-gray-600">
                Store client information, track purchase history, and build stronger customer relationships.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sales Processing</h3>
              <p className="text-gray-600">
                Create and manage sales, process multiple payment methods, and generate invoices instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reporting</h3>
              <p className="text-gray-600">
                Gain insights into your business with detailed reports on sales, inventory, and customer behavior.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant updates on inventory levels, sales status, and business performance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security and regular backups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to get started?</span>
                  <span className="block text-blue-200">Start your free trial today.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-100">
                  No credit card required. Get full access to all features for 14 days.
                </p>
              </div>
              <div className="mt-8 flex lg:mt-0 lg:ml-8">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                  >
                    Get started
                  </Link>
                </div>
                <div className="ml-3 inline-flex rounded-md shadow">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <span className="text-xl font-bold text-blue-600">SalesManager</span>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-500">
                &copy; {new Date().getFullYear()} SalesManager. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
