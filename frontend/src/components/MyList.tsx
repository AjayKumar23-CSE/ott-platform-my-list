import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Heart } from 'lucide-react';
import { myListApi } from '../services/api';
import MyListItem from './MyListItem';
import { MyListItem as MyListItemType } from '../types';

interface MyListProps {
  userId: string;
}

const MyList: React.FC<MyListProps> = ({ userId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const itemsPerPage = 6;
  
  const queryClient = useQueryClient();

  // Fetch My List data
  const {
    data: myListData,
    isLoading,
    error,
    refetch
  } = useQuery(
    ['myList', userId, currentPage],
    () => myListApi.getMyList(userId, currentPage, itemsPerPage),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Remove from My List mutation
  const removeFromMyListMutation = useMutation(
    ({ contentId, contentType }: { contentId: string; contentType: 'movie' | 'tvshow' }) =>
      myListApi.removeFromMyList(userId, contentId, contentType),
    {
      onMutate: async ({ contentId }) => {
        setRemovingItems(prev => new Set(prev).add(contentId));
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['myList', userId]);
      },
      onError: (error) => {
        console.error('Failed to remove item:', error);
      },
      onSettled: (_, __, { contentId }) => {
        setRemovingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
      }
    }
  );

  const handleRemoveItem = (contentId: string, contentType: 'movie' | 'tvshow') => {
    removeFromMyListMutation.mutate({ contentId, contentType });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading your list...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load your list</h3>
        <p className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'Something went wrong'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!myListData || myListData.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Heart className="text-gray-300 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your list is empty</h3>
        <p className="text-gray-600 max-w-md">
          Start adding your favorite movies and TV shows to create your personalized watchlist.
        </p>
      </div>
    );
  }

  const { data: items, pagination } = myListData;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-pink-300" size={32} />
              <h2 className="text-3xl font-bold">My List</h2>
            </div>
            <p className="text-blue-100 text-lg">
              {pagination.total} {pagination.total === 1 ? 'favorite item' : 'favorite items'} in your collection
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">{pagination.total}</div>
                <div className="text-sm text-blue-200">Total Items</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item: MyListItemType) => (
          <MyListItem
            key={`${item.contentId}-${item.contentType}`}
            item={item}
            onRemove={handleRemoveItem}
            isRemoving={removingItems.has(item.contentId)}
          />
        ))}
      </div>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
              Showing page <span className="font-semibold text-blue-600">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    const distance = Math.abs(page - currentPage);
                    return distance === 0 || distance === 1 || page === 1 || page === pagination.totalPages;
                  })
                  .map((page, index, array) => {
                    const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 py-1 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyList;
