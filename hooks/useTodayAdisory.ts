import { useContext, useEffect, useState } from "react";
import { StorageContext } from "@/Context/StorageContext";
import { AIService, AIProviderTier } from "@/services/AIService";

export const useTodayAdisory = () => {
  const storageContext = useContext(StorageContext);
  const userBasicInfo = storageContext?.userBasicInfo;
  const weatherData = storageContext?.weatherData;

  const [advisory, setAdvisory] = useState<string>(
    "🌾 आज का कृषि सुझाव: हल्की धूप व अनुकूल नमी है। गेहूं व सरसों में कल्ले निकलने की अवस्था पर निगरानी रखें। यदि हल्की वर्षा की संभावना हो तो सिंचाई 2 दिन टालें।"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [tier, setTier] = useState<AIProviderTier>('groq/openai/gpt-oss-20b');

  const fetchAdvisory = async () => {
    setLoading(true);
    const crop = userBasicInfo?.cropType || 'Wheat / Rice';
    const location = userBasicInfo?.location || 'North India';
    const weatherSummary = weatherData?.list?.[0]?.weather?.[0]?.description || 'Partly Cloudy, mild temperature';

    const prompt = `Give a concise, practical, 2-line daily farming advisory in Hindi for a farmer with:
Crop: ${crop}
Location: ${location}
Current Weather: ${weatherSummary}
Output ONLY the Hindi advisory text with 1 emoji at the start. No greetings, no English, max 35 words.`;

    try {
      await AIService.streamChat(
        {
          messageText: prompt,
          langInstruction: 'Respond in Hindi only.',
          customGroqKey: storageContext?.customGroqKey,
          customGeminiKey: storageContext?.customGeminiKey,
        },
        {
          onModelSelected: (selectedTier) => setTier(selectedTier),
          onChunk: () => {},
          onComplete: (text, usedTier) => {
            if (text && text.trim()) {
              setAdvisory(text.trim());
              setTier(usedTier);
            }
            setLoading(false);
          },
          onError: () => {
            setLoading(false);
          },
        }
      );
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory();
  }, [userBasicInfo?.cropType, userBasicInfo?.location]);

  return { Advisory: advisory, loading, tier, refetch: fetchAdvisory };
};
