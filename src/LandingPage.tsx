import LoginForm from "./LoginForm";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="pt-2 pb-22">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative bg-cover bg-center rounded-2xl overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.9)), url('https://readdy.ai/api/search-image?query=modern%20office%20workspace%20with%20professionals%20collaborating%20on%20digital%20workflow%20management%20systems%2C%20clean%20bright%20environment%20with%20computers%20showing%20task%20boards%20and%20project%20management%20interfaces%2C%20professional%20business%20setting%20with%20teamwork%20and%20productivity%20focus&width=1200&height=600&seq=hero1&orientation=landscape')`,
              minHeight: "600px",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/80"></div>
            <div className="relative z-10 py-12 px-4 sm:py-24 sm:px-8 lg:px-16">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    EduXora
                  </h1>
                  <h1 className="text-xl sm:text-2xl lg:text-2xl text-white mb-4 sm:mb-6 leading-tight">
                    Streamline Workflow Management
                  </h1>
                  <p className="text-base sm:text-lg text-blue-100 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                    Powerful process management, automated workflows, approval
                    processes, and seamless team collaboration.
                  </p>

                  {/* {!user?.institution && isRole("Admin") && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => {}}
                        className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center whitespace-nowrap cursor-pointer"
                      >
                        Set up institution
                        <i className="ri-arrow-right-line ml-2"></i>
                      </button>
                    </div>
                  )} */}
                </div>

                <LoginForm />
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <i className="ri-workflow-line text-green-600 text-lg sm:text-xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Automated Workflows
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Create custom workflows with approval stages, automated
                notifications, and seamless task progression through your
                processes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <i className="ri-form-line text-purple-600 text-lg sm:text-xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Dynamic Forms
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Built-in form generator to create custom forms for any task,
                with easy attachment and submission tracking capabilities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <i className="ri-team-line text-orange-600 text-lg sm:text-xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Team Collaboration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Enhanced collaboration with comments, mentions, file sharing,
                and real-time updates to keep everyone in sync.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <i className="ri-user-settings-line text-red-600 text-lg sm:text-xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Employee Portal
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Dedicated employee portal for task management, workflow
                initiation, and seamless interaction with assigned work.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <i className="ri-check-double-line text-indigo-600 text-lg sm:text-xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
                Approval Process
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Multi-stage approval workflows with customizable approval
                chains, comments, and decision tracking for complete
                accountability.
              </p>
            </div>
          </div>

          <div className="mt-10 sm:mt-20 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-8 sm:p-12 lg:p-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Ready to Transform Your Workflow?
                </h2>
                <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                  Join thousands of teams who have streamlined their processes
                  with our comprehensive workflow management solution.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 sm:w-6 h-5 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-green-600 text-xs sm:text-sm"></i>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      Unlimited tasks and workflows
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 sm:w-6 h-5 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-green-600 text-xs sm:text-sm"></i>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      Advanced reporting and analytics
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-5 sm:w-6 h-5 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-green-600 text-xs sm:text-sm"></i>
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">
                      24/7 customer support
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="bg-cover bg-center min-h-[300px] sm:min-h-[400px] lg:min-h-full"
                style={{
                  backgroundImage: `url('https://readdy.ai/api/search-image?query=business%20professionals%20using%20modern%20workflow%20management%20software%20on%20computers%20and%20tablets%2C%20clean%20office%20environment%20with%20task%20boards%20and%20collaboration%20tools%20visible%20on%20screens%2C%20productive%20team%20working%20together&width=800&height=600&seq=cta1&orientation=landscape')`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
