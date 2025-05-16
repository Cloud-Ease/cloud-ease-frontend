// Utility functions for profile data conversion

/**
 * Converts backend profile data to frontend format
 * Handles both camelCase and PascalCase property names from backend
 */
export const convertBackendProfileToFrontend = (backendData) => {
  console.log('=== BACKEND TO FRONTEND CONVERSION ===');
  console.log('Raw backend data:', backendData);

  // If backend data is empty or null, return empty object with default values
  if (!backendData) {
    console.warn('Backend data is null or undefined, returning default values');
    return {
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phone: '',
      imageUrl: '',
      isActive: false,
      createAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  // Log available properties for debugging
  console.log('Available properties in backend data:', Object.keys(backendData));

  // Check for both PascalCase and camelCase property names
  // Backend might be using PascalCase (C# convention)
  const firstName = backendData.firstName || backendData.FirstName || '';
  const lastName = backendData.lastName || backendData.LastName || '';
  const email = backendData.email || backendData.Email || '';
  const phone = backendData.phone || backendData.Phone || '';
  const avatarUrl =
    backendData.imageUrl ||
    backendData.avatarUrl ||
    backendData.ImageUrl ||
    backendData.AvatarUrl ||
    '';
  const isActive = backendData.isActive || backendData.IsActive || false;
  const createdAt = backendData.createdAt || backendData.CreatedAt || new Date().toISOString();
  const lastLoginAt =
    backendData.lastLoginAt || backendData.LastLoginAt || new Date().toISOString();

  // Log each extracted property
  console.log('Extracted values:', {
    firstName: `"${firstName}"`,
    lastName: `"${lastName}"`,
    email: `"${email}"`,
    phone: `"${phone}"`,
    avatarUrl: `"${avatarUrl}"`,
    isActive,
    createdAt,
    lastLoginAt,
  });

  const result = {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email,
    phone,
    imageUrl: avatarUrl,
    isActive,
    createAt: createdAt,
    lastLoginAt,
  };

  console.log('Converted frontend data:', result);
  return result;
};

/**
 * Converts frontend profile data to backend format
 * Uses PascalCase for property names as expected by C# backend
 */
export const convertFrontendProfileToBackend = (frontendData, userId) => {
  console.log('=== FRONTEND TO BACKEND CONVERSION ===');
  console.log('Frontend data:', frontendData);
  console.log('User ID:', userId);

  if (!userId) {
    console.warn('Missing user ID for profile data conversion!');
  }

  const result = {
    UserId: userId,
    FirstName: frontendData.firstName || '',
    LastName: frontendData.lastName || '',
    Email: frontendData.email || '',
    Phone: frontendData.phone || '',
    AvatarUrl: frontendData.imageUrl || '',
  };

  console.log('Converted backend data:', result);
  return result;
};
