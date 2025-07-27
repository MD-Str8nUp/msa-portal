// Real API service functions to replace mock data
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Scout API Services
export const scoutService = {
  async getScouts(params?: { groupId?: string; parentId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.groupId) searchParams.append('groupId', params.groupId);
    if (params?.parentId) searchParams.append('parentId', params.parentId);
    
    const endpoint = `/scouts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  async createScout(data: { name: string; age: number; rank: string; parentId: string; groupId: string }) {
    return apiRequest('/scouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateScout(id: string, data: Partial<{ name: string; age: number; rank: string; groupId: string }>) {
    return apiRequest('/scouts', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteScout(id: string) {
    return apiRequest(`/scouts?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// Group API Services
export const groupService = {
  async getGroups(params?: { withStats?: boolean; leaderId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.withStats) searchParams.append('withStats', 'true');
    if (params?.leaderId) searchParams.append('leaderId', params.leaderId);
    
    const endpoint = `/groups${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  async createGroup(data: { name: string; description?: string }) {
    return apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGroup(id: string, data: Partial<{ name: string; description: string }>) {
    return apiRequest('/groups', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteGroup(id: string) {
    return apiRequest(`/groups?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// User API Services
export const userService = {
  async getUsers(params?: { role?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  async createUser(data: { 
    name: string; 
    email: string; 
    password: string; 
    role: string; 
    isParent?: boolean; 
    isLeader?: boolean; 
    isExecutive?: boolean; 
    isSupport?: boolean; 
  }) {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, data: Partial<{ 
    name: string; 
    email: string; 
    password?: string; 
    role: string; 
    isParent?: boolean; 
    isLeader?: boolean; 
    isExecutive?: boolean; 
    isSupport?: boolean; 
  }>) {
    return apiRequest('/users', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteUser(id: string) {
    return apiRequest(`/users?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// Event API Services
export const eventService = {
  async getEvents(params?: { groupId?: string; upcoming?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.groupId) searchParams.append('groupId', params.groupId);
    if (params?.upcoming) searchParams.append('upcoming', 'true');
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  async createEvent(data: { 
    title: string; 
    description?: string; 
    location: string; 
    startDate: string; 
    endDate: string; 
    groupId?: string;
    requiresPermissionSlip?: boolean;
  }) {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEvent(id: string, data: Partial<{ 
    title: string; 
    description: string; 
    location: string; 
    startDate: string; 
    endDate: string; 
    groupId?: string;
    requiresPermissionSlip?: boolean;
  }>) {
    return apiRequest('/events', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteEvent(id: string) {
    return apiRequest(`/events?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// Achievement API Services
export const achievementService = {
  async getAchievements(params?: { scoutId?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.scoutId) searchParams.append('scoutId', params.scoutId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/achievements${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  async createAchievement(data: { 
    name: string; 
    description?: string; 
    scoutId: string; 
    dateEarned?: string;
  }) {
    return apiRequest('/achievements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAchievement(id: string, data: Partial<{ 
    name: string; 
    description: string; 
    dateEarned: string;
  }>) {
    return apiRequest('/achievements', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  },

  async deleteAchievement(id: string) {
    return apiRequest(`/achievements?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// Message API Services
export const messageService = {
  async getMessages(params: { 
    userId: string; 
    conversationWith?: string; 
    unreadOnly?: boolean; 
    page?: number; 
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    searchParams.append('userId', params.userId);
    if (params.conversationWith) searchParams.append('conversationWith', params.conversationWith);
    if (params.unreadOnly) searchParams.append('unreadOnly', 'true');
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    const endpoint = `/messages?${searchParams.toString()}`;
    return apiRequest(endpoint);
  },

  async sendMessage(data: { content: string; senderId: string; receiverId: string }) {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markMessagesAsRead(messageIds: string[], markAsRead = true) {
    return apiRequest('/messages', {
      method: 'PUT',
      body: JSON.stringify({ messageIds, markAsRead }),
    });
  },

  async deleteMessage(id: string, userId: string) {
    return apiRequest(`/messages?id=${id}&userId=${userId}`, {
      method: 'DELETE',
    });
  }
};

// Attendance API Services
export const attendanceService = {
  async getAttendance(params?: { scoutId?: string; eventId?: string; userId?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.scoutId) searchParams.append('scoutId', params.scoutId);
    if (params?.eventId) searchParams.append('eventId', params.eventId);
    if (params?.userId) searchParams.append('userId', params.userId);
    
    const endpoint = `/attendance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest(endpoint);
  },

  async recordAttendance(data: { 
    scoutId: string; 
    userId: string; 
    eventId: string; 
    status: 'present' | 'absent' | 'excused';
    date?: string;
  }) {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAttendance(id: string, data: { status: 'present' | 'absent' | 'excused' }) {
    return apiRequest('/attendance', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  }
};

// Data Import Services
export const importService = {
  async importMSAData() {
    return apiRequest('/import-msa-data', {
      method: 'POST',
    });
  },

  async getImportStats() {
    return apiRequest('/import-msa-data');
  }
};

// Export all services
export default {
  scout: scoutService,
  group: groupService,
  user: userService,
  event: eventService,
  achievement: achievementService,
  message: messageService,
  attendance: attendanceService,
  import: importService
};