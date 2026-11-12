import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

export default function SearchFilter({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  sortBy,
  onSortByChange,
  departments = [],
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="filter-card">
      <div className="filter-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email, role, city..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Department Filter */}
          <select
            className="select-control"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="select-control"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Sort By */}
          <select
            className="select-control"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="id-desc">Newest First</option>
            <option value="id-asc">Oldest First</option>
            <option value="first_name-asc">Name (A-Z)</option>
            <option value="first_name-desc">Name (Z-A)</option>
            <option value="email-asc">Email (A-Z)</option>
            <option value="department-asc">Department</option>
          </select>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Grid Card View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
