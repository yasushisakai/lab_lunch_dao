use anchor_lang::prelude::*;
use crate::model::{Group, Topic, Ballot};

#[derive(Accounts)]
pub struct UpdateBallot <'info> {
    #[account(mut, has_one=owner)]
    pub ballot : Account<'info, Ballot>,
    pub owner : Signer<'info>,
    pub group : Account<'info, Group>,
    pub topic : Account<'info, Topic>,
}

pub fn handle(ctx: Context<UpdateBallot>, votes: Vec<bool>) -> Result<()> {
    let group = &ctx.accounts.group;
    let topic = &mut ctx.accounts.topic;
    let ballot = &mut ctx.accounts.ballot;
    require!(!topic.finalized, TopicClosed);
    require!(group.seq_no == topic.seq_no, SeqNoMismatch);
    require!(topic.options.len() == votes.len(), OptionVotesMismatch);
    ballot.approvals = votes;
    Ok(())
}