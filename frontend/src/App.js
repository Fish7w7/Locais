import React, { useState } from 'react';
import { User, Briefcase, Wrench, Search, Home, MessageSquare, Star, MapPin, Clock, ChevronRight, Menu, X } from 'lucide-react';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('userSelection');
  const [userType, setUserType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dados mockados
  const categories = [
    { id: 1, name: 'Eletricista', icon: '⚡', count: 23 },
    { id: 2, name: 'Encanador', icon: '🚰', count: 18 },
    { id: 3, name: 'Pintor', icon: '🎨', count: 15 },
    { id: 4, name: 'Diarista', icon: '🏠', count: 31 },
    { id: 5, name: 'Mecânico', icon: '🔧', count: 12 },
    { id: 6, name: 'Manicure', icon: '💅', count: 27 }
  ];

  const providers = [
    { id: 1, name: 'João Silva', category: 'Eletricista', rating: 4.8, reviews: 45, price: 80, avatar: '👨‍🔧' },
    { id: 2, name: 'Maria Santos', category: 'Diarista', rating: 4.9, reviews: 89, price: 60, avatar: '👩' },
    { id: 3, name: 'Carlos Souza', category: 'Encanador', rating: 4.7, reviews: 32, price: 90, avatar: '👨' }
  ];

  const jobs = [
    { id: 1, company: 'TechShop', title: 'Vendedor', type: 'Temporário', salary: 'R$ 1.800', location: 'Centro' },
    { id: 2, company: 'Mercadinho Local', title: 'Caixa', type: 'Efetiva', salary: 'R$ 1.500', location: 'Bairro Alto' }
  ];

  // Componente de seleção de tipo de usuário
  const UserSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Bem-vindo!</h1>
        <p className="text-center text-gray-600 mb-8">Como você quer usar o app?</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => { setUserType('client'); setCurrentScreen('clientHome'); }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-2xl flex items-center justify-between transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <User size={32} />
              <div className="text-left">
                <div className="font-bold text-lg">Cliente</div>
                <div className="text-sm opacity-90">Contratar serviços</div>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>

          <button 
            onClick={() => { setUserType('provider'); setCurrentScreen('providerHome'); }}
            className="w-full bg-green-500 hover:bg-green-600 text-white p-6 rounded-2xl flex items-center justify-between transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <Wrench size={32} />
              <div className="text-left">
                <div className="font-bold text-lg">Prestador</div>
                <div className="text-sm opacity-90">Oferecer serviços</div>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>

          <button 
            onClick={() => { setUserType('company'); setCurrentScreen('companyHome'); }}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-2xl flex items-center justify-between transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <Briefcase size={32} />
              <div className="text-left">
                <div className="font-bold text-lg">Empresa</div>
                <div className="text-sm opacity-90">Contratar e publicar vagas</div>
              </div>
            </div>
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  // Header comum
  const Header = ({ title }) => (
    <div className="bg-white shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between p-4">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-xl font-bold">{title}</h1>
        <MessageSquare size={24} className="text-gray-600" />
      </div>
      
      {menuOpen && (
        <div className="bg-white border-t p-4 space-y-2">
          <button onClick={() => setCurrentScreen('userSelection')} className="w-full text-left p-2 hover:bg-gray-100 rounded">
            Trocar Perfil
          </button>
          <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Configurações</button>
          <button className="w-full text-left p-2 hover:bg-gray-100 rounded text-red-600">Sair</button>
        </div>
      )}
    </div>
  );

  // Tela Home do Cliente
  const ClientHome = () => (
    <div className="min-h-screen bg-gray-50">
      <Header title="Cliente" />
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 m-4 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Encontre profissionais</h2>
        <p className="opacity-90">Contrate serviços de qualidade na sua região</p>
      </div>

      {/* Busca */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center space-x-3">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar serviços..." 
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="px-4 mb-6">
        <h3 className="font-bold text-lg mb-3">Categorias</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map(cat => (
            <button key={cat.id} className="bg-white p-4 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-medium">{cat.name}</div>
              <div className="text-xs text-gray-500">{cat.count} profissionais</div>
            </button>
          ))}
        </div>
      </div>

      {/* Botão Ver Vagas */}
      <div className="px-4 mb-6">
        <button 
          onClick={() => setCurrentScreen('jobsList')}
          className="w-full bg-purple-500 text-white p-4 rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center justify-between"
        >
          <span>💼 Ver Vagas de Empresas</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Prestadores em Destaque */}
      <div className="px-4 mb-20">
        <h3 className="font-bold text-lg mb-3">Profissionais em Destaque</h3>
        {providers.map(provider => (
          <div key={provider.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="text-4xl">{provider.avatar}</div>
              <div className="flex-1">
                <h4 className="font-bold">{provider.name}</h4>
                <p className="text-sm text-gray-600">{provider.category}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{provider.rating}</span>
                  <span className="text-sm text-gray-500">({provider.reviews} avaliações)</span>
                </div>
                <div className="mt-2 text-green-600 font-bold">R$ {provider.price}/hora</div>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
                Contratar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  );

  // Tela de Lista de Vagas
  const JobsList = () => (
    <div className="min-h-screen bg-gray-50">
      <Header title="Vagas Disponíveis" />
      
      <div className="p-4">
        <button 
          onClick={() => setCurrentScreen('clientHome')}
          className="mb-4 text-blue-500 flex items-center"
        >
          ← Voltar
        </button>

        {jobs.map(job => (
          <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
              </div>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                {job.type}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <MapPin size={16} />
                <span>{job.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-600 font-bold">{job.salary}</span>
              <button className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-600">
                Candidatar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Tela Home do Prestador
  const ProviderHome = () => (
    <div className="min-h-screen bg-gray-50">
      <Header title="Prestador" />
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="bg-gradient-to-br from-green-400 to-green-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm opacity-90">Solicitações</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">4.8</div>
          <div className="text-sm opacity-90">Avaliação</div>
        </div>
      </div>

      {/* Menu de Ações */}
      <div className="px-4 mb-6">
        <h3 className="font-bold text-lg mb-3">Meu Negócio</h3>
        <div className="space-y-3">
          <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Wrench size={20} className="text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-bold">Solicitações Recebidas</div>
                <div className="text-sm text-gray-600">12 novas</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Briefcase size={20} className="text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-bold">Propostas de Vagas</div>
                <div className="text-sm text-gray-600">3 empresas interessadas</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-bold">Meu Perfil</div>
                <div className="text-sm text-gray-600">Editar informações</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Seção de Contratar Serviços */}
      <div className="px-4 mb-20">
        <h3 className="font-bold text-lg mb-3">Precisa Contratar?</h3>
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-2xl">
          <h4 className="font-bold text-lg mb-2">Buscar Prestadores</h4>
          <p className="text-sm opacity-90 mb-4">Encontre profissionais para seus projetos</p>
          <button className="bg-white text-orange-500 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
            Buscar Agora
          </button>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );

  // Tela Home da Empresa
  const CompanyHome = () => (
    <div className="min-h-screen bg-gray-50">
      <Header title="Empresa" />
      
      {/* Quick Actions */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <Briefcase size={32} className="mb-2" />
            <div className="font-bold">Publicar Vaga</div>
          </button>
          <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <Wrench size={32} className="mb-2" />
            <div className="font-bold">Contratar Serviço</div>
          </button>
        </div>
      </div>

      {/* Minhas Vagas */}
      <div className="px-4 mb-6">
        <h3 className="font-bold text-lg mb-3">Minhas Vagas</h3>
        <div className="bg-white p-4 rounded-xl shadow-sm mb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold">Vendedor</h4>
              <p className="text-sm text-gray-600">Temporário - 3 meses</p>
            </div>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">Ativa</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">18 candidatos</span>
            <span className="text-blue-600">Ver candidatos →</span>
          </div>
        </div>
      </div>

      {/* Prestadores Favoritos */}
      <div className="px-4 mb-20">
        <h3 className="font-bold text-lg mb-3">Prestadores Favoritos</h3>
        {providers.slice(0, 2).map(provider => (
          <div key={provider.id} className="bg-white p-4 rounded-xl shadow-sm mb-3 flex items-center space-x-3">
            <div className="text-3xl">{provider.avatar}</div>
            <div className="flex-1">
              <h4 className="font-bold">{provider.name}</h4>
              <p className="text-sm text-gray-600">{provider.category}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm">{provider.rating}</span>
              </div>
            </div>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm">
              Convidar
            </button>
          </div>
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );

  // Bottom Navigation
  const BottomNav = ({ active }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="flex justify-around py-2">
        <button className={`flex flex-col items-center p-2 ${active === 'home' ? 'text-blue-500' : 'text-gray-600'}`}>
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </button>
        <button className={`flex flex-col items-center p-2 ${active === 'search' ? 'text-blue-500' : 'text-gray-600'}`}>
          <Search size={24} />
          <span className="text-xs mt-1">Buscar</span>
        </button>
        <button className={`flex flex-col items-center p-2 ${active === 'requests' ? 'text-blue-500' : 'text-gray-600'}`}>
          <Clock size={24} />
          <span className="text-xs mt-1">Pedidos</span>
        </button>
        <button className={`flex flex-col items-center p-2 ${active === 'profile' ? 'text-blue-500' : 'text-gray-600'}`}>
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );

  // Renderização condicional
  return (
    <div className="max-w-md mx-auto bg-white" style={{ minHeight: '100vh' }}>
      {currentScreen === 'userSelection' && <UserSelection />}
      {currentScreen === 'clientHome' && <ClientHome />}
      {currentScreen === 'providerHome' && <ProviderHome />}
      {currentScreen === 'companyHome' && <CompanyHome />}
      {currentScreen === 'jobsList' && <JobsList />}
    </div>
  );
};

export default App;