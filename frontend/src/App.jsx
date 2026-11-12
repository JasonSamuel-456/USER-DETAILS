import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCard from './components/StatsCard';
import SearchFilter from './components/SearchFilter';
import UserList from './components/UserList';
import Pagination from './components/Pagination';
import UserDetailModal from './components/UserDetailModal';
import UserFormModal from './components/UserFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ConnectionBanner from './components/ConnectionBanner';
import { usersApi } from './api/usersApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Current Active User (Profile Owner)
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem('current_user_id');
    return saved ? Number(saved) : null;
  });

  // State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReseeding, setIsReseeding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('id-desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modals
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Resolve current active user object
  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;

  // Sync current user selection
  const handleSelectCurrentUser = (user) => {
    setCurrentUserId(user.id);
    localStorage.setItem('current_user_id', user.id);
    showToast(`Active profile switched to: ${user.full_name || `${user.first_name} ${user.last_name}`}`);
  };

  // Check health status
  const checkSystemHealth = useCallback(async () => {
    try {
      const data = await usersApi.checkHealth();
      setHealthStatus(data);
    } catch {
      setHealthStatus({ status: 'disconnected', database: 'disconnected' });
    }
  }, []);

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await usersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [col, order] = sortBy.split('-');
      const data = await usersApi.getUsers({
        page,
        pageSize,
        search,
        department,
        status,
        sortBy: col,
        sortOrder: order,
      });

      const loadedUsers = data.items || [];
      setUsers(loadedUsers);
      setTotalUsers(data.total || 0);
      setTotalPages(data.total_pages || 1);

      // Auto-select first user if none selected
      if (!currentUserId && loadedUsers.length > 0) {
        setCurrentUserId(loadedUsers[0].id);
        localStorage.setItem('current_user_id', loadedUsers[0].id);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      showToast(err.message, 'error');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, department, status, sortBy, currentUserId]);

  // Initial load
  useEffect(() => {
    checkSystemHealth();
    fetchStats();
  }, [checkSystemHealth, fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkSystemHealth();
    await fetchStats();
    await fetchUsers();
    setIsRefreshing(false);
    showToast('Data refreshed successfully');
  };

  // Reseed data
  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      const res = await usersApi.seedData();
      showToast(res.message || 'Sample users seeded successfully!');
      await fetchStats();
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to seed sample users', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  // Edit User Handler - Strictly protects editing other people's data!
  const handleEditUser = (user) => {
    if (!currentUser) return;

    if (user.id !== currentUser.id) {
      showToast('Permission Denied: You can only edit your own user profile, not other users.', 'error');
      return;
    }

    setUserToEdit(user);
    setFormModalOpen(true);
  };

  // Quick edit for currently active user
  const handleEditMyProfile = () => {
    if (!currentUser) {
      showToast('No active user profile selected', 'error');
      return;
    }
    setUserToEdit(currentUser);
    setFormModalOpen(true);
  };

  // Create or Update user
  const handleSaveUser = async (formData) => {
    setIsSaving(true);
    try {
      if (userToEdit) {
        // Enforce ownership: you can only update yourself
        if (currentUser && userToEdit.id !== currentUser.id) {
          showToast('Permission Denied: You cannot modify another user\'s information.', 'error');
          setIsSaving(false);
          return;
        }

        await usersApi.updateUser(userToEdit.id, formData, currentUser?.id);
        showToast('Your user profile was updated successfully!');
      } else {
        const created = await usersApi.createUser(formData);
        showToast(`New profile created for ${formData.first_name} ${formData.last_name}!`);
        // Switch to newly created user
        if (created?.id) {
          setCurrentUserId(created.id);
          localStorage.setItem('current_user_id', created.id);
        }
      }
      setFormModalOpen(false);
      setUserToEdit(null);
      await fetchStats();
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Save operation failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (currentUser && id !== currentUser.id) {
      showToast('Permission Denied: You cannot delete another user\'s profile.', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      await usersApi.deleteUser(id, currentUser?.id);
      showToast('Your account was deleted from MySQL');
      setUserToDelete(null);
      setCurrentUserId(null);
      await fetchStats();
      await fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar with Active User Profile Switcher */}
      <Navbar
        healthStatus={healthStatus}
        currentUser={currentUser}
        allUsers={users}
        onSelectCurrentUser={handleSelectCurrentUser}
        onEditMyProfile={handleEditMyProfile}
        onAddUser={() => {
          setUserToEdit(null);
          setFormModalOpen(true);
        }}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onReseed={handleReseed}
        isReseeding={isReseeding}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* MySQL Connectivity Banner if degraded */}
        <ConnectionBanner healthStatus={healthStatus} onRetry={handleRefresh} />

        {/* Aggregate KPI Stats Cards */}
        <StatsCard stats={stats} />

        {/* Search, Filter & Controls */}
        <SearchFilter
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          department={department}
          onDepartmentChange={(val) => {
            setDepartment(val);
            setPage(1);
          }}
          status={status}
          onStatusChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={(val) => {
            setSortBy(val);
            setPage(1);
          }}
          departments={stats?.departments || []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* User Details List (Table or Grid) */}
        <UserList
          users={users}
          loading={loading}
          viewMode={viewMode}
          currentUser={currentUser}
          onViewDetails={(u) => setSelectedUserForDetail(u)}
          onEditUser={handleEditUser}
          onDeleteUser={(u) => {
            if (currentUser && u.id !== currentUser.id) {
              showToast('Permission Denied: You cannot delete another user\'s account.', 'error');
              return;
            }
            setUserToDelete(u);
          }}
          onAddUser={() => {
            setUserToEdit(null);
            setFormModalOpen(true);
          }}
          onReseed={handleReseed}
        />

        {/* Pagination Bar */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalUsers}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </main>

      {/* View User Details Profile Modal */}
      {selectedUserForDetail && (
        <UserDetailModal
          user={selectedUserForDetail}
          currentUser={currentUser}
          onClose={() => setSelectedUserForDetail(null)}
          onEdit={(u) => handleEditUser(u)}
        />
      )}

      {/* Add / Edit User Modal */}
      {formModalOpen && (
        <UserFormModal
          user={userToEdit}
          onClose={() => {
            setFormModalOpen(false);
            setUserToEdit(null);
          }}
          onSave={handleSaveUser}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
          isDeleting={isDeleting}
        />
      )}

      {/* Floating Feedback Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
