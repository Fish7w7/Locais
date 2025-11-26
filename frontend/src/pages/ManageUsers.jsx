import { useState, useEffect } from 'react';
import { Search, Users, Trash2, Edit, Mail, Phone, MapPin, Star, Shield, Briefcase, Building2 } from 'lucide-react';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

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
      
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
    
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Usuário excluído com sucesso!');
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao excluir usuário');
    }
  };

  const getUserTypeIcon = (type) => {
    const icons = {
      client: Users,
      provider: Briefcase,
      company: Building2,
      admin: Shield
    };
    return icons[type] || Users;
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      client: 'Cliente',
      provider: 'Prestador',
      company: 'Empresa',
      admin: 'Administrador'
    };
    return labels[type] || type;
  };

  const getUserTypeColor = (type) => {
    const colors = {
      client: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      provider: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      company: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
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

      {/* Search and Filters */}
      <div className="space-y-3">
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedType('client')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'client'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setSelectedType('provider')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'provider'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Prestadores
          </button>
          <button
            onClick={() => setSelectedType('company')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'company'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Empresas
          </button>
          <button
            onClick={() => setSelectedType('admin')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'admin'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
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
            
            return (
              <Card key={user._id} hoverable>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <TypeIcon className="w-4 h-4 text-gray-500" />
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUserTypeColor(user.type)}`}>
                            {getUserTypeLabel(user.type)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                      {user.city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {user.city}, {user.state}
                        </div>
                      )}
                    </div>

                    {/* Provider Info */}
                    {user.type === 'provider' && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Categoria</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.category || 'Não definido'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Preço/hora</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              R$ {user.pricePerHour || '0'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">
                              {user.providerRating?.toFixed(1) || '0.0'}
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
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400">CNPJ</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.cnpj}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit}
                        onClick={() => alert('Editar usuário em desenvolvimento')}
                      >
                        Editar
                      </Button>
                      {user.type !== 'admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteUser(user._id, user.name)}
                        >
                          Excluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageUsers;