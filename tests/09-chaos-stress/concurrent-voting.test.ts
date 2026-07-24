import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Poll, PollVote } from '../../src/types';

describe('09 - Chaos & Stress: Concurrent Poll Voting (Race Condition Test)', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  /**
   * Cast Vote Handler simulating database unique constraint and transaction locking.
   * Key (PollId + FlatNo) enforces EXACTLY 1 vote per flat.
   */
  async function castVoteAtomic(vote: PollVote): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      // Simulate microscopic network/db execution delay
      setTimeout(() => {
        const uniqueKey = `${vote.PollId}_${vote.FlatNo}`;
        
        // Check unique constraint across pollVotes
        const existingVote = Array.from(dbStore.pollVotes.values()).find(
          v => v.PollId === vote.PollId && v.FlatNo === vote.FlatNo
        );

        if (existingVote) {
          reject(new Error('Duplicate Vote: A vote has already been cast for this flat in AGM resolution'));
          return;
        }

        // Lock & Record vote
        dbStore.pollVotes.set(vote.id, vote);
        resolve({ success: true, message: 'Vote recorded successfully' });
      }, Math.floor(Math.random() * 10));
    });
  }

  test('Simulate 20 concurrent vote requests for Flat A-101 simultaneously using Promise.all()', async () => {
    const pollId = 'poll_agm_resolution_2026';
    const poll: Poll = {
      id: pollId,
      SocietyId: MOCK_SOCIETY_A.id,
      Title: 'Annual Solar Rooftop CapEx Resolution',
      Description: 'Authorize ₹ 15L capital expenditure',
      StartDate: '2026-07-01',
      EndDate: '2026-07-30',
      CreatedBy: 'AGM Committee',
      Status: 'Active',
      TotalEligibleFlats: 100
    };
    dbStore.polls.set(pollId, poll);

    // Create 20 concurrent voting attempt promises for Flat A-101
    const CONCURRENCY_COUNT = 20;
    const votePromises = Array.from({ length: CONCURRENCY_COUNT }).map((_, idx) => {
      const ballot: PollVote = {
        id: `vote_attempt_${idx}_${Date.now()}`,
        PollId: pollId,
        SocietyId: MOCK_SOCIETY_A.id,
        FlatNo: 'A-101',
        VotedBy: 'Rajesh Sharma',
        Vote: idx % 2 === 0 ? 'In Favor' : 'Against',
        SelectedOption: idx % 2 === 0 ? 'In Favor' : 'Against',
        Timestamp: new Date().toISOString()
      };
      return castVoteAtomic(ballot);
    });

    // Execute all 20 vote attempts concurrently using Promise.allSettled
    const results = await Promise.allSettled(votePromises);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    // Assert EXACTLY 1 vote was recorded
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(CONCURRENCY_COUNT - 1);

    // Assert that rejected promises threw clean 'Duplicate Vote' error
    rejected.forEach(r => {
      if (r.status === 'rejected') {
        expect(r.reason.message).toContain('Duplicate Vote');
      }
    });

    // Verify database state contains strictly 1 vote record for Flat A-101 in this poll
    const recordedVotes = Array.from(dbStore.pollVotes.values()).filter(
      v => v.PollId === pollId && v.FlatNo === 'A-101'
    );
    expect(recordedVotes.length).toBe(1);
  });
});
