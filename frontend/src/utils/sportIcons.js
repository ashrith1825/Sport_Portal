import {
  GiAmericanFootballBall,
  GiBaseballBat,
  GiBasketballBall,
  GiBoxingGlove,
  GiCricketBat,
  GiCycling,
  GiGolfFlag,
  GiHockey,
  GiRugbyConversion,
  GiRunningShoe,
  GiShuttlecock,
  GiSkis,
  GiSoccerBall,
  GiSwimfins,
  GiTennisBall,
  GiTrophy,
  GiVolleyballBall,
} from 'react-icons/gi';

export const SPORT_ICON_OPTIONS = [
  { key: 'soccer', label: 'Soccer', Icon: GiSoccerBall },
  { key: 'basketball', label: 'Basketball', Icon: GiBasketballBall },
  { key: 'volleyball', label: 'Volleyball', Icon: GiVolleyballBall },
  { key: 'tennis', label: 'Tennis', Icon: GiTennisBall },
  { key: 'badminton', label: 'Badminton', Icon: GiShuttlecock },
  { key: 'baseball', label: 'Baseball', Icon: GiBaseballBat },
  { key: 'cricket', label: 'Cricket', Icon: GiCricketBat },
  { key: 'rugby', label: 'Rugby', Icon: GiRugbyConversion },
  { key: 'golf', label: 'Golf', Icon: GiGolfFlag },
  { key: 'swimming', label: 'Swimming', Icon: GiSwimfins },
  { key: 'running', label: 'Running', Icon: GiRunningShoe },
  { key: 'cycling', label: 'Cycling', Icon: GiCycling },
  { key: 'hockey', label: 'Hockey', Icon: GiHockey },
  { key: 'boxing', label: 'Boxing', Icon: GiBoxingGlove },
  { key: 'american-football', label: 'American football', Icon: GiAmericanFootballBall },
  { key: 'skiing', label: 'Skiing', Icon: GiSkis },
  { key: 'other', label: 'Other', Icon: GiTrophy },
];

export function inferSportIcon(sportType = '') {
  const normalized = sportType.toLowerCase();
  if (normalized.includes('american football')) return 'american-football';
  if (normalized.includes('football') || normalized.includes('soccer') || normalized.includes('futsal')) return 'soccer';
  if (normalized.includes('badminton')) return 'badminton';
  return SPORT_ICON_OPTIONS.find((option) => normalized.includes(option.label.toLowerCase()))?.key || 'soccer';
}
