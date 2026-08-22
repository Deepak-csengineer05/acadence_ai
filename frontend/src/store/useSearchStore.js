import { create } from 'zustand';

export const useSearchStore = create((set) => ({
  searchQuery: '',
  selectedCategory: 'All',
  selectedCourse: 'All',
  selectedBranch: 'All',
  selectedYear: 'All',
  selectedSemester: 'All',
  selectedDifficulty: 'All',
  sortBy: 'date',
  searchResults: [],
  isLoading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setFilters: (filters) => set(filters),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsLoading: (isLoading) => set({ isLoading }),
  resetFilters: () => set({
    searchQuery: '',
    selectedCategory: 'All',
    selectedCourse: 'All',
    selectedBranch: 'All',
    selectedYear: 'All',
    selectedSemester: 'All',
    selectedDifficulty: 'All',
    sortBy: 'date'
  })
}));
