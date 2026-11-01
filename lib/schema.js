// JSON Schema for OpenAI Structured Outputs (strict mode: every field required, no extra keys)
const str = { type: 'string' };
const num = { type: 'number' };

export const tripSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['destination', 'summary', 'currency', 'estimatedTotal', 'budgetBreakdown', 'days', 'restaurants', 'tips'],
  properties: {
    destination: str,
    summary: str,
    currency: str,
    estimatedTotal: num,
    budgetBreakdown: {
      type: 'object',
      additionalProperties: false,
      required: ['accommodation', 'food', 'activities', 'transport'],
      properties: { accommodation: num, food: num, activities: num, transport: num },
    },
    days: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['day', 'title', 'items'],
        properties: {
          day: { type: 'integer' },
          title: str,
          items: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['time', 'name', 'category', 'description', 'address', 'estimatedCost'],
              properties: {
                time: str,
                name: str,
                category: { type: 'string', enum: ['sight', 'food', 'activity', 'stay', 'transit'] },
                description: str,
                address: str,
                estimatedCost: num,
              },
            },
          },
        },
      },
    },
    restaurants: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'cuisine', 'priceLevel', 'mustTry', 'description', 'address'],
        properties: {
          name: str,
          cuisine: str,
          priceLevel: { type: 'string', enum: ['$', '$$', '$$$', '$$$$'] },
          mustTry: str,
          description: str,
          address: str,
        },
      },
    },
    tips: { type: 'array', items: str },
  },
};
