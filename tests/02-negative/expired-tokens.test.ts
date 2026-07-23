import { MockDatabaseStore, MOCK_SOCIETY_A } from '../setup';
import { Visitor, Poll, PollVote } from '../../src/types';

describe('02 - Negative Test Suite: Expired QR Pass & Double Voting Security', () => {
  let dbStore: MockDatabaseStore;

  beforeEach(() => {
    dbStore = MockDatabaseStore.getInstance();
  });

  test('Should reject entry scan for expired QR gate pass token', () => {
    // Generate pass that expired 10 minutes ago
    const pastExpiration = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const expiredPass: Visitor = {
      id: 'vis_expired_9001',
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      VisitorName: 'Suresh Electrician',
      Purpose: 'Maintenance',
      ContactNo: '+91 98980 12345',
      CheckInTime: new Date().toISOString(),
      Status: 'Pre-Approved',
      AccessToken: 'EXP-QR-990011',
      TokenExpiresAt: pastExpiration
    };

    dbStore.visitors.set(expiredPass.id, expiredPass);

    // Gatekeeper verification function
    const scanVisitorPass = (token: string) => {
      const visitor = Array.from(dbStore.visitors.values()).find(
        v => v.AccessToken === token && v.SocietyId === MOCK_SOCIETY_A.id
      );

      if (!visitor) {
        throw new Error('Access Denied: Invalid visitor token scanned.');
      }

      if (visitor.TokenExpiresAt && new Date(visitor.TokenExpiresAt).getTime() < Date.now()) {
        visitor.Status = 'Denied';
        throw new Error('Access Denied: Visitor pass QR token has expired. Request host resident to reissue pass.');
      }

      return visitor;
    };

    expect(() => scanVisitorPass('EXP-QR-990011')).toThrow(
      'Access Denied: Visitor pass QR token has expired. Request host resident to reissue pass.'
    );

    // Verify visitor record status updated to Denied
    expect(dbStore.visitors.get('vis_expired_9001').Status).toBe('Denied');
  });

  test('Should strictly block double voting attempts for the same flat on AGM Resolution', () => {
    const pollId = 'poll_agm_solar_2026';
    const poll: Poll = {
      id: pollId,
      SocietyId: MOCK_SOCIETY_A.id,
      Title: 'Solar Panel Approval Motion',
      Description: '1-Flat = 1-Vote Policy under Bye-Law 114',
      StartDate: '2026-07-01',
      EndDate: '2026-07-31',
      CreatedBy: 'Secretary',
      Status: 'Active'
    };
    dbStore.polls.set(pollId, poll);

    // First vote cast by Primary Owner of Flat A-101
    const firstVote: PollVote = {
      id: 'vote_1',
      PollId: pollId,
      SocietyId: MOCK_SOCIETY_A.id,
      FlatNo: 'A-101',
      VotedBy: 'Rajesh Sharma (Owner)',
      Vote: 'In Favor',
      Timestamp: new Date(Date.now() - 3600 * 1000).toISOString()
    };
    dbStore.pollVotes.set(firstVote.id, firstVote);

    // Cast vote handler with 1-Flat = 1-Vote Enforcement
    const submitBallotVote = (voterFlatNo: string, voterName: string, voteChoice: 'In Favor' | 'Against' | 'Abstain') => {
      const existingVote = Array.from(dbStore.pollVotes.values()).find(
        v => v.PollId === pollId && v.SocietyId === MOCK_SOCIETY_A.id && v.FlatNo.toLowerCase() === voterFlatNo.toLowerCase()
      );

      if (existingVote) {
        throw new Error(`Voting Rejected: A ballot for Flat '${voterFlatNo}' has already been submitted by ${existingVote.VotedBy} under Bye-Law 114 (1-Flat = 1-Vote Policy).`);
      }

      const voteId = `vote_${Date.now()}`;
      const newBallot: PollVote = {
        id: voteId,
        PollId: pollId,
        SocietyId: MOCK_SOCIETY_A.id,
        FlatNo: voterFlatNo,
        VotedBy: voterName,
        Vote: voteChoice,
        Timestamp: new Date().toISOString()
      };
      dbStore.pollVotes.set(voteId, newBallot);
    };

    // Second vote attempt by Co-Owner of Flat A-101
    expect(() => submitBallotVote('A-101', 'Sunita Sharma (Co-Owner)', 'Against')).toThrow(
      "Voting Rejected: A ballot for Flat 'A-101' has already been submitted by Rajesh Sharma (Owner) under Bye-Law 114 (1-Flat = 1-Vote Policy)."
    );

    // Vote for different flat (A-102) should be accepted
    expect(() => submitBallotVote('A-102', 'Priya Verma', 'In Favor')).not.toThrow();
  });
});
