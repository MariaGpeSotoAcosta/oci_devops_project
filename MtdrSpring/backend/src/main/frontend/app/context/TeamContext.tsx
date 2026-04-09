import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Team, TeamMember, UserRole } from '../types';
import { teamsApi } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
  createTeam: (name: string, description: string) => Promise<Team>;
  joinTeam: (joinCode: string) => Promise<Team>;
  inviteMember: (teamId: string, email: string, role: UserRole) => Promise<void>;
  getTeamById: (teamId: string) => Team | undefined;
  isLoading: boolean;
  refreshTeams: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load teams from API whenever auth state changes
  const refreshTeams = async () => {
    if (!isAuthenticated) {
      setTeams([]);
      setCurrentTeam(null);
      return;
    }
    try {
      const data = await teamsApi.getAll();
      setTeams(data as unknown as Team[]);
      // Keep currentTeam in sync; if it no longer exists, reset it
      if (currentTeam) {
        const still = (data as unknown as Team[]).find(t => t.id === currentTeam.id);
        if (!still) setCurrentTeam(null);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  useEffect(() => {
    refreshTeams();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create Team ────────────────────────────────────────────────

  const createTeam = async (name: string, description: string): Promise<Team> => {
    setIsLoading(true);
    try {
      const response = await teamsApi.create({ name, description });
      // Server returns the full team DTO (members already includes the creator)
      const newTeam = response.team as unknown as Team;
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam(newTeam);
      toast.success(`Group created! Join code: ${response.joinCode}`);
      return newTeam;
    } catch (error) {
      toast.error('Failed to create group');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Join Team ──────────────────────────────────────────────────

  const joinTeam = async (joinCode: string): Promise<Team> => {
    setIsLoading(true);
    try {
      if (!joinCode || joinCode.length !== 6) {
        throw new Error('Join code must be exactly 6 characters');
      }

      const response = await teamsApi.join({ joinCode });

      if (!response.success || !response.team) {
        throw new Error('Group not found');
      }

      // Server returns the team with existing members (before the joining user).
      // Append the current user to avoid a round-trip.
      const currentUserMember: TeamMember = {
        id: user?.id ?? '',
        name: user?.name ?? 'You',
        email: user?.email ?? '',
        avatar: (user?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        role: 'developer',
      };

      const teamWithMe: Team = {
        ...(response.team as unknown as Team),
        members: [...((response.team as unknown as Team).members ?? []), currentUserMember],
      };

      // Check whether we're already in the list (re-joining own team)
      const alreadyInList = teams.some(t => t.id === teamWithMe.id);
      if (alreadyInList) {
        setTeams(prev => prev.map(t => t.id === teamWithMe.id ? teamWithMe : t));
        toast.info('You are already a member of this group');
      } else {
        setTeams(prev => [...prev, teamWithMe]);
        toast.success(`Successfully joined ${teamWithMe.name}!`);
      }

      setCurrentTeam(teamWithMe);
      return teamWithMe;
    } catch (error) {
      toast.error('Failed to join group. Please check the join code.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Invite Member ──────────────────────────────────────────────

  const inviteMember = async (teamId: string, email: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const newMember = await teamsApi.inviteMember(teamId, email, role);
      setTeams(prev =>
        prev.map(team =>
          team.id === teamId
            ? { ...team, members: [...team.members, newMember as unknown as TeamMember] }
            : team
        )
      );
      if (currentTeam?.id === teamId) {
        setCurrentTeam(prev =>
          prev ? { ...prev, members: [...prev.members, newMember as unknown as TeamMember] } : null
        );
      }
      toast.success('Member invited successfully!');
    } catch (error) {
      toast.error('Failed to invite member');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamById = (teamId: string): Team | undefined =>
    teams.find(t => t.id === teamId);

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeam,
        setCurrentTeam,
        createTeam,
        joinTeam,
        inviteMember,
        getTeamById,
        isLoading,
        refreshTeams,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}
