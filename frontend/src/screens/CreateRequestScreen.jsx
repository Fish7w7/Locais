import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Calendar, DollarSign, FileText, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const CreateRequestScreen = (props) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: 'Niterói',
    state: 'RJ',
    requestedDate: '',
    estimatedDuration: 2,
    price: ''
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/providers`);
      setProviders(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProvider) {
      alert('Selecione um prestador');
      return;
    }

    try {
      // Configure headers com user-id (você deve pegar do contexto/auth)
      const userId = localStorage.getItem('userId') || providers.find(p => p.userType !== 'provider')?._id;
      
      await axios.post(`${API_URL}/requests`, {
        providerId: selectedProvider._id,
        category: selectedProvider.category,
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state
        },
        requestedDate: formData.requestedDate,
        estimatedDuration: parseFloat(formData.estimatedDuration),
        price: parseFloat(formData.price)
      }, {
        headers: {
          'x-user-id': userId,
          'x-user-type': 'client'
        }
      });

      alert('✅ Solicitação criada com sucesso!');
      props.setCurrentScreen('requests');
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      alert('❌ Erro ao criar solicitação: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedProvider) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => props.setCurrentScreen('clientHome')}
              className="text-blue-600 dark:text-blue-400 flex items-center space-x-1"
            >
              <ChevronLeft size={24} />
              <span>Voltar</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Escolher Prestador</h1>
            <div className="w-16"></div>
          </div>
        </div>

        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Selecione um Prestador</h2>
          
          {providers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Nenhum prestador disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map(provider => (
                <button
                  key={provider._id}
                  onClick={() => setSelectedProvider(provider)}
                  className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{provider.avatar || '👤'}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 dark:text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{provider.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{provider.providerRating || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({provider.providerReviewCount || 0} avaliações)
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                        R$ {provider.pricePerHour}/hora
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setSelectedProvider(null)}
            className="text-blue-600 dark:text-blue-400 flex items-center space-x-1"
          >
            <ChevronLeft size={24} />
            <span>Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Nova Solicitação</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="p-4">
        {/* Prestador Selecionado */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-white mb-6">
          <p className="text-sm opacity-90 mb-2">Solicitar serviço de:</p>
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{selectedProvider.avatar || '👤'}</div>
            <div>
              <h3 className="font-bold text-lg">{selectedProvider.name}</h3>
              <p className="text-sm opacity-90">{selectedProvider.category}</p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
              <FileText size={20} />
              <span className="font-semibold">Título *</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Instalação de tomadas"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descrição */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
              <FileText size={20} />
              <span className="font-semibold">Descrição *</span>
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o serviço necessário..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Endereço */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
              <MapPin size={20} />
              <span className="font-semibold">Endereço *</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Rua, número, bairro"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Cidade"
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                placeholder="UF"
                maxLength={2}
                className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Data */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
              <Calendar size={20} />
              <span className="font-semibold">Data e Hora *</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.requestedDate}
              onChange={(e) => setFormData({...formData, requestedDate: e.target.value})}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duração e Preço */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
                <Clock size={20} />
                <span className="font-semibold text-sm">Duração (horas)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign size={20} />
                <span className="font-semibold text-sm">Preço (R$)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="150.00"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl font-bold transition-colors"
            >
              Enviar Solicitação
            </button>
            <button
              type="button"
              onClick={() => props.setCurrentScreen('clientHome')}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestScreen;