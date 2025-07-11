import { supabase } from '@/lib/supabase';

// User Service
export const userService = {
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching current user:', error);
      return null;
    }

    return data;
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('first_name');

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }
};

// Scout Service
export const scoutService = {
  async getAllScouts() {
    const { data, error } = await supabase
      .from('scouts')
      .select(`
        *,
        parent:users!parent_id(first_name, last_name, full_name, email, phone),
        group:scout_groups!group_id(name, division, meeting_day, meeting_time)
      `)
      .order('first_name');

    if (error) {
      console.error('Error fetching scouts:', error);
      return [];
    }

    return data;
  },

  async getScoutsByParent(parentId: string) {
    const { data, error } = await supabase
      .from('scouts')
      .select(`
        *,
        group:scout_groups!group_id(name, division, meeting_day, meeting_time)
      `)
      .eq('parent_id', parentId)
      .order('first_name');

    if (error) {
      console.error('Error fetching scouts by parent:', error);
      return [];
    }

    return data;
  },

  async getScoutsByGroup(groupId: string) {
    const { data, error } = await supabase
      .from('scouts')
      .select(`
        *,
        parent:users!parent_id(first_name, last_name, full_name, email, phone)
      `)
      .eq('group_id', groupId)
      .order('first_name');

    if (error) {
      console.error('Error fetching scouts by group:', error);
      return [];
    }

    return data;
  },

  async getScoutById(id: string) {
    const { data, error } = await supabase
      .from('scouts')
      .select(`
        *,
        parent:users!parent_id(first_name, last_name, full_name, email, phone),
        group:scout_groups!group_id(name, division, meeting_day, meeting_time)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching scout:', error);
      return null;
    }

    return data;
  },

  async updateScout(id: string, updates: any) {
    const { data, error } = await supabase
      .from('scouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scout:', error);
      return null;
    }

    return data;
  },

  async createScout(scoutData: any) {
    const { data, error } = await supabase
      .from('scouts')
      .insert(scoutData)
      .select()
      .single();

    if (error) {
      console.error('Error creating scout:', error);
      return null;
    }

    return data;
  }
};

// Group Service
export const groupService = {
  async getAllGroups() {
    const { data, error } = await supabase
      .from('scout_groups')
      .select(`
        *,
        leader:users!leader_id(first_name, last_name, full_name, email, phone),
        scouts(id, first_name, last_name, age)
      `)
      .order('division', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching groups:', error);
      return [];
    }

    return data;
  },

  async getGroupById(id: string) {
    const { data, error } = await supabase
      .from('scout_groups')
      .select(`
        *,
        leader:users!leader_id(first_name, last_name, full_name, email, phone),
        scouts(id, first_name, last_name, age, gender)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching group:', error);
      return null;
    }

    return data;
  },

  async updateGroup(id: string, updates: any) {
    const { data, error } = await supabase
      .from('scout_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating group:', error);
      return null;
    }

    return data;
  }
};

// Auth Service
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return { error };
    }

    return { error: null };
  },

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};

// Message Service
export const messageService = {
  async getAllMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data;
  },

  async getMessagesByUser(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user messages:', error);
      return [];
    }

    return data;
  },

  async sendMessage(messageData: any) {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  }
};

// Event Service  
export const eventService = {
  async getAllEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return data;
  },

  async createEvent(eventData: any) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return data;
  }
};

// Reports Service
export const reportService = {
  async getScoutProgressReport(scoutId: string) {
    // This would need to be implemented based on your progress tracking system
    // For now, return a basic structure
    return {
      scoutId,
      badges: [],
      attendance: [],
      activities: []
    };
  },

  async getGroupReport(groupId: string) {
    const group = await groupService.getGroupById(groupId);
    const scouts = await scoutService.getScoutsByGroup(groupId);
    
    return {
      group,
      scouts,
      totalScouts: scouts.length,
      averageAge: scouts.reduce((sum, scout) => sum + (scout.age || 0), 0) / scouts.length
    };
  }
};

// Attendance Service
export const attendanceService = {
  async getAttendanceByEvent(eventId: string) {
    // This would need to be implemented based on your attendance tracking system
    return [];
  },

  async markAttendance(attendanceData: any) {
    // This would need to be implemented
    return null;
  }
};
