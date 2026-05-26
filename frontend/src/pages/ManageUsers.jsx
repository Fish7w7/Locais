import { useState, useEffect } from 'react';
import { Search, Users, Trash2, Edit, Mail, Phone, MapPin, Star, Shield, Briefcase, Building2 } from 'lucide-react';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import EditUserModal from '../components/EditUserModal';
import ConfirmModal from '../components/ConfirmModal';
import { useNotification } from '../contexts/NotificationContext';
import { useConfirm } from '../hooks/useConfirm';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { success, error: showError } = useNotification();
  const { confirmState, confirm, cancel } = useConfirm();

  const getUserId = (user) => user?._id || user?.id;
  const toSearchText = (value) => String(value || '').toLowerCase();

  useEffect(() => {
    loadUsers();
  }, [selectedType]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = selectedType ? { type: selectedType } : {};
      
      const response = await axios.get('/api/admin/users', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const loadedUsers = (response.data.users || []).filter(Boolean);
      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      showError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const normalizedSearch = searchTerm.toLowerCase();
    const filtered = users.filter(user =>
      toSearchText(user.name).includes(normalizedSearch) ||
      toSearchText(user.email).includes(normalizedSearch) ||
      toSearchText(user.phone).includes(normalizedSearch)
    );
    
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId, userName) => {
    await confirm({
      title: 'Excluir usuário',
      message: `Tem certeza que deseja excluir o usuário "${userName}"Esta ação não pode ser desfeita.`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          success('Usuário excluído com sucesso!');
          loadUsers();
        } catch (error) {
          showError(error.response?.data.message || 'Erro ao excluir usuário');
        }
      }
    });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getUserTypeIcon = (type) => {
    const icons = { client: Users,
      provider: Briefcase,
      company: Building2,
      admin: Shield
    };
    return icons[type] || Users;
  };

  const getUserTypeLabel = (type) => {
    const labels = { client: 'Cliente',
      provider: 'Prestador',
      company: 'Empresa',
      admin: 'Administrador'
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = { client: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      provider: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      company: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gerenciar Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
          </p>
        </div>
        <Button size="sm" onClick={loadUsers}>
          Atualizar
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar por nome, email ou telefone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={Search}
      />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setSelectedType('')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedType === '' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setSelectedType('client')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedType === 'client' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Clientes
        </button>
        <button
          onClick={() => setSelectedType('provider')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedType === 'provider' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Prestadores
        </button>
        <button
          onClick={() => setSelectedType('company')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedType === 'company' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Empresas
        </button>
        <button
          onClick={() => setSelectedType('admin')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedType === 'admin' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Admins
        </button>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum usuário encontrado
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const TypeIcon = getUserTypeIcon(user.type);
            const userId = getUserId(user);
            const userName = user.name || 'Usuário sem nome';
            const providerRating = Number(user.providerRating || 0);
            
            return (
              <Card key={userId || user.email || userName}>
                <div className="space-y-3">
                  {/* User Header */}
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(userName)}&background=random`}
                      alt={userName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {userName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <TypeIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.type)}`}>
                          {getUserTypeLabel(user.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{user.email || 'Email não informado'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{user.phone || 'Telefone não informado'}</span>
                    </div>
                    {user.city && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{user.city}, {user.state}</span>
                      </div>
                    )}
                  </div>

                  {/* Provider Info */}
                  {user.type === 'provider' && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Categoria</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.category || 'Não definido'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Preço/hora</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            R$ {user.pricePerHour || '0'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {providerRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({user.providerReviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Info */}
                  {user.type === 'company' && user.cnpj && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">CNPJ</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.cnpj}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Edit}
                      onClick={() => handleEditUser(user)}
                      disabled={!userId}
                      fullWidth
                    >
                      Editar
                    </Button>
                    {user.type !== 'admin' && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeleteUser(userId, userName)}
                        disabled={!userId}
                        fullWidth
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={loadUsers}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={cancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
      />
    </div>
  );
};

export default ManageUsers;
