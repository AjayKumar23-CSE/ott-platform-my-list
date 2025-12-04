import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Check, ChevronLeft, ChevronRight, Heart, Film, Tv } from 'lucide-react';
import { apiClient } from '../services/api';
import { Movie, TVShow, PaginatedResponse } from '../types';

interface ContentItem extends Movie, TVShow {
  contentType: 'movie' | 'tvshow';
}

interface BrowseContentProps {
  userId: string;
  userMyList?: Set<string>; // Set of content IDs already in user's list
}

const BrowseContent: React.FC<BrowseContentProps> = ({ userId, userMyList = new Set() }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch all content (movies + TV shows)
  const { data: contentData, isLoading, error } = useQuery<PaginatedResponse<ContentItem>>(
    ['content', currentPage],
    () => apiClient.get(`/content?page=${currentPage}&limit=12`).then(res => res.data.data),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Add to My List mutation
  const addToListMutation = useMutation(
    ({ contentId, contentType }: { contentId: string; contentType: 'movie' | 'tvshow' }) =>
      apiClient.post(`/my-list/${userId}/add`, { contentId, contentType }),
    {
      onMutate: ({ contentId }) => {
        setAddingItems(prev => new Set(prev).add(contentId));
      },
      onSuccess: () => {
        // Invalidate My List queries to refresh the data
        queryClient.invalidateQueries(['myList', userId]);
        queryClient.invalidateQueries(['content']);
      },
      onError: (error: any) => {
        console.error('Failed to add to My List:', error);
        
        // Handle different error types
        if (error?.response?.status === 409) {
          // Item already exists - this is expected behavior, don't show as error
          console.log('Item already in My List');
        } else if (error?.response?.status === 404) {
          console.error('Content not found');
        } else {
          console.error('Failed to add item to My List');
        }
      },
      onSettled: (data, error, variables) => {
        setAddingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(variables.contentId);
          return newSet;
        });
      }
    }
  );

  // Remove from My List mutation
  const removeFromListMutation = useMutation(
    ({ contentId, contentType }: { contentId: string; contentType: 'movie' | 'tvshow' }) =>
      apiClient.delete(`/my-list/${userId}/remove`, { data: { contentId, contentType } }),
    {
      onMutate: ({ contentId }) => {
        setAddingItems(prev => new Set(prev).add(contentId));
      },
      onSuccess: () => {
        // Invalidate My List queries to refresh the data
        queryClient.invalidateQueries(['myList', userId]);
        queryClient.invalidateQueries(['content']);
      },
      onError: (error: any) => {
        console.error('Failed to remove from My List:', error);
        
        // Handle different error types
        if (error?.response?.status === 404) {
          console.log('Item not found in My List - might already be removed');
          // Refresh the My List data to sync state
          queryClient.invalidateQueries(['myList', userId]);
        } else if (error?.response?.status === 400) {
          console.error('Invalid request data');
        } else {
          console.error('Failed to remove item from My List');
        }
      },
      onSettled: (data, error, variables) => {
        setAddingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(variables.contentId);
          return newSet;
        });
      }
    }
  );

  const handleAddToList = (contentId: string, contentType: 'movie' | 'tvshow') => {
    addToListMutation.mutate({ contentId, contentType });
  };

  const handleRemoveFromList = (contentId: string, contentType: 'movie' | 'tvshow') => {
    console.log('Removing from list:', { contentId, contentType, userId });
    removeFromListMutation.mutate({ contentId, contentType });
  };

  const handleToggleMyList = (contentId: string, contentType: 'movie' | 'tvshow', isInMyList: boolean) => {
    if (isInMyList) {
      handleRemoveFromList(contentId, contentType);
    } else {
      handleAddToList(contentId, contentType);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Film className="text-yellow-300" size={32} />
            <h2 className="text-3xl font-bold">Browse Content</h2>
          </div>
          <p className="text-green-100 text-lg">Loading amazing content for you...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Film size={64} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load content</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!contentData?.data.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Film size={64} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No content available</h3>
        <p className="text-gray-600">Check back later for new movies and TV shows.</p>
      </div>
    );
  }

  const { data: items, pagination } = contentData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Film className="text-yellow-300" size={32} />
              <h2 className="text-3xl font-bold">Browse Content</h2>
            </div>
            <p className="text-green-100 text-lg">
              Discover {pagination.total} amazing movies and TV shows
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">{pagination.total}</div>
                <div className="text-sm text-green-200">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {items.map((item: ContentItem) => {
          const isInMyList = userMyList.has(item.id);
          const isAdding = addingItems.has(item.id);
          
          return (
            <div key={item.id} className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Poster Image */}
              <div className="relative h-48 overflow-hidden">
                {item.posterUrl ? (
                  <img 
                    src={item.posterUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    item.contentType === 'movie' 
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                      : 'bg-gradient-to-br from-green-400 to-green-600'
                  }`}>
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">
                        {item.contentType === 'movie' ? '🎬' : '📺'}
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                    item.contentType === 'movie' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  }`}>
                    {item.contentType === 'movie' ? '🎬 Movie' : '📺 TV Show'}
                  </span>
                </div>
                
                {/* Heart Toggle Button */}
                <div className="absolute top-4 left-4">
                  <button
                    onClick={() => handleToggleMyList(item.id, item.contentType, isInMyList)}
                    disabled={isAdding}
                    className={`p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                      isAdding ? 'animate-pulse' : ''
                    } ${
                      isInMyList 
                        ? 'bg-white/90 backdrop-blur-sm' 
                        : 'bg-black/50 backdrop-blur-sm hover:bg-black/70'
                    }`}
                    title={isInMyList ? 'Remove from My List' : 'Add to My List'}
                  >
                    {isAdding ? (
                      <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <Heart 
                        size={20} 
                        className={`transition-all duration-200 ${
                          isInMyList 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-white hover:text-red-400'
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="relative p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border hover:scale-105 transition-transform"
                    >
                      {genre}
                    </span>
                  ))}
                  {item.genres.length > 3 && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      +{item.genres.length - 3} more
                    </span>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4 bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                      {item.contentType === 'movie' ? (
                        <>
                          <Film size={16} className="text-blue-500" />
                          <span className="font-medium">{(item as Movie).director}</span>
                        </>
                      ) : (
                        <>
                          <Tv size={16} className="text-green-500" />
                          <span className="font-medium">{(item as TVShow).episodes?.length || 0} episodes</span>
                        </>
                      )}
                    </div>
                    
                    {isInMyList && (
                      <div className="flex items-center justify-center bg-green-100 text-green-700 w-8 h-8 rounded-full shadow-sm">
                        <Heart size={16} className="fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
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
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm ${
                        page === currentPage
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {page}
                    </button>
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

export default BrowseContent;
