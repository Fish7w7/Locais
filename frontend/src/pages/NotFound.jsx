import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            404
          </h1>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Página não encontrada
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
          >
            Ir para Home
          </Button>
          <Button 
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};


export default NotFound;