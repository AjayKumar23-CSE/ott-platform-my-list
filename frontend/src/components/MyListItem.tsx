import React from 'react';
import { Trash2, Calendar, User, Star, Heart } from 'lucide-react';
import { MyListItem as MyListItemType, Movie, TVShow } from '../types';

interface MyListItemProps {
  item: MyListItemType;
  onRemove: (contentId: string, contentType: 'movie' | 'tvshow') => void;
  isRemoving?: boolean;
}

const MyListItem: React.FC<MyListItemProps> = ({ item, onRemove, isRemoving }) => {
  const { content, contentType, addedAt } = item;
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGenreColors = (genre: string) => {
    const colors: Record<string, string> = {
      Action: 'bg-red-100 text-red-800',
      Comedy: 'bg-yellow-100 text-yellow-800',
      Drama: 'bg-blue-100 text-blue-800',
      Fantasy: 'bg-purple-100 text-purple-800',
      Horror: 'bg-gray-100 text-gray-800',
      Romance: 'bg-pink-100 text-pink-800',
      SciFi: 'bg-green-100 text-green-800',
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  const handleRemove = () => {
    onRemove(item.contentId, item.contentType);
  };

  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Poster Image */}
      <div className="relative h-48 overflow-hidden">
        {content.posterUrl ? (
          <img 
            src={content.posterUrl} 
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            contentType === 'movie' 
              ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
              : 'bg-gradient-to-br from-green-400 to-green-600'
          }`}>
            <div className="text-center text-white">
              <div className="text-4xl mb-2">
                {contentType === 'movie' ? '🎬' : '📺'}
              </div>
              <div className="text-sm font-medium opacity-80">
                {contentType === 'movie' ? 'Movie' : 'TV Show'}
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        {/* Heart Remove Button - Top Left */}
        <div className="absolute top-4 left-4">
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white"
            title="Remove from My List"
          >
            {isRemoving ? (
              <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
            ) : (
              <Heart size={18} className="fill-red-500 text-red-500" />
            )}
          </button>
        </div>
        
        {/* Content Type Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
            contentType === 'movie' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
          }`}>
            {contentType === 'movie' ? '🎬 Movie' : '📺 TV Show'}
          </span>
        </div>
      </div>
      
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{content.title}</h3>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{content.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {content.genres.map((genre) => (
                <span
                  key={genre}
                  className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm border ${getGenreColors(genre)} hover:scale-105 transition-transform`}
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                <User size={16} className="text-blue-500" />
                <span className="font-medium">
                  {contentType === 'movie' 
                    ? (content as Movie).director 
                    : `${(content as TVShow).episodes?.length || 0} episodes`
                  }
                </span>
              </div>
              
              {contentType === 'movie' && (
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                  <Calendar size={16} className="text-green-500" />
                  <span className="font-medium">{formatDate((content as Movie).releaseDate)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
              <Star size={14} className="text-yellow-500" />
              <span className="font-medium">Added {formatDate(addedAt)}</span>
            </div>
          </div>
          
          {contentType === 'movie' && (
            <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900">Cast:</span> 
              <span className="ml-2">{(content as Movie).actors.slice(0, 3).join(', ')}</span>
              {(content as Movie).actors.length > 3 && <span className="text-blue-500 font-medium">...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyListItem;
