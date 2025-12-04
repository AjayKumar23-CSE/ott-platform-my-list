import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import { Heart, User, Film, List, Plus, LogOut } from 'lucide-react';
import MyList from './components/MyList';
import BrowseContent from './components/BrowseContent';
import Login from './components/Login';
import { apiClient } from './services/api';
import { authService } from './services/authService';
import { AuthUser } from './types';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Main App component with authentication
const MainApp: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'mylist'>('browse');

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = authService.getUser();
      const isAuth = authService.isAuthenticated();
      
      if (storedUser && isAuth) {
        // Verify token is still valid
        const isValid = await authService.verifyToken();
        if (isValid) {
          setUser(storedUser);
        } else {
          authService.logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: AuthUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActiveTab('browse');
  };

  // Fetch user's My List to know which items are already added (always call hooks first)
  const { data: myListData } = useQuery(
    ['myList', user?.id],
    () => user ? apiClient.get(`/my-list/${user.id}?page=1&limit=1000`).then(res => res.data.data) : null,
    {
      enabled: !!user, // Only run query when user exists
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const userMyListIds = new Set<string>(myListData?.data?.map((item: any) => item.contentId as string) || []);

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl shadow-lg">
                  <Heart className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    OTT Platform
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">My List Feature</p>
                </div>
              </div>
              
              {/* User Info and Logout */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white rounded-xl shadow-md border border-gray-200 px-4 py-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">{user.name}</p>
                    <p className="text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-medium transition-all ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Film size={20} />
                Browse Content
              </button>
              <button
                onClick={() => setActiveTab('mylist')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 font-medium transition-all relative ${
                  activeTab === 'mylist'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <List size={20} />
                My List
                {myListData?.pagination?.total > 0 && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeTab === 'mylist' ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {myListData.pagination.total}
                  </span>
                )}
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activeTab === 'browse' ? (
                <BrowseContent userId={user.id} userMyList={userMyListIds} />
              ) : (
                <MyList userId={user.id} />
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}

export default App;
