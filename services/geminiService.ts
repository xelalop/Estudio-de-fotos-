
import { GoogleGenAI, Modality } from "@google/genai";

export const generateImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  clothingStyle: string,
  scenery: string
): Promise<string> => {

  if (!process.env.API_KEY) {
    throw new Error("A chave da API não foi configurada. Verifique as variáveis de ambiente.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `TROQUE A ROUPA E O CENÁRIO DA PESSOA NESTA FOTO. MANTENHA O ROSTO E OS TRAÇOS ORIGINAIS, MAS MUDE O ESTILO DE ROUPA PARA: ${clothingStyle}. ALTERE O CENÁRIO PARA: ${scenery}. ILUMINAÇÃO CINEMATOGRÁFICA, TEXTURAS REALISTAS, DETALHES ULTRA-DEFINIDOS, FOCO SUAVE, PROFUNDIDADE DE CAMPO NATURAL. FORMATO VERTICAL 9:16, NÍTIDEZ ALTA, REALISMO 8K.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    
    // Using a non-null assertion as we expect an image part if the call succeeds.
    const imagePart = response.candidates![0].content.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    }

    throw new Error("Nenhuma imagem foi gerada pela API. A resposta pode ter sido bloqueada.");

  } catch (error) {
    console.error("Erro ao chamar a API Gemini:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("A geração da imagem foi bloqueada por políticas de segurança. Tente um prompt diferente.");
    }
    throw new Error("Falha ao gerar a imagem. Verifique o console para mais detalhes.");
  }
};
