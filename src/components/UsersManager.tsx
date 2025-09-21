import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Users, UserCheck, UserX, Eye, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { User } from "./types";
import { UserProfileDetail } from "./UserProfileDetail";
import { UserEditModal } from "./UserEditModal";

interface UsersManagerProps {
  users: User[];
  onUpdateUserStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => void;
  onViewUserDetails: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onEditUser?: (updatedUser: User) => void;
}

// Mock users data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    loginMethod: 'email',
    name: 'John Doe',
    phoneNumber: '+1234567890',
    email: 'john.doe@example.com',
    joinedAt: '2024-12-15T10:30:00Z',
    country: 'United States',
    status: 'active',
    lastActive: '2025-01-01T14:30:00Z'
  },
  {
    id: '2',
    loginMethod: 'google',
    name: 'Sarah Wilson',
    phoneNumber: '+1987654321',
    email: 'sarah.wilson@gmail.com',
    joinedAt: '2024-12-20T14:15:00Z',
    country: 'Canada',
    status: 'active',
    lastActive: '2025-01-01T12:15:00Z'
  },
  {
    id: '3',
    loginMethod: 'facebook',
    name: 'Mike Johnson',
    phoneNumber: '+1122334455',
    email: 'mike.johnson@facebook.com',
    joinedAt: '2024-12-18T09:45:00Z',
    country: 'United Kingdom',
    status: 'suspended',
    lastActive: '2024-12-30T16:20:00Z'
  },
  {
    id: '4',
    loginMethod: 'apple',
    name: 'Emma Davis',
    phoneNumber: '+1555666777',
    email: 'emma.davis@icloud.com',
    joinedAt: '2024-12-22T16:20:00Z',
    country: 'Australia',
    status: 'active',
    lastActive: '2025-01-01T08:45:00Z'
  },
  {
    id: '5',
    loginMethod: 'email',
    name: 'Alex Thompson',
    phoneNumber: '+1888999000',
    email: 'alex.thompson@example.com',
    joinedAt: '2024-12-10T08:30:00Z',
    country: 'Germany',
    status: 'banned',
    lastActive: '2024-12-25T11:10:00Z'
  }
];

export function UsersManager({ 
  users = mockUsers, 
  onUpdateUserStatus = () => {}, 
  onViewUserDetails = () => {},
  onDeleteUser = () => {},
  onEditUser = () => {}
}: UsersManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLoginMethodBadge = (method: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      google: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      apple: 'bg-gray-100 text-gray-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'banned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phoneNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !user.status) ||
                         user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    onUpdateUserStatus(userId, newStatus);
    toast.success(`User status updated to ${newStatus}`);
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsProfileDetailOpen(true);
    onViewUserDetails(user);
  };

  const handleCloseProfileDetail = () => {
    setIsProfileDetailOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    onDeleteUser(userId);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
    // Close the profile detail modal when opening edit modal
    setIsProfileDetailOpen(false);
  };

  const handleSaveEditedUser = (updatedUser: User) => {
    onEditUser(updatedUser);
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleQuickStatusChange = (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    onUpdateUserStatus(userId, newStatus);
  };

  const activeUsers = users.filter(u => !u.status || u.status === 'active').length;
  const suspendedUsers = users.filter(u => u.status === 'suspended').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Users Management</h2>
          <p className="text-muted-foreground">Monitor and manage user accounts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{suspendedUsers}</div>
                <div className="text-sm text-muted-foreground">Suspended</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Ban className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{bannedUsers}</div>
                <div className="text-sm text-muted-foreground">Banned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Login Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'Anonymous'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.country}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <Badge className={getLoginMethodBadge(user.loginMethod)}>
                        {user.loginMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(user.status || 'active')}>
                        {user.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(user.joinedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.status === 'suspended' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-700"
                            title="Unsuspend user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {user.status === 'banned' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuickStatusChange(user.id, 'active')}
                            className="text-green-600 hover:text-green-700"
                            title="Unban user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {(!user.status || user.status === 'active') && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickStatusChange(user.id, 'suspended')}
                              className="text-yellow-600 hover:text-yellow-700"
                              title="Suspend user"
                            >
                              Suspend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleQuickStatusChange(user.id, 'banned')}
                              className="text-red-600 hover:text-red-700"
                              title="Ban user"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Detail Modal */}
      <UserProfileDetail
        user={selectedUser}
        isOpen={isProfileDetailOpen}
        onClose={handleCloseProfileDetail}
        onUpdateStatus={handleStatusChange}
        onDeleteUser={handleDeleteUser}
        onEditUser={handleEditUser}
      />

      {/* User Edit Modal */}
      <UserEditModal
        user={userToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveEditedUser}
      />
    </div>
  );
}