/**
 * Mock test data for Web Check-in API testing
 * These are sample responses from the backend API for different scenarios
 * Use these to test the frontend without a running backend
 */

// ============================================================================
// SCENARIO 1: Valid booking with 2 passengers - can check in
// ============================================================================
export const mockValidBooking = {
  success: true,
  pnr: "SV-ABC123",
  apiResponse: {
    Success: true,
    Booking: {
      BookingRef: "SV-ABC123",
      FlightId: "SV001",
      CabinClass: "Economy",
      Passengers: {
        Passenger: [
          { Name: "John Doe" },
          { Name: "Jane Doe" }
        ]
      },
      Status: "Confirmed",
      CheckinStatus: "Not Checked-in"
    },
    Flight: {
      Id: "SV001",
      From: "Delhi",
      To: "Mumbai",
      DepartureTime: "2026-04-28T08:00:00+05:30",
      ArrivalTime: "2026-04-28T10:15:00+05:30"
    }
  }
};

// ============================================================================
// SCENARIO 2: Already checked-in booking
// ============================================================================
export const mockAlreadyCheckedIn = {
  success: true,
  pnr: "SV-XYZ789",
  apiResponse: {
    Success: true,
    Booking: {
      BookingRef: "SV-XYZ789",
      FlightId: "SV002",
      CabinClass: "Business",
      Passengers: {
        Passenger: [
          { Name: "Alice Smith" }
        ]
      },
      Status: "Confirmed",
      CheckinStatus: "Checked-in",
      CheckedInAt: "2026-04-27T18:30:00+05:30"
    },
    Flight: {
      Id: "SV002",
      From: "Mumbai",
      To: "Bangalore",
      DepartureTime: "2026-04-28T14:00:00+05:30",
      ArrivalTime: "2026-04-28T15:45:00+05:30"
    }
  }
};

// ============================================================================
// SCENARIO 3: Cancelled booking - cannot check in
// ============================================================================
export const mockCancelledBooking = {
  success: false,
  pnr: "SV-CANC999",
  apiResponse: {
    Success: false,
    Error: "This booking has been cancelled."
  }
};

// ============================================================================
// SCENARIO 4: Booking with no passengers - invalid
// ============================================================================
export const mockNoPassengers = {
  success: false,
  pnr: "SV-EMPTY999",
  apiResponse: {
    Success: true,
    Booking: {
      BookingRef: "SV-EMPTY999",
      FlightId: "SV003",
      CabinClass: "Economy",
      Passengers: {
        Passenger: []  // ❌ Empty array
      },
      Status: "Confirmed",
      CheckinStatus: "Not Checked-in"
    },
    Flight: {
      Id: "SV003",
      From: "Delhi",
      To: "London",
      DepartureTime: "2026-04-29T22:00:00+05:30",
      ArrivalTime: "2026-04-30T03:30:00+00:00"
    }
  }
};

// ============================================================================
// SCENARIO 5: Invalid PNR - not found
// ============================================================================
export const mockInvalidPnr = {
  success: false,
  pnr: "INVALID123",
  apiResponse: {
    Success: false,
    Error: "Booking not found. Please check your PNR and try again."
  }
};

// ============================================================================
// SCENARIO 6: Business class booking with multiple passengers
// ============================================================================
export const mockBusinessClassBooking = {
  success: true,
  pnr: "SV-BIZ456",
  apiResponse: {
    Success: true,
    Booking: {
      BookingRef: "SV-BIZ456",
      FlightId: "SV100",
      CabinClass: "Business",
      Passengers: {
        Passenger: [
          { Name: "Mr. Rajesh Kumar" },
          { Name: "Ms. Priya Sharma" },
          { Name: "Master Arjun Kumar" }
        ]
      },
      Status: "Confirmed",
      CheckinStatus: "Not Checked-in"
    },
    Flight: {
      Id: "SV100",
      From: "Bangalore",
      To: "Singapore",
      DepartureTime: "2026-04-29T11:30:00+05:30",
      ArrivalTime: "2026-04-29T17:15:00+08:00"
    }
  }
};

// ============================================================================
// SCENARIO 7: Premium cabin with single passenger
// ============================================================================
export const mockPremiumBooking = {
  success: true,
  pnr: "SV-PREM789",
  apiResponse: {
    Success: true,
    Booking: {
      BookingRef: "SV-PREM789",
      FlightId: "SV200",
      CabinClass: "Premium",
      Passengers: {
        Passenger: [
          { Name: "Dr. Vikram Patel" }
        ]
      },
      Status: "Confirmed",
      CheckinStatus: "Not Checked-in"
    },
    Flight: {
      Id: "SV200",
      From: "Delhi",
      To: "New York",
      DepartureTime: "2026-05-01T23:00:00+05:30",
      ArrivalTime: "2026-05-02T10:30:00-04:00"
    }
  }
};

