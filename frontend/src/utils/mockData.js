export const categories = [
  { id: 1, name: 'Eletricista', icon: '⚡', count: 23 },
  { id: 2, name: 'Encanador', icon: '🚰', count: 18 },
  { id: 3, name: 'Pintor', icon: '🎨', count: 15 },
  { id: 4, name: 'Diarista', icon: '🏠', count: 31 },
  { id: 5, name: 'Mecânico', icon: '🔧', count: 12 },
  { id: 6, name: 'Manicure', icon: '💅', count: 27 }
];

export const providers = [
  { id: 1, name: 'João Silva', category: 'Eletricista', rating: 4.8, reviews: 45, price: 80, avatar: '👨‍🔧' },
  { id: 2, name: 'Maria Santos', category: 'Diarista', rating: 4.9, reviews: 89, price: 60, avatar: '👩' },
  { id: 3, name: 'Carlos Souza', category: 'Encanador', rating: 4.7, reviews: 32, price: 90, avatar: '👨' }
];

export const jobs = [
  { id: 1, company: 'TechShop', title: 'Vendedor', type: 'Temporário', salary: 'R$ 1.800', location: 'Centro' },
  { id: 2, company: 'Mercadinho Local', title: 'Caixa', type: 'Efetiva', salary: 'R$ 1.500', location: 'Bairro Alto' }
];

export const currentUser = {
  name: 'Pedro Oliveira',
  email: 'pedro@email.com',
  phone: '(21) 98765-4321',
  avatar: '👤',
  bio: 'Profissional dedicado com experiência de 5 anos',
  memberSince: 'Janeiro 2024',
  rating: 4.8,
  totalReviews: 45,
  completedJobs: 128,
  category: 'Eletricista',
  pricePerHour: 80,
  skills: ['Instalações Residenciais', 'Manutenção Elétrica', 'Automação'],
  portfolio: [
    { id: 1, image: '🏠', description: 'Instalação residencial completa' },
    { id: 2, image: '🏢', description: 'Projeto comercial' },
    { id: 3, image: '⚡', description: 'Painel elétrico' }
  ]
};