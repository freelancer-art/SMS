import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Poll, PollVote } from '../../src/types';

describe('01 - Happy Path: AGM Resolution Creation & Single Voting', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should create an active AGM resolution poll for democratic society voting', () => {
    const newPoll: Poll = {
      id: 'poll_agm_2026_01',
      SocietyId: MOCK_SOCIETY_A.id,
      Title: 'Approve FY 2026-27 Solar Panel Installation Budget (₹ 15 Lakhs)',
      Description: 'Motion to approve capital expense for installing 50kW Rooftop Solar System to reduce common grid electricity expenses.',
      Category: 'AGM Resolution',
      StartDate: '2026-07-01',
      EndDate: '2026-07-15',
      CreatedBy: 'Admin Committee',
      Status: 'Active',
      TotalEligibleFlats: 120
    };

    dbStore.polls.set(newPoll.id, newPoll);

    const savedPoll = dbStore.polls.get('poll_agm_2026_01');
    expect(savedPoll).toBeDefined();
    expect(savedPoll.Title).toContain('Solar Panel Installation');
    expect(savedPoll.Category).toBe('AGM Resolution');
    expect(savedPoll.Status).toBe('Active');
  });

  test('Should record a single valid ballot vote for flat owner', () => {
    const pollId = 'poll_agm_2026_01';
    const poll: Poll = {
      id: pollId,
      SocietyId: MOCK_SOCIETY_A.id,
      Title: 'Solar Panel Project Approval',
      Description: 'AGM Resolution 114',
      StartDate: '2026-07-01',
      EndDate: '2026-07-15',
      CreatedBy: 'Admin',
      Status: 'Active'
    };
    dbStore.polls.set(pollId, poll);

    // Cast ballot vote for Flat A-101
    const ballot: PollVote = {
      id: `vote_${pollId}_A101`,
      PollId: pollId,
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      VotedBy: 'Rajesh Sharma',
      Vote: 'In Favor',
      SelectedOption: 'In Favor',
      Timestamp: new Date().toISOString()
    };

    dbStore.pollVotes.set(ballot.id, ballot);

    const castVote = dbStore.pollVotes.get(ballot.id);
    expect(castVote).toBeDefined();
    expect(castVote.FlatNo).toBe('A-101');
    expect(castVote.Vote).toBe('In Favor');
    expect(castVote.PollId).toBe(pollId);
  });
});