// ============================================================================
// CHECK-IN UPDATE API RESPONSES
// ============================================================================

// Successful check-in
export const mockCheckinSuccess = {
  Success: true,
  Message: "Check-in completed successfully",
  Pnr: "SV-ABC123",
  CheckinStatus: "Checked-in",
  CheckedInAt: "2026-04-28T07:30:00+05:30"
};

// Duplicate check-in attempt
export const mockCheckinDuplicate = {
  Success: false,
  Error: "This booking has already been checked in.",
  Message: "Booking already checked in at 2026-04-27T18:30:00+05:30"
};

// Booking not found
export const mockCheckinNotFound = {
  Success: false,
  Error: "Booking not found. Unable to update check-in status."
};

// ============================================================================
// EDGE CASES FOR TESTING
// ============================================================================

// Missing flight data
export const mockMissingFlightData = {
  Success: true,
  Booking: {
    BookingRef: "SV-TEST001",
    FlightId: "SV001",
    CabinClass: "Economy",
    Passengers: {
      Passenger: [
        { Name: "Test User" }
      ]
    },
    Status: "Confirmed",
    CheckinStatus: "Not Checked-in"
  },
  Flight: {
    Id: "SV001",
    From: null,  // ⚠️ Missing location
    To: null,    // ⚠️ Missing location
    DepartureTime: "2026-04-28T08:00:00+05:30",
    ArrivalTime: null  // ⚠️ Missing arrival time
  }
};

// Malformed response (missing CheckinStatus)
export const mockMalformedResponse = {
  Success: true,
  Booking: {
    BookingRef: "SV-TEST002",
    FlightId: "SV002",
    CabinClass: "Economy",
    Passengers: {
      Passenger: [
        { Name: "Test User 2" }
      ]
    },
    Status: "Confirmed"
    // ⚠️ Missing CheckinStatus field
  },
  Flight: {
    Id: "SV002",
    From: "Delhi",
    To: "Mumbai",
    DepartureTime: "2026-04-28T09:00:00+05:30",
    ArrivalTime: "2026-04-28T11:30:00+05:30"
  }
};

// ============================================================================
// TEST HELPER FUNCTION
// ============================================================================

/**
 * Simulates a backend API response for testing
 * In production, this would be replaced with actual fetch calls
 * 
 * @param {string} pnr - Booking reference / PNR
 * @returns {Promise<object>} - Mock API response
 */
export async function mockCheckinApiCall(pnr) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const pnrUpper = pnr?.toUpperCase() || '';

  // Route to appropriate mock data
  if (pnrUpper === 'SV-ABC123') return mockValidBooking.apiResponse;
  if (pnrUpper === 'SV-XYZ789') return mockAlreadyCheckedIn.apiResponse;
  if (pnrUpper === 'SV-CANC999') return mockCancelledBooking.apiResponse;
  if (pnrUpper === 'SV-EMPTY999') return mockNoPassengers.apiResponse;
  if (pnrUpper === 'SV-BIZ456') return mockBusinessClassBooking.apiResponse;
  if (pnrUpper === 'SV-PREM789') return mockPremiumBooking.apiResponse;

  // Default: booking not found
  return mockInvalidPnr.apiResponse;
}

/**
 * Test the different scenarios
 * Run in browser console: testAllScenarios()
 */
export async function testAllScenarios() {
  console.log('🧪 Testing all Web Check-in scenarios...\n');

  const testCases = [
    { pnr: 'SV-ABC123', description: 'Valid booking (2 passengers)' },
    { pnr: 'SV-XYZ789', description: 'Already checked-in' },
    { pnr: 'SV-CANC999', description: 'Cancelled booking' },
    { pnr: 'SV-EMPTY999', description: 'No passengers' },
    { pnr: 'SV-BIZ456', description: 'Business class (3 passengers)' },
    { pnr: 'SV-PREM789', description: 'Premium cabin' },
    { pnr: 'INVALID123', description: 'Invalid PNR' },
  ];

  for (const { pnr, description } of testCases) {
    console.log(`\n📋 Test: ${description}`);
    console.log(`   PNR: ${pnr}`);
    try {
      const response = await mockCheckinApiCall(pnr);
      console.log(`   ✅ Response:`, response);
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }

  console.log('\n✅ All scenarios tested!');
}
