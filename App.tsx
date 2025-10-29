
import React, { useState, useCallback } from 'react';
import { generateImageWithGemini } from './services/geminiService';
import { fileToBase64, fileToDataUrl } from './utils/fileUtils';
import { ImageIcon } from './components/icons/ImageIcon';
import { Spinner } from './components/Spinner';

interface OriginalImage {
  file: File;
  dataUrl: string;
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [clothingStyle, setClothingStyle] = useState<string>('uma jaqueta de couro preta e camiseta branca');
  const [scenery, setScenery] = useState<string>('uma rua de Tóquio à noite, com luzes de neon');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("O arquivo de imagem é muito grande. O limite é 4MB.");
        return;
      }
      try {
        setError(null);
        const dataUrl = await fileToDataUrl(file);
        setOriginalImage({ file, dataUrl });
        setGeneratedImage(null); // Clear previous result
      } catch (err) {
        setError("Falha ao ler o arquivo de imagem.");
        console.error(err);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage || !clothingStyle || !scenery) {
      setError('Por favor, carregue uma imagem e preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await fileToBase64(originalImage.file);
      const newImageBase64 = await generateImageWithGemini(
        base64Image,
        originalImage.file.type,
        clothingStyle,
        scenery
      );
      setGeneratedImage(`data:image/jpeg;base64,${newImageBase64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
            Estúdio de Retratos IA
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Reimagine suas fotos com o poder do Gemini.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
                  1. Carregue sua foto
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                        <span>Selecione um arquivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP até 4MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="clothing" className="block text-sm font-medium text-gray-300">
                  2. Novo estilo de roupa
                </label>
                <textarea
                  id="clothing"
                  rows={3}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500"
                  placeholder="Ex: um terno elegante e moderno"
                  value={clothingStyle}
                  onChange={(e) => setClothingStyle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="scenery" className="block text-sm font-medium text-gray-300">
                  3. Novo cenário
                </label>
                <textarea
                  id="scenery"
                  rows={3}
                  className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-500"
                  placeholder="Ex: uma praia tropical ao pôr do sol"
                  value={scenery}
                  onChange={(e) => setScenery(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !originalImage}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? <Spinner /> : 'Gerar Nova Imagem'}
              </button>
            </form>
            {error && <div className="mt-4 text-center p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-md">{error}</div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-1 lg:grid-cols-1">
             <ImageDisplay title="Original" src={originalImage?.dataUrl} />
             <ImageDisplay title="Gerada" src={generatedImage} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

interface ImageDisplayProps {
    title: string;
    src: string | null | undefined;
    isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, src, isLoading = false }) => (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700 flex flex-col">
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
        <div className="aspect-[9/16] w-full bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            {isLoading ? (
                <div className="flex flex-col items-center text-gray-400">
                    <Spinner size="lg"/>
                    <p className="mt-2 text-sm animate-pulse">Gerando sua obra de arte...</p>
                </div>
            ) : src ? (
                <img src={src} alt={title} className="w-full h-full object-cover" />
            ) : (
                <div className="text-gray-500 flex flex-col items-center">
                    <ImageIcon className="w-16 h-16" />
                    <p className="mt-2">A imagem aparecerá aqui</p>
                </div>
            )}
        </div>
    </div>
);


export default App;
