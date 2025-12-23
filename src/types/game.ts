export type RoleType = 'mafia' | 'citizen' | 'doctor' | 'detective' | 'dame';

export interface Role {
  id: RoleType;
  name: string;
  nameCro: string;
  description: string;
  color: string;
  icon: string;
}

export interface Player {
  id: string;
  username: string;
  role?: RoleType;
  isAlive: boolean;
  isMuted: boolean;
  isHost: boolean;
}

export interface GameState {
  phase: 'lobby' | 'night' | 'day' | 'voting' | 'results';
  currentTurn?: RoleType;
  players: Player[];
  gameCode: string;
  mafiaCount: number;
  selectedRoles: RoleType[];
  nightActions: {
    mafiaTarget?: string;
    doctorTarget?: string;
    detectiveTarget?: string;
    dameTarget?: string;
  };
  votes: Record<string, string>;
}

export const ROLES: Record<RoleType, Role> = {
  mafia: {
    id: 'mafia',
    name: 'Mafia',
    nameCro: 'Mafija',
    description: 'Eliminate citizens at night. Win when mafia equals or outnumbers citizens.',
    color: 'hsl(var(--mafia-red))',
    icon: '🔫',
  },
  citizen: {
    id: 'citizen',
    name: 'Citizen',
    nameCro: 'Građanin',
    description: 'Vote wisely during the day to eliminate the mafia.',
    color: 'hsl(var(--citizen-blue))',
    icon: '👤',
  },
  doctor: {
    id: 'doctor',
    name: 'Doctor',
    nameCro: 'Doktor',
    description: 'Choose one player each night to protect from the mafia.',
    color: 'hsl(var(--doctor-green))',
    icon: '💉',
  },
  detective: {
    id: 'detective',
    name: 'Detective',
    nameCro: 'Drot',
    description: 'Investigate one player each night to learn their role.',
    color: 'hsl(var(--detective-purple))',
    icon: '🔍',
  },
  dame: {
    id: 'dame',
    name: 'Dame',
    nameCro: 'Dama',
    description: 'Wakes with mafia. Mute a player. Becomes mafia if mafia is eliminated.',
    color: 'hsl(var(--dame-pink))',
    icon: '💋',
  },
};
