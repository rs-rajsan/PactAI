import React, { useState, useCallback } from 'react';
import { EnhancedSearchInterface, EnhancedSearchParams } from '../components/search/EnhancedSearchInterface';
import { EnhancedSearchResults } from '../components/results/EnhancedSearchResults';
import { enhancedSearchApi, EnhancedSearchResponse } from '../services/enhancedSearchApi';

interface SearchState {
  results: EnhancedSearchResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const SearchPage: React.FC = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    results: null,
    isLoading: false,
    error: null
  });

  const handleSearch = useCallback(async (searchParams: EnhancedSearchParams) => {
    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const results = await enhancedSearchApi.searchContracts(searchParams);
      setSearchState({ results, isLoading: false, error: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setSearchState({ results: null, isLoading: false, error: errorMessage });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Enhanced Contract Search</h1>
        <p className="text-lg text-slate-600">
          Multi-level semantic search across documents, sections, clauses, and relationships
        </p>
      </div>

      {/* Search Interface */}
      <EnhancedSearchInterface 
        onSearch={handleSearch}
        isLoading={searchState.isLoading}
      />

      {/* Error Display */}
      {searchState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-red-700">Error: {searchState.error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchState.results && (
        <EnhancedSearchResults results={searchState.results} />
      )}
    </div>
  );
};