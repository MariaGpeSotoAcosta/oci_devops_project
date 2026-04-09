import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Team, TeamMember, UserRole } from '../types';
import { teams as initialTeams } from '../data/mockData';
import { teamsApi } from '../services/api';
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
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>(() => {
    // Load teams from localStorage or use initial mock data
    const stored = localStorage.getItem('teams');
    return stored ? JSON.parse(stored) : initialTeams;
  });
  const [currentTeam, setCurrentTeam] = useState<Team | null>(() => {
    const stored = localStorage.getItem('currentTeam');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Persist teams to localStorage
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  // Persist current team to localStorage
  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem('currentTeam', JSON.stringify(currentTeam));
    } else {
      localStorage.removeItem('currentTeam');
    }
  }, [currentTeam]);

  const createTeam = async (name: string, description: string): Promise<Team> => {
    setIsLoading(true);
    try {
      // Call API to create team
      const response = await teamsApi.create({ name, description });
      const newTeam = response.team;

      // Add current user as admin member
      const userId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!).id
        : 'user-1';
      const userName = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!).name
        : 'Current User';
      const userEmail = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!).email
        : 'user@example.com';

      const teamWithMember: Team = {
        ...newTeam,
        members: [
          {
            id: userId,
            name: userName,
            email: userEmail,
            avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase(),
            role: 'admin',
          },
        ],
      };

      setTeams(prev => [...prev, teamWithMember]);
      setCurrentTeam(teamWithMember);

      toast.success(`Team created! Join code: ${response.joinCode}`);
      return teamWithMember;
    } catch (error) {
      toast.error('Failed to create team');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const joinTeam = async (joinCode: string): Promise<Team> => {
    setIsLoading(true);
    try {
      // Validate join code format
      if (!joinCode || joinCode.length !== 6) {
        throw new Error('Invalid join code format');
      }

      // Check if team exists in local teams
      const existingTeam = teams.find(t => t.joinCode?.toUpperCase() === joinCode.toUpperCase());

      if (existingTeam) {
        // Check if user is already a member
        const userId = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).id
          : 'user-1';

        const isAlreadyMember = existingTeam.members.some(m => m.id === userId);

        if (isAlreadyMember) {
          toast.info('You are already a member of this team');
          setCurrentTeam(existingTeam);
          return existingTeam;
        }

        // Add current user to the team
        const userName = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).name
          : 'Current User';
        const userEmail = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).email
          : 'user@example.com';

        const newMember: TeamMember = {
          id: userId,
          name: userName,
          email: userEmail,
          avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase(),
          role: 'developer',
        };

        const updatedTeam: Team = {
          ...existingTeam,
          members: [...existingTeam.members, newMember],
        };

        setTeams(prev => prev.map(t => (t.id === updatedTeam.id ? updatedTeam : t)));
        setCurrentTeam(updatedTeam);

        toast.success(`Successfully joined ${updatedTeam.name}!`);
        return updatedTeam;
      }

      // If not found locally, try API
      const response = await teamsApi.join({ joinCode });

      if (response.success && response.team) {
        // Add current user to the team
        const userId = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).id
          : 'user-1';
        const userName = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).name
          : 'Current User';
        const userEmail = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')!).email
          : 'user@example.com';

        const teamWithMember: Team = {
          ...response.team,
          members: [
            ...response.team.members,
            {
              id: userId,
              name: userName,
              email: userEmail,
              avatar: userName.split(' ').map(n => n[0]).join('').toUpperCase(),
              role: 'developer',
            },
          ],
        };

        setTeams(prev => [...prev, teamWithMember]);
        setCurrentTeam(teamWithMember);

        toast.success(`Successfully joined ${teamWithMember.name}!`);
        return teamWithMember;
      }

      throw new Error('Team not found');
    } catch (error) {
      toast.error('Failed to join team. Please check the join code.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async (teamId: string, email: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const newMember = await teamsApi.inviteMember(teamId, email, role);

      setTeams(prev =>
        prev.map(team => {
          if (team.id === teamId) {
            return {
              ...team,
              members: [...team.members, newMember],
            };
          }
          return team;
        })
      );

      // Update current team if it's the one being modified
      if (currentTeam?.id === teamId) {
        setCurrentTeam(prev =>
          prev ? { ...prev, members: [...prev.members, newMember] } : null
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

  const getTeamById = (teamId: string): Team | undefined => {
    return teams.find(t => t.id === teamId);
  };

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
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}
