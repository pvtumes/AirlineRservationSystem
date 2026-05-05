// Mock flight data for SkyVoyage Airlines

export const AIRLINES = {
  SV: { name: 'SkyVoyage', code: 'SV', color: '#1956D6' },
  AI: { name: 'Air India',  code: 'AI', color: '#E63946' },
  '6E': { name: 'IndiGo',   code: '6E', color: '#1DB7E8' },
  SG: { name: 'SpiceJet',   code: 'SG', color: '#FF6B35' },
  UK: { name: 'Vistara',    code: 'UK', color: '#8B5CF6' },
  G8: { name: 'Go First',   code: 'G8', color: '#10B981' },
  EK: { name: 'Emirates',   code: 'EK', color: '#D97706' },
  QR: { name: 'Qatar Airways', code: 'QR', color: '#6B0F1A' },
};

export const CITIES = [
  { name: 'Mumbai',    code: 'BOM', country: 'India' },
  { name: 'Delhi',     code: 'DEL', country: 'India' },
  { name: 'Bangalore', code: 'BLR', country: 'India' },
  { name: 'Chennai',   code: 'MAA', country: 'India' },
  { name: 'Kolkata',   code: 'CCU', country: 'India' },
  { name: 'Hyderabad', code: 'HYD', country: 'India' },
  { name: 'Pune',      code: 'PNQ', country: 'India' },
  { name: 'Ahmedabad', code: 'AMD', country: 'India' },
  { name: 'Jaipur',    code: 'JAI', country: 'India' },
  { name: 'Goa',       code: 'GOI', country: 'India' },
  { name: 'Dubai',     code: 'DXB', country: 'UAE' },
  { name: 'Singapore', code: 'SIN', country: 'Singapore' },
  { name: 'London',    code: 'LHR', country: 'UK' },
  { name: 'New York',  code: 'JFK', country: 'USA' },
  { name: 'Bangkok',   code: 'BKK', country: 'Thailand' },
];

