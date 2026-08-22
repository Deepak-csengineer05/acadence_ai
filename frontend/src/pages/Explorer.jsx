import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, SlidersHorizontal, FileText, User, BookOpen, Building2, Heart, Download, ArrowRight } from 'lucide-react';
import ClaySelect from '../components/ClaySelect';

const CATEGORY_ICONS = {
  'Subjects': <BookOpen size={14} />,
  'Technologies': <FileText size={14} />,
  'Companies': <Building2 size={14} />,
  'Professors': <User size={14} />,
  'Projects': <FileText size={14} />,
  'Interview Experiences': <Building2 size={14} />,
  'Research Papers': <FileText size={14} />,
  'Hackathons': <Search size={14} />,
  'Lab Records': <FileText size={14} />,
  'PYQs': <BookOpen size={14} />,
};

const CATEGORIES = ['Subjects', 'Technologies', 'Companies', 'Professors', 'Projects',
  'Interview Experiences', 'Research Papers', 'Hackathons', 'Lab Records', 'PYQs'];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <div className="skeleton skeleton-line" style={{ width: 70 }} />
        <div className="skeleton skeleton-line" style={{ width: 50, marginLeft: 'auto' }} />
      </div>
      <div className="skeleton skeleton-line lg" style={{ width: '85%' }} />
      <div className="skeleton skeleton-line" style={{ width: '60%' }} />
      <div className="skeleton skeleton-line sm" style={{ width: '40%' }} />
    </div>
  );
}

function Explorer({
  searchQuery, setSearchQuery,
  exploreBy, setExploreBy,
  sortOrder, setSortOrder,
  searchResults,
  advFilters, setAdvFilters,
  showAdvFilters, setShowAdvFilters,
  executeSearch,
  courses, categories,
  handleUpvote, API_BASE,
  isLoading = false
}) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: searchResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  return (
    <div className="explorer-container">
      {/* Search Hero */}
      <div className="explorer-search-hero">
        <div className="search-bar-container" style={{ marginBottom: 14 }}>
          <div style={{ position: 'relative', flexGrow: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="search-input"
              style={{ paddingLeft: 42 }}
              type="text"
              placeholder="Search notes, code repos, research papers, courses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && executeSearch()}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setShowAdvFilters(!showAdvFilters)}>
            <SlidersHorizontal size={15} />
            Filters
          </button>
          <button className="btn btn-primary" onClick={executeSearch}>
            <Search size={15} /> Search
          </button>
        </div>

        {/* Category Chips */}
        <div className="chips-grid">
          {CATEGORIES.map(item => (
            <div
              key={item}
              className={`chip ${exploreBy === item ? 'active' : ''}`}
              onClick={() => {
                setExploreBy(exploreBy === item ? '' : item);
                setTimeout(executeSearch, 100);
              }}
            >
              {CATEGORY_ICONS[item]}
              {item}
            </div>
          ))}
        </div>

        {/* Advanced Filters */}
        {showAdvFilters && (
          <div className="filters-panel">
            <div className="filter-item">
              <label>Department</label>
              <input className="form-input" type="text" placeholder="CSE, ECE"
                value={advFilters.department} onChange={e => setAdvFilters({ ...advFilters, department: e.target.value })} />
            </div>
            <div className="filter-item">
              <label>Year</label>
              <ClaySelect
                value={advFilters.year}
                onChange={val => setAdvFilters({ ...advFilters, year: val })}
                placeholder="All Years"
                options={[
                  { value: '', label: 'All Years' },
                  { value: 'I', label: 'I Year' },
                  { value: 'II', label: 'II Year' },
                  { value: 'III', label: 'III Year' },
                  { value: 'IV', label: 'IV Year' },
                ]}
              />
            </div>
            <div className="filter-item">
              <label>Semester</label>
              <input className="form-input" type="text" placeholder="3, 5, 8"
                value={advFilters.semester} onChange={e => setAdvFilters({ ...advFilters, semester: e.target.value })} />
            </div>
            <div className="filter-item">
              <label>Branch</label>
              <input className="form-input" type="text" placeholder="IoT, AI/ML"
                value={advFilters.branch} onChange={e => setAdvFilters({ ...advFilters, branch: e.target.value })} />
            </div>
            <div className="filter-item">
              <label>Difficulty</label>
              <ClaySelect
                value={advFilters.difficulty}
                onChange={val => setAdvFilters({ ...advFilters, difficulty: val })}
                placeholder="All Levels"
                options={[
                  { value: '', label: 'All Levels' },
                  { value: 'Easy', label: 'Easy' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Hard', label: 'Hard' },
                ]}
              />
            </div>
            <div className="filter-item">
              <label>Sort By</label>
              <ClaySelect
                value={sortOrder}
                onChange={val => { setSortOrder(val); setTimeout(executeSearch, 100); }}
                options={[
                  { value: 'date', label: 'Upload Date' },
                  { value: 'upvotes', label: 'Most Upvoted' },
                  { value: 'views', label: 'Most Viewed' },
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {searchResults.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 2px' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Sorted by {sortOrder === 'date' ? 'upload date' : sortOrder}
          </span>
        </div>
      )}

      {/* Results Grid / Virtualized List */}
      {isLoading ? (
        <div className="grid-3">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : searchResults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Search size={24} /></div>
          <p className="empty-state-title">No resources found</p>
          <p className="empty-state-desc">Try different search terms, change the category chip, or clear your filters.</p>
        </div>
      ) : (
        <div className="grid-3">
          {searchResults.map(res => (
            <div key={res.id || res.document_id} className="document-card">
              <div>
                <div className="doc-header">
                  <span className={`doc-badge ${res.type === 'interview' ? 'interview' : res.is_project ? 'project' : 'notes'}`}>
                    <FileText size={10} />
                    {res.category_name || res.type || 'Document'}
                  </span>
                  {res.relevance_score && (
                    <span className="doc-relevance">{res.relevance_score}% match</span>
                  )}
                </div>
                <h4 className="doc-title" style={{ marginTop: 10 }}>{res.title}</h4>
                <div className="doc-meta" style={{ marginTop: 6 }}>
                  {res.uploader_name && (
                    <span className="doc-meta-item">
                      <User size={11} /> {res.uploader_name}
                    </span>
                  )}
                  {res.course_code && (
                    <span className="doc-meta-item">
                      <BookOpen size={11} /> {res.course_code}
                    </span>
                  )}
                  {res.company_name && (
                    <span className="doc-meta-item">
                      <Building2 size={11} /> {res.company_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="doc-footer">
                <div
                  className="doc-votes"
                  onClick={e => { e.stopPropagation(); handleUpvote(res.type || 'document', res.id); }}
                >
                  <Heart size={13} />
                  {res.upvotes ?? 0}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    fetch(`${API_BASE}/documents/view/${res.id}`, { method: 'POST' });
                    alert(`Viewing reference: ${res.title}`);
                  }}
                >
                  <Download size={13} /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Explorer;
