import { Team } from '../types/cricket';

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-thunderbolts',
    name: 'Thunderbolts XI',
    shortName: 'TB',
    primaryColor: '#008DDA',
    secondaryColor: '#41B06E',
    logo: '⚡',
    players: [
      { id: 'tb-1', name: 'Zayn Malik', role: 'Batsman', isCaptain: true },
      { id: 'tb-2', name: 'Tariq Aziz', role: 'Batsman' },
      { id: 'tb-3', name: 'Farhan Saeed', role: 'Batsman', isViceCaptain: true },
      { id: 'tb-4', name: 'Hamza Bilal', role: 'Wicketkeeper', isWicketKeeper: true },
      { id: 'tb-5', name: 'Bilal Khan', role: 'All-rounder' },
      { id: 'tb-6', name: 'Saad Rafiq', role: 'All-rounder' },
      { id: 'tb-7', name: 'Daniyal Qureshi', role: 'All-rounder' },
      { id: 'tb-8', name: 'Arshad Nadeem', role: 'Bowler' },
      { id: 'tb-9', name: 'Umar Riaz', role: 'Bowler' },
      { id: 'tb-10', name: 'Haris Rauf', role: 'Bowler' },
      { id: 'tb-11', name: 'Shaheen Shah', role: 'Bowler' },
      { id: 'tb-12', name: 'Ahmad Shah', role: 'Batsman' },
      { id: 'tb-13', name: 'Naveed Akram', role: 'Bowler' },
      { id: 'tb-14', name: 'Khurram Shehzad', role: 'All-rounder' },
    ],
    playingXIIds: [
      'tb-1', 'tb-2', 'tb-3', 'tb-4', 'tb-5',
      'tb-6', 'tb-7', 'tb-8', 'tb-9', 'tb-10', 'tb-11'
    ],
    benchPlayerIds: ['tb-12', 'tb-13', 'tb-14']
  },
  {
    id: 'team-falcons',
    name: 'Falcons United',
    shortName: 'FLC',
    primaryColor: '#F4538A',
    secondaryColor: '#F58634',
    logo: '🦅',
    players: [
      { id: 'flc-1', name: 'Babar Azam', role: 'Batsman', isCaptain: true },
      { id: 'flc-2', name: 'Rizwan Ahmed', role: 'Wicketkeeper', isWicketKeeper: true },
      { id: 'flc-3', name: 'Fakhar Zaman', role: 'Batsman' },
      { id: 'flc-4', name: 'Saim Ayub', role: 'Batsman', isViceCaptain: true },
      { id: 'flc-5', name: 'Iftikhar Ahmed', role: 'All-rounder' },
      { id: 'flc-6', name: 'Shadab Khan', role: 'All-rounder' },
      { id: 'flc-7', name: 'Imad Wasim', role: 'All-rounder' },
      { id: 'flc-8', name: 'Naseem Shah', role: 'Bowler' },
      { id: 'flc-9', name: 'Mohammad Amir', role: 'Bowler' },
      { id: 'flc-10', name: 'Abrar Ahmed', role: 'Bowler' },
      { id: 'flc-11', name: 'Zaman Khan', role: 'Bowler' },
      { id: 'flc-12', name: 'Usman Khan', role: 'Batsman' },
      { id: 'flc-13', name: 'Abbas Afridi', role: 'Bowler' },
      { id: 'flc-14', name: 'Salman Ali Agha', role: 'All-rounder' }
    ],
    playingXIIds: [
      'flc-1', 'flc-2', 'flc-3', 'flc-4', 'flc-5',
      'flc-6', 'flc-7', 'flc-8', 'flc-9', 'flc-10', 'flc-11'
    ],
    benchPlayerIds: ['flc-12', 'flc-13', 'flc-14']
  },
  {
    id: 'team-stallions',
    name: 'Stallions Cricket Club',
    shortName: 'STC',
    primaryColor: '#FFB800',
    secondaryColor: '#1E3E62',
    logo: '🐎',
    players: [
      { id: 'st-1', name: 'Kane Williamson', role: 'Batsman', isCaptain: true },
      { id: 'st-2', name: 'Devon Conway', role: 'Wicketkeeper', isWicketKeeper: true },
      { id: 'st-3', name: 'Daryl Mitchell', role: 'Batsman' },
      { id: 'st-4', name: 'Glenn Phillips', role: 'All-rounder', isViceCaptain: true },
      { id: 'st-5', name: 'Mark Chapman', role: 'Batsman' },
      { id: 'st-6', name: 'Mitchell Santner', role: 'All-rounder' },
      { id: 'st-7', name: 'Michael Bracewell', role: 'All-rounder' },
      { id: 'st-8', name: 'Trent Boult', role: 'Bowler' },
      { id: 'st-9', name: 'Tim Southee', role: 'Bowler' },
      { id: 'st-10', name: 'Matt Henry', role: 'Bowler' },
      { id: 'st-11', name: 'Ish Sodhi', role: 'Bowler' },
      { id: 'st-12', name: 'Lockie Ferguson', role: 'Bowler' },
      { id: 'st-13', name: 'Will Young', role: 'Batsman' }
    ],
    playingXIIds: [
      'st-1', 'st-2', 'st-3', 'st-4', 'st-5',
      'st-6', 'st-7', 'st-8', 'st-9', 'st-10', 'st-11'
    ],
    benchPlayerIds: ['st-12', 'st-13']
  },
  {
    id: 'team-gladiators',
    name: 'Gladiators Premier',
    shortName: 'GLD',
    primaryColor: '#8E44AD',
    secondaryColor: '#E67E22',
    logo: '⚔️',
    players: [
      { id: 'gld-1', name: 'Nicholas Pooran', role: 'Wicketkeeper', isCaptain: true, isWicketKeeper: true },
      { id: 'gld-2', name: 'Shai Hope', role: 'Batsman' },
      { id: 'gld-3', name: 'Shimron Hetmyer', role: 'Batsman', isViceCaptain: true },
      { id: 'gld-4', name: 'Rovman Powell', role: 'Batsman' },
      { id: 'gld-5', name: 'Andre Russell', role: 'All-rounder' },
      { id: 'gld-6', name: 'Jason Holder', role: 'All-rounder' },
      { id: 'gld-7', name: 'Romario Shepherd', role: 'All-rounder' },
      { id: 'gld-8', name: 'Akeal Hosein', role: 'Bowler' },
      { id: 'gld-9', name: 'Alzarri Joseph', role: 'Bowler' },
      { id: 'gld-10', name: 'Gudakesh Motie', role: 'Bowler' },
      { id: 'gld-11', name: 'Obed McCoy', role: 'Bowler' },
      { id: 'gld-12', name: 'Brandon King', role: 'Batsman' },
      { id: 'gld-13', name: 'Roston Chase', role: 'All-rounder' }
    ],
    playingXIIds: [
      'gld-1', 'gld-2', 'gld-3', 'gld-4', 'gld-5',
      'gld-6', 'gld-7', 'gld-8', 'gld-9', 'gld-10', 'gld-11'
    ],
    benchPlayerIds: ['gld-12', 'gld-13']
  }
];
