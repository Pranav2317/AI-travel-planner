export function buildPrompt(r) {
  const interests = r.interests?.length ? r.interests.join(', ') : 'a good general mix';
  return `Plan a ${r.days}-day trip to ${r.destination} for ${r.travelers} traveler(s).
Total budget: ${r.budget} ${r.currency} for the whole group, including accommodation, food, activities and local transport (exclude flights to the destination).
Pace: ${r.pace}. Interests: ${interests}.${r.startDate ? `\nTrip starts on ${r.startDate}; account for season and opening days.` : ''}${r.notes ? `\nExtra notes from the traveler: ${r.notes}` : ''}

Rules:
- The trip is within India only: every stop, restaurant and address must be in India (${r.destination} and nearby). Prices should reflect Indian local costs.
- Use only real, currently operating places. Give a precise street address for each so it can be found on Google Maps.
- Order each day's stops so they make geographic sense; keep travel between them short.
- Each day: 4-7 stops including breakfast/lunch/dinner suggestions (category "food"). Use 24h times like "09:00".
- Keep estimatedTotal at or under the budget. All costs in ${r.currency}, for the whole group.
- restaurants: 6-10 standout places to eat across price levels that fit the budget.
- tips: 4-6 short, practical local tips (transport passes, etiquette, scams, booking ahead).`;
}

export const SYSTEM_PROMPT =
  'You are an expert local travel planner. You produce realistic, budget-aware itineraries with real places and accurate addresses. Never invent venues.';
