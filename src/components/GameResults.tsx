
import React, { useRef, useState } from 'react';
import { CheckedGameResult, LotteryType } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface GameResultsProps {
  checkedResults: CheckedGameResult[];
  officialQuinaResult: number[];
  officialMegaSenaResult: number[];
  isLoading: boolean;
}

const getLotteryName = (type: LotteryType) => {
  return type === LotteryType.QUINA ? 'Quina' : 'Mega-Sena';
};

const GameResults: React.FC<GameResultsProps> = ({
  checkedResults,
  officialQuinaResult,
  officialMegaSenaResult,
  isLoading,
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!resultsRef.current) {
      setExportError('Conteúdo para exportar não encontrado.');
      return;
    }

    setIsExporting(true);
    setExportMessage(null);
    setExportError(null);

    try {
      const canvas = await html2canvas(resultsRef.current, { scale: 2 }); // Increase scale for better quality
      const imageData = canvas.toDataURL('image/png');

      if (format === 'png') {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = 'resultados_loteria.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportMessage('Resultados exportados como PNG!');
      } else if (format === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imageData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imageData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('resultados_loteria.pdf');
        setExportMessage('Resultados exportados como PDF!');
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
      setExportError('Erro ao gerar o arquivo. Tente novamente.');
    } finally {
      setIsExporting(false);
      setTimeout(() => { // Clear messages after a short delay
        setExportMessage(null);
        setExportError(null);
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-6 text-gray-600">
        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Verificando seus jogos...
      </div>
    );
  }

  if (checkedResults.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-2xl text-center text-gray-500">
        Nenhum jogo carregado ou verificado. Carregue um CSV e insira os resultados oficiais para começar.
      </div>
    );
  }

  const quinaResults = checkedResults.filter(r => r.game.type === LotteryType.QUINA);
  const megaSenaResults = checkedResults.filter(r => r.game.type === LotteryType.MEGASENA);

  const renderResultsTable = (results: CheckedGameResult[], officialResult: number[], type: LotteryType) => (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 mb-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID do Jogo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seus Números
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Números Oficiais
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acertos
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((result) => (
            <tr key={result.game.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {result.game.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                <div className="flex flex-wrap gap-1">
                  {result.game.numbers.map((num) => (
                    <span
                      key={num}
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold
                        ${result.matchedNumbers.includes(num) ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                <div className="flex flex-wrap gap-1">
                  {officialResult.map((num) => (
                    <span
                      key={num}
                      className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                <span className={`text-lg ${result.points >= (type === LotteryType.QUINA ? 2 : 4) ? 'text-green-600' : 'text-gray-500'}`}>
                  {result.points}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full max-w-4xl space-y-8 p-4 md:p-0">
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Resultados da Verificação</h2>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => handleExport('png')}
          disabled={isExporting}
          className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          )}
          Exportar como Imagem (PNG)
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l3-3m-3 3l-3-3m2-8H7a2 2 0 00-2 2v4m7-8h-1a2 2 0 00-2 2v4m7-8h1a2 2 0 012 2v4m0 0h-1.586a1 1 0 00-.707.293l-1.147 1.147M12 10h.01"></path></svg>
          )}
          Exportar como PDF
        </button>
      </div>

      {exportMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-center" role="alert">
          <span className="block sm:inline">{exportMessage}</span>
        </div>
      )}
      {exportError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center" role="alert">
          <span className="block sm:inline">{exportError}</span>
        </div>
      )}


      <div ref={resultsRef} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        {quinaResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{getLotteryName(LotteryType.QUINA)}</h3>
            {officialQuinaResult.length === 5 ? (
              renderResultsTable(quinaResults, officialQuinaResult, LotteryType.QUINA)
            ) : (
              <p className="text-red-600 text-center">Insira os 5 números oficiais da Quina para verificar.</p>
            )}
          </div>
        )}

        {megaSenaResults.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{getLotteryName(LotteryType.MEGASENA)}</h3>
            {officialMegaSenaResult.length === 6 ? (
              renderResultsTable(megaSenaResults, officialMegaSenaResult, LotteryType.MEGASENA)
            ) : (
              <p className="text-red-600 text-center">Insira os 6 números oficiais da Mega-Sena para verificar.</p>
            )}
          </div>
        )}
      </div>

      {quinaResults.length === 0 && megaSenaResults.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 w-full max-w-2xl text-center text-gray-500">
          Nenhum jogo carregado ou verificado. Carregue um CSV e insira os resultados oficiais para começar.
        </div>
      )}
    </div>
  );
};

export default GameResults;