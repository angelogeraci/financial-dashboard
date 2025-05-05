const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const defaultCategories = [
  'services en ligne',
  'location voiture',
  'service nettoyage',
  'salaires',
  'assurance',
  'marketing digital',
  'logiciels',
  'frais bancaires',
  'maintenance informatique',
  'bureautique',
  'formation',
  'déplacements professionnels',
  'télécommunications',
  'abonnements',
  'consulting',
  'fournitures bureau'
];

exports.categorizeTransactions = async (transactions) => {
  try {
    const prompt = `
Analyse ces transactions et catégorise-les parmi les catégories suivantes:
${defaultCategories.join(', ')}

Si aucune catégorie ne correspond exactement, choisis la plus proche.

Transactions à catégoriser:
${JSON.stringify(transactions.map(t => ({
  id: t._id,
  description: t.description,
  amount: t.amount,
  date: t.date
})), null, 2)}

Réponds au format JSON:
{
  "transactions": [
    {
      "id": "transaction_id",
      "suggestedCategory": "catégorie choisie",
      "confidence": 0.85
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant qui catégorise les transactions financières pour une entreprise. Réponds uniquement en JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const categorization = JSON.parse(response.choices[0].message.content);
    
    // Add confidence filtering here
    const results = transactions.map(transaction => {
      const suggestion = categorization.transactions.find(t => t.id === transaction._id.toString());
      
      return {
        ...transaction.toObject(),
        suggestedCategory: suggestion ? suggestion.suggestedCategory : transaction.category,
        confidence: suggestion ? suggestion.confidence : 0
      };
    });

    return results;
  } catch (error) {
    console.error('Error with OpenAI categorization:', error);
    throw new Error('Failed to categorize transactions with AI');
  }
};

exports.analyzeTransactionPatterns = async (transactions) => {
  try {
    const prompt = `
Analyse ces transactions et identifie des patterns, anomalies et recommandations:

Transactions:
${JSON.stringify(transactions.slice(0, 20), null, 2)}

Fournis une analyse avec:
1. Patterns récurrents
2. Potentielles anomalies
3. Recommandations

Réponds en JSON:
{
  "patterns": [],
  "anomalies": [],
  "recommendations": []
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un analyste financier expert. Analyse les transactions et fournis des insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error with pattern analysis:', error);
    throw new Error('Failed to analyze transaction patterns');
  }
};

exports.generateFinancialSummary = async (data) => {
  try {
    const prompt = `
Génère un résumé financier basé sur ces données:

${JSON.stringify(data, null, 2)}

Fournis un résumé incluant:
- État général de la santé financière
- Tendances principales
- Points d'attention
- Recommandations

Réponds en JSON formaté pour le dashboard.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en analyse financière. Fournis des insights clairs et actionnables."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating financial summary:', error);
    throw new Error('Failed to generate financial summary');
  }
};