const flights = [
  // Mumbai ↔ Delhi
  {
    id: 'F001', airlineCode: 'SV', flightNo: 'SV 101',
    from: 'Mumbai', fromCode: 'BOM', to: 'Delhi', toCode: 'DEL',
    departureTime: '06:00', arrivalTime: '08:10', durationMin: 130,
    price: { economy: 4200, business: 12500 },
    stops: 0, seatsLeft: 18, rating: 4.7,
    amenities: ['WiFi', 'Meal', 'Entertainment'],
  },
  {
    id: 'F002', airlineCode: '6E', flightNo: '6E 204',
    from: 'Mumbai', fromCode: 'BOM', to: 'Delhi', toCode: 'DEL',
    departureTime: '09:30', arrivalTime: '11:45', durationMin: 135,
    price: { economy: 3650, business: 10200 },
    stops: 0, seatsLeft: 6, rating: 4.2,
    amenities: ['Snack'],
  },
  {
    id: 'F003', airlineCode: 'AI', flightNo: 'AI 665',
    from: 'Mumbai', fromCode: 'BOM', to: 'Delhi', toCode: 'DEL',
    departureTime: '14:15', arrivalTime: '16:25', durationMin: 130,
    price: { economy: 5100, business: 14000 },
    stops: 0, seatsLeft: 24, rating: 4.4,
    amenities: ['WiFi', 'Meal', 'Extra Legroom'],
  },
  {
    id: 'F004', airlineCode: 'UK', flightNo: 'UK 998',
    from: 'Mumbai', fromCode: 'BOM', to: 'Delhi', toCode: 'DEL',
    departureTime: '19:50', arrivalTime: '22:05', durationMin: 135,
    price: { economy: 4800, business: 15500 },
    stops: 0, seatsLeft: 11, rating: 4.8,
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Lounge Access'],
  },

  // Delhi ↔ Bangalore
  {
    id: 'F005', airlineCode: 'SV', flightNo: 'SV 210',
    from: 'Delhi', fromCode: 'DEL', to: 'Bangalore', toCode: 'BLR',
    departureTime: '07:20', arrivalTime: '10:05', durationMin: 165,
    price: { economy: 5500, business: 16000 },
    stops: 0, seatsLeft: 14, rating: 4.6,
    amenities: ['WiFi', 'Meal'],
  },
  {
    id: 'F006', airlineCode: '6E', flightNo: '6E 312',
    from: 'Delhi', fromCode: 'DEL', to: 'Bangalore', toCode: 'BLR',
    departureTime: '11:10', arrivalTime: '14:05', durationMin: 175,
    price: { economy: 4300, business: 11800 },
    stops: 0, seatsLeft: 32, rating: 4.1,
    amenities: ['Snack'],
  },
  {
    id: 'F007', airlineCode: 'SG', flightNo: 'SG 4401',
    from: 'Delhi', fromCode: 'DEL', to: 'Bangalore', toCode: 'BLR',
    departureTime: '15:45', arrivalTime: '19:00', durationMin: 195,
    price: { economy: 3900, business: 10500 },
    stops: 1, seatsLeft: 8, rating: 4.0,
    amenities: ['Snack'],
    stopCity: 'Hyderabad',
  },

  // Mumbai ↔ Goa
  {
    id: 'F008', airlineCode: '6E', flightNo: '6E 756',
    from: 'Mumbai', fromCode: 'BOM', to: 'Goa', toCode: 'GOI',
    departureTime: '08:00', arrivalTime: '09:10', durationMin: 70,
    price: { economy: 2800, business: 8000 },
    stops: 0, seatsLeft: 3, rating: 4.3,
    amenities: ['Snack'],
  },
  {
    id: 'F009', airlineCode: 'SV', flightNo: 'SV 320',
    from: 'Mumbai', fromCode: 'BOM', to: 'Goa', toCode: 'GOI',
    departureTime: '12:30', arrivalTime: '13:45', durationMin: 75,
    price: { economy: 3200, business: 9500 },
    stops: 0, seatsLeft: 20, rating: 4.5,
    amenities: ['WiFi', 'Snack'],
  },

  // Bangalore ↔ Chennai
  {
    id: 'F010', airlineCode: 'AI', flightNo: 'AI 434',
    from: 'Bangalore', fromCode: 'BLR', to: 'Chennai', toCode: 'MAA',
    departureTime: '10:15', arrivalTime: '11:20', durationMin: 65,
    price: { economy: 2200, business: 6500 },
    stops: 0, seatsLeft: 45, rating: 4.2,
    amenities: ['Snack'],
  },

  // Mumbai ↔ Dubai
  {
    id: 'F011', airlineCode: 'EK', flightNo: 'EK 504',
    from: 'Mumbai', fromCode: 'BOM', to: 'Dubai', toCode: 'DXB',
    departureTime: '03:30', arrivalTime: '05:45', durationMin: 195,
    price: { economy: 18500, business: 62000 },
    stops: 0, seatsLeft: 7, rating: 4.9,
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Lounge Access', 'Flatbed'],
  },
  {
    id: 'F012', airlineCode: 'SV', flightNo: 'SV 801',
    from: 'Mumbai', fromCode: 'BOM', to: 'Dubai', toCode: 'DXB',
    departureTime: '22:00', arrivalTime: '00:20', durationMin: 200,
    price: { economy: 15200, business: 48000 },
    stops: 0, seatsLeft: 12, rating: 4.6,
    amenities: ['WiFi', 'Meal', 'Entertainment'],
  },

  // Delhi ↔ Singapore
  {
    id: 'F013', airlineCode: 'QR', flightNo: 'QR 556',
    from: 'Delhi', fromCode: 'DEL', to: 'Singapore', toCode: 'SIN',
    departureTime: '01:15', arrivalTime: '11:30', durationMin: 375,
    price: { economy: 24000, business: 78000 },
    stops: 1, seatsLeft: 15, rating: 4.8,
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Lounge Access'],
    stopCity: 'Doha',
  },
  {
    id: 'F014', airlineCode: '6E', flightNo: '6E 6055',
    from: 'Delhi', fromCode: 'DEL', to: 'Singapore', toCode: 'SIN',
    departureTime: '08:00', arrivalTime: '19:45', durationMin: 345,
    price: { economy: 19800, business: 55000 },
    stops: 0, seatsLeft: 9, rating: 4.3,
    amenities: ['Meal', 'Entertainment'],
  },

  // Mumbai ↔ London
  {
    id: 'F015', airlineCode: 'AI', flightNo: 'AI 111',
    from: 'Mumbai', fromCode: 'BOM', to: 'London', toCode: 'LHR',
    departureTime: '02:40', arrivalTime: '08:50', durationMin: 550,
    price: { economy: 52000, business: 195000 },
    stops: 0, seatsLeft: 22, rating: 4.5,
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Extra Legroom'],
  },

  // Delhi ↔ New York
  {
    id: 'F016', airlineCode: 'AI', flightNo: 'AI 102',
    from: 'Delhi', fromCode: 'DEL', to: 'New York', toCode: 'JFK',
    departureTime: '14:30', arrivalTime: '19:55', durationMin: 900,
    price: { economy: 68000, business: 240000 },
    stops: 0, seatsLeft: 5, rating: 4.4,
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Flatbed'],
  },

  // Hyderabad ↔ Dubai
  {
    id: 'F017', airlineCode: 'EK', flightNo: 'EK 524',
    from: 'Hyderabad', fromCode: 'HYD', to: 'Dubai', toCode: 'DXB',
    departureTime: '09:50', arrivalTime: '12:10', durationMin: 200,
    price: { economy: 17000, business: 58000 },
    stops: 0, seatsLeft: 18, rating: 4.8,
    amenities: ['WiFi', 'Meal', 'Entertainment', 'Lounge Access'],
  },

  // Kolkata ↔ Bangkok
  {
    id: 'F018', airlineCode: 'SV', flightNo: 'SV 920',
    from: 'Kolkata', fromCode: 'CCU', to: 'Bangkok', toCode: 'BKK',
    departureTime: '11:30', arrivalTime: '17:00', durationMin: 210,
    price: { economy: 16500, business: 52000 },
    stops: 0, seatsLeft: 30, rating: 4.5,
    amenities: ['WiFi', 'Meal', 'Entertainment'],
  },

  // Mumbai ↔ Bangalore
  {
    id: 'F019', airlineCode: 'UK', flightNo: 'UK 820',
    from: 'Mumbai', fromCode: 'BOM', to: 'Bangalore', toCode: 'BLR',
    departureTime: '07:00', arrivalTime: '08:20', durationMin: 80,
    price: { economy: 3800, business: 11000 },
    stops: 0, seatsLeft: 16, rating: 4.7,
    amenities: ['WiFi', 'Snack', 'Extra Legroom'],
  },
  {
    id: 'F020', airlineCode: 'G8', flightNo: 'G8 321',
    from: 'Mumbai', fromCode: 'BOM', to: 'Bangalore', toCode: 'BLR',
    departureTime: '16:20', arrivalTime: '17:45', durationMin: 85,
    price: { economy: 3100, business: 9200 },
    stops: 0, seatsLeft: 4, rating: 4.0,
    amenities: ['Snack'],
  },

  // Delhi ↔ Jaipur
  {
    id: 'F021', airlineCode: 'SV', flightNo: 'SV 150',
    from: 'Delhi', fromCode: 'DEL', to: 'Jaipur', toCode: 'JAI',
    departureTime: '08:45', arrivalTime: '09:30', durationMin: 45,
    price: { economy: 1800, business: 5200 },
    stops: 0, seatsLeft: 40, rating: 4.3,
    amenities: ['Snack'],
  },

  // Chennai ↔ Singapore
  {
    id: 'F022', airlineCode: 'SV', flightNo: 'SV 710',
    from: 'Chennai', fromCode: 'MAA', to: 'Singapore', toCode: 'SIN',
    departureTime: '23:45', arrivalTime: '07:15', durationMin: 270,
    price: { economy: 21000, business: 68000 },
    stops: 0, seatsLeft: 13, rating: 4.6,
    amenities: ['WiFi', 'Meal', 'Entertainment'],
  },

  // Pune ↔ Delhi
  {
    id: 'F023', airlineCode: '6E', flightNo: '6E 2011',
    from: 'Pune', fromCode: 'PNQ', to: 'Delhi', toCode: 'DEL',
    departureTime: '06:30', arrivalTime: '08:40', durationMin: 130,
    price: { economy: 4500, business: 13000 },
    stops: 0, seatsLeft: 22, rating: 4.2,
    amenities: ['Snack'],
  },

  // Ahmedabad ↔ Mumbai
  {
    id: 'F024', airlineCode: 'SG', flightNo: 'SG 112',
    from: 'Ahmedabad', fromCode: 'AMD', to: 'Mumbai', toCode: 'BOM',
    departureTime: '13:00', arrivalTime: '14:15', durationMin: 75,
    price: { economy: 2600, business: 7500 },
    stops: 0, seatsLeft: 27, rating: 4.1,
    amenities: ['Snack'],
  },
];

export default flights;
