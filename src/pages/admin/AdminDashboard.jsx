
import { Users, Film, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

function AdminDashboard() {


  const stats = [
    { icon: Users, label: 'Total Users', value: '1,234' },
    { icon: Film, label: 'Total Movies', value: '456' },
    { icon: TrendingUp, label: 'Platform Revenue', value: '$12,450' },
    { icon: AlertCircle, label: 'Pending Approval', value: '12' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform management and analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-6"
            >
              <stat.icon className="w-8 h-8 text-blue-400 mb-3" />
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-700">
          {['overview', 'pending', 'users', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition-all capitalize ${
                activeTab === tab
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending Movie Approvals</h2>
            <div className="space-y-3">
              {pendingMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-800 transition-all"
                >
                  <div>
                    <p className="font-semibold">{movie.title}</p>
                    <p className="text-gray-400 text-sm">by {movie.filmmaker}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-all">
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-all">
                      <AlertCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">Welcome to the Admin Dashboard. Use the tabs above to manage the platform.</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">User Management</h3>
            <p className="text-gray-400">User management interface would go here.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-8">
            <h3 className="text-xl font-bold mb-4">Platform Analytics</h3>
            <p className="text-gray-400">Analytics dashboard would go here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;